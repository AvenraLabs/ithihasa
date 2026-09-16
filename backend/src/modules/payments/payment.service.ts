import {
  sequelize,
  Payment,
  Order,
  OrderItem,
  OrderStatusHistory,
  Cart,
  CartItem,
  User,
} from '../../database/index.js';
import { phonePeProvider } from '../../integrations/phonepe/phonepe.provider.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { emailProvider } from '../../integrations/email/email.provider.js';
import { NotFoundError, PaymentError } from '../../common/errors/index.js';
import { logger } from '../../common/logger/index.js';

export class PaymentService {
  /**
   * Processes incoming PhonePe S2S Webhook callback
   */
  public async handlePhonePeWebhook(responseBase64: string, xVerifyHeader: string) {
    const { isValid, data } = phonePeProvider.verifyAndDecodeWebhook(responseBase64, xVerifyHeader);

    if (!isValid || !data) {
      logger.error('Invalid PhonePe webhook signature or payload');
      throw new PaymentError('Invalid webhook signature');
    }

    const { merchantTransactionId, transactionId, state, responseCode } = data;

    logger.info(
      { merchantTransactionId, transactionId, state, responseCode },
      '🔔 Processing PhonePe Webhook'
    );

    return this.reconcilePaymentStatus(merchantTransactionId, state, transactionId, data);
  }

  /**
   * Reconciles payment status and executes state transition transactionally
   */
  public async reconcilePaymentStatus(
    merchantTransactionId: string,
    state: 'COMPLETED' | 'FAILED' | 'PENDING',
    providerReferenceId?: string,
    rawPayload?: Record<string, unknown>
  ) {
    const payment = await Payment.findOne({
      where: { merchant_transaction_id: merchantTransactionId },
      include: [
        {
          model: Order,
          as: 'order',
          include: [{ model: OrderItem, as: 'items' }],
        },
      ],
    });

    if (!payment) {
      logger.error({ merchantTransactionId }, 'Payment record not found for webhook transaction');
      throw new NotFoundError(`Payment ${merchantTransactionId}`);
    }

    const order = (payment as any).order as Order;
    if (!order) throw new NotFoundError('Order associated with payment');

    // Idempotency check: if already processed, return current status
    if (payment.status === 'SUCCESS' && state === 'COMPLETED') {
      return { status: 'SUCCESS', orderId: order.id, orderNumber: order.order_number };
    }

    const result = await sequelize.transaction(async (t) => {
      payment.raw_response = rawPayload || null;
      if (providerReferenceId) payment.provider_reference_id = providerReferenceId;

      if (state === 'COMPLETED') {
        payment.status = 'SUCCESS';
        await payment.save({ transaction: t });

        order.status = 'PAID';
        await order.save({ transaction: t });

        await OrderStatusHistory.create(
          {
            order_id: order.id,
            from_status: 'PENDING_PAYMENT',
            to_status: 'PAID',
            actor: 'PHONEPE_GATEWAY',
            reason: `Payment completed successfully. Txn Ref: ${providerReferenceId}`,
          },
          { transaction: t }
        );

        // Permanently commit reserved inventory as sold
        if ((order as any).items) {
          const saleItems = (order as any).items.map((it: any) => ({
            variantId: it.variant_id,
            quantity: it.quantity,
          }));
          await inventoryService.commitSale(saleItems, order.order_number, t);
        }

        // Clear the user's active cart — only done on confirmed payment success
        const userCart = await Cart.findOne({
          where: { user_id: order.user_id, status: 'ACTIVE' },
          transaction: t,
        });
        if (userCart) {
          await CartItem.destroy({
            where: { cart_id: userCart.id },
            transaction: t,
          });
          logger.info({ orderId: order.id, cartId: userCart.id }, 'Cart cleared after successful payment');
        }
      } else if (state === 'FAILED') {
        payment.status = 'FAILED';
        await payment.save({ transaction: t });

        order.status = 'CANCELLED';
        await order.save({ transaction: t });

        await OrderStatusHistory.create(
          {
            order_id: order.id,
            from_status: 'PENDING_PAYMENT',
            to_status: 'CANCELLED',
            actor: 'PHONEPE_GATEWAY',
            reason: 'Payment failed at gateway',
          },
          { transaction: t }
        );

        // Release reserved inventory
        if ((order as any).items) {
          const releaseItems = (order as any).items.map((it: any) => ({
            variantId: it.variant_id,
            quantity: it.quantity,
          }));
          await inventoryService.releaseStock(releaseItems, order.order_number, t);
        }
      }

      return {
        status: payment.status,
        orderId: order.id,
        orderNumber: order.order_number,
      };
    });

    // If payment completed successfully, dispatch Order Confirmation email to patron via Zoho SMTP
    if (state === 'COMPLETED' && payment.status === 'SUCCESS') {
      try {
        const fullOrder = await Order.findByPk(order.id, {
          include: [
            { model: User, as: 'user', attributes: ['name', 'email'] },
            { model: OrderItem, as: 'items' },
          ],
        });

        const customerEmail = (fullOrder as any)?.user?.email;
        if (customerEmail) {
          const itemsPayload = ((fullOrder as any)?.items || []).map((it: any) => ({
            productName: it.product_name,
            variantName: it.variant_name,
            quantity: it.quantity,
            unitPrice: it.unit_price,
            total: it.total,
          }));

          emailProvider
            .sendOrderConfirmationEmail({
              email: customerEmail,
              orderNumber: fullOrder?.order_number || order.order_number,
              totalAmount: Number(fullOrder?.total_amount || order.total_amount),
              currency: fullOrder?.currency || order.currency,
              items: itemsPayload,
              shippingAddress: fullOrder?.shipping_address || order.shipping_address,
              customerName: (fullOrder as any)?.user?.name,
            })
            .catch((err) => {
              logger.warn({ err: err.message, orderId: order.id }, 'Background order confirmation email dispatch notice');
            });
        } else {
          logger.info({ orderId: order.id }, 'Customer has no email address on file. Skipped order confirmation email.');
        }
      } catch (emailErr: any) {
        logger.warn({ err: emailErr.message, orderId: order.id }, 'Failed to initiate order confirmation email');
      }
    }

    return result;
  }

  /**
   * Active polling status check from PhonePe S2S API for order confirmation page
   */
  public async checkOrderStatus(orderId: string) {
    const payment = await Payment.findOne({
      where: { order_id: orderId },
      order: [['created_at', 'DESC']],
    });

    if (!payment) throw new NotFoundError('Payment for Order');

    if (payment.status === 'SUCCESS') {
      return { status: 'SUCCESS', paymentId: payment.id };
    }

    try {
      const statusResponse = await phonePeProvider.checkStatus(payment.merchant_transaction_id);
      if (statusResponse.data) {
        return this.reconcilePaymentStatus(
          payment.merchant_transaction_id,
          statusResponse.data.state,
          statusResponse.data.transactionId,
          statusResponse.data as any
        );
      }
    } catch (error) {
      logger.warn({ err: error, orderId }, 'PhonePe live status poll failed');
    }

    return { status: payment.status, paymentId: payment.id };
  }
}

export const paymentService = new PaymentService();
