import {
  sequelize,
  Payment,
  Order,
  OrderItem,
  OrderStatusHistory,
} from '../../database/index.js';
import { phonePeProvider } from '../../integrations/phonepe/phonepe.provider.js';
import { inventoryService } from '../inventory/inventory.service.js';
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

    return sequelize.transaction(async (t) => {
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
