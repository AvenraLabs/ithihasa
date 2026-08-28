import { v4 as uuidv4 } from 'uuid';
import {
  sequelize,
  Order,
  OrderItem,
  OrderStatusHistory,
  Address,
  Cart,
  CartItem,
  ProductVariant,
  Product,
  ProductImage,
  Coupon,
  CouponRedemption,
  Payment,
  User,
} from '../../database/index.js';
import { pricingService } from '../pricing/pricing.service.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { phonePeProvider } from '../../integrations/phonepe/phonepe.provider.js';
import {
  BusinessRuleError,
  NotFoundError,
  InventoryError,
} from '../../common/errors/index.js';
import { logger } from '../../common/logger/index.js';

export class CheckoutService {
  /**
   * Generates a unique user-friendly Order Number, e.g., "ITH-2026-987654"
   */
  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `ITH-${year}-${random}`;
  }

  /**
   * Initiates checkout, creates order in PENDING_PAYMENT, reserves stock atomically, and creates PhonePe payment session
   */
  public async initiateCheckout(userId: string, data: {
    shippingAddressId: string;
    couponCode?: string | null;
    notes?: string | null;
    idempotencyKey?: string | null;
  }) {
    // 1. Check Idempotency
    if (data.idempotencyKey) {
      const existingOrder = await Order.findOne({
        where: { idempotency_key: data.idempotencyKey, user_id: userId },
        include: [{ model: Payment, as: 'payments' }],
      });

      if (existingOrder) {
        const latestPayment = (existingOrder as any).payments?.[0];
        if (latestPayment && existingOrder.status === 'PENDING_PAYMENT') {
          return {
            orderId: existingOrder.id,
            orderNumber: existingOrder.order_number,
            totalAmount: Number(existingOrder.total_amount),
            currency: existingOrder.currency,
            redirectUrl: latestPayment.raw_response?.redirectUrl || null,
          };
        }
      }
    }

    // 2. Fetch User & Shipping Address
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User');

    const address = await Address.findOne({
      where: { id: data.shippingAddressId, user_id: userId },
    });
    if (!address) throw new NotFoundError('Shipping Address');

    // 3. Fetch Cart Items
    const cart = await Cart.findOne({
      where: { user_id: userId, status: 'ACTIVE' },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: ProductVariant,
              as: 'variant',
              include: [
                {
                  model: Product,
                  as: 'product',
                  include: [
                    {
                      model: ProductImage,
                      as: 'images',
                      attributes: ['url', 'is_primary'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const cartItems = (cart as any)?.items;
    if (!cart || !cartItems || cartItems.length === 0) {
      throw new BusinessRuleError('Your bag is empty. Please add items to checkout.');
    }

    // 4. Build Pricing Items
    const pricingItems = cartItems.map((ci: any) => {
      const variant = ci.variant;
      const product = variant?.product;
      const primaryImage =
        product?.images?.find((img: any) => img.is_primary)?.url ||
        product?.images?.[0]?.url ||
        null;

      return {
        variantId: ci.variant_id,
        unitPrice: Number(variant?.price || ci.unit_price),
        quantity: ci.quantity,
        productName: product?.name || 'Item',
        variantName: `Size: ${variant?.size || 'Standard'}${variant?.color ? ` / Color: ${variant.color}` : ''}`,
        sku: variant?.sku || '',
        imageUrl: primaryImage,
      };
    });

    // 5. Calculate Final Pricing Quote (Server Authoritative)
    const quote = await pricingService.calculateQuote(pricingItems, data.couponCode, userId);

    const orderNumber = this.generateOrderNumber();
    const merchantTxnId = `TXN_${orderNumber.replace(/-/g, '_')}_${Date.now()}`;

    // 6. Execute Transactional Order Creation and Atomic Inventory Reservation
    const result = await sequelize.transaction(async (t) => {
      // A. Atomically Reserve Inventory
      const reservationItems = pricingItems.map((pi: any) => ({
        variantId: pi.variantId,
        quantity: pi.quantity,
      }));
      await inventoryService.reserveStock(reservationItems, orderNumber, t);

      // B. Create Order Record
      const order = await Order.create(
        {
          order_number: orderNumber,
          user_id: userId,
          status: 'PENDING_PAYMENT',
          subtotal: quote.subtotal,
          discount_amount: quote.discountAmount,
          coupon_code: quote.couponCode || null,
          shipping_amount: quote.shippingAmount,
          tax_amount: quote.taxAmount,
          total_amount: quote.totalAmount,
          currency: quote.currency,
          shipping_address: address.toJSON() as unknown as Record<string, unknown>,
          notes: data.notes || null,
          idempotency_key: data.idempotencyKey || null,
        },
        { transaction: t }
      );

      // C. Create Order Item Snapshots
      const orderItemPayloads = quote.items.map((item) => ({
        order_id: order.id,
        product_id: cartItems.find((ci: any) => ci.variant_id === item.variantId)?.variant?.product_id,
        variant_id: item.variantId,
        sku: item.sku,
        product_name: item.productName,
        variant_name: item.variantName,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        total: item.subtotal,
        image_url: item.imageUrl,
      }));

      await OrderItem.bulkCreate(orderItemPayloads, { transaction: t });

      // D. Record Order Status History
      await OrderStatusHistory.create(
        {
          order_id: order.id,
          from_status: null,
          to_status: 'PENDING_PAYMENT',
          actor: 'CUSTOMER',
          reason: 'Checkout initiated by customer',
        },
        { transaction: t }
      );

      // E. Record Coupon Redemption if coupon was applied
      if (quote.couponApplied) {
        const coupon = await Coupon.findOne({
          where: { code: quote.couponApplied.code },
          transaction: t,
        });
        if (coupon) {
          await CouponRedemption.create(
            {
              coupon_id: coupon.id,
              user_id: userId,
              order_id: order.id,
              discount_applied: quote.couponApplied.discount,
            },
            { transaction: t }
          );

          coupon.times_used += 1;
          await coupon.save({ transaction: t });
        }
      }

      // F. Create Initial Payment Record
      await Payment.create(
        {
          order_id: order.id,
          provider: 'PHONEPE',
          merchant_transaction_id: merchantTxnId,
          amount: quote.totalAmount,
          currency: quote.currency,
          status: 'INITIATED',
        },
        { transaction: t }
      );

      // G. Empty User Cart
      await CartItem.destroy({
        where: { cart_id: cart.id },
        transaction: t,
      });

      return {
        order,
      };
    });

    // 7. Initiate Payment via PhonePe Gateway
    try {
      const phonePeSession = await phonePeProvider.initiatePayment({
        transactionId: merchantTxnId,
        userId: userId,
        amountInRupees: quote.totalAmount,
        phone: user.phone || address.phone,
      });

      // Update payment raw response with redirect URL
      await Payment.update(
        { raw_response: { redirectUrl: phonePeSession.redirectUrl } },
        { where: { merchant_transaction_id: merchantTxnId } }
      );

      return {
        orderId: result.order.id,
        orderNumber: result.order.order_number,
        totalAmount: Number(result.order.total_amount),
        currency: result.order.currency,
        redirectUrl: phonePeSession.redirectUrl,
        merchantTransactionId: merchantTxnId,
      };
    } catch (error) {
      logger.error({ err: error, orderId: result.order.id }, 'PhonePe initiation failed post order creation');
      // If external gateway fails to generate payment session, cancel order and release reservation
      await result.order.update({ status: 'CANCELLED' });
      const reservationItems = pricingItems.map((pi: any) => ({
        variantId: pi.variantId,
        quantity: pi.quantity,
      }));
      await inventoryService.releaseStock(reservationItems, result.order.order_number);
      throw error;
    }
  }
}

export const checkoutService = new CheckoutService();
