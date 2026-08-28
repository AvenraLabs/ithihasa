import { env } from '../../config/env.js';
import { Coupon, CouponRedemption } from '../../database/index.js';
import { BusinessRuleError } from '../../common/errors/index.js';
import { PricingItem, PricingQuote } from './pricing.types.js';

export class PricingService {
  /**
   * Calculates the authoritative quote for a list of items and optional coupon code
   */
  public async calculateQuote(
    items: PricingItem[],
    couponCode?: string | null,
    userId?: string | null
  ): Promise<PricingQuote> {
    if (!items || items.length === 0) {
      return {
        items: [],
        subtotal: 0,
        discountAmount: 0,
        couponCode: null,
        couponApplied: null,
        shippingAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
        currency: env.CURRENCY,
      };
    }

    // 1. Calculate Items Subtotal
    let subtotal = 0;
    const computedItems = items.map((item) => {
      const lineTotal = Number(item.unitPrice) * item.quantity;
      subtotal += lineTotal;
      return {
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(lineTotal.toFixed(2)),
      };
    });

    subtotal = Number(subtotal.toFixed(2));

    // 2. Validate and Calculate Coupon Discount
    let discountAmount = 0;
    let couponApplied: PricingQuote['couponApplied'] = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        where: {
          code: couponCode.toUpperCase().trim(),
          status: 'ACTIVE',
        },
      });

      if (!coupon) {
        throw new BusinessRuleError(`Coupon '${couponCode}' is invalid or inactive`);
      }

      const now = new Date();
      if (coupon.start_at && coupon.start_at > now) {
        throw new BusinessRuleError(`Coupon '${coupon.code}' is not yet active`);
      }
      if (coupon.expires_at && coupon.expires_at < now) {
        throw new BusinessRuleError(`Coupon '${coupon.code}' has expired`);
      }

      if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
        throw new BusinessRuleError(`Coupon '${coupon.code}' usage limit has been reached`);
      }

      if (subtotal < Number(coupon.min_order_value)) {
        throw new BusinessRuleError(
          `Minimum order value of ₹${coupon.min_order_value} required for coupon '${coupon.code}'`
        );
      }

      if (userId) {
        const userRedemptionsCount = await CouponRedemption.count({
          where: { coupon_id: coupon.id, user_id: userId },
        });
        if (userRedemptionsCount >= coupon.per_user_limit) {
          throw new BusinessRuleError(`You have already used coupon '${coupon.code}' the maximum allowed times`);
        }
      }

      if (coupon.type === 'PERCENTAGE') {
        discountAmount = (subtotal * Number(coupon.value)) / 100;
        if (coupon.max_discount && discountAmount > Number(coupon.max_discount)) {
          discountAmount = Number(coupon.max_discount);
        }
      } else {
        discountAmount = Math.min(subtotal, Number(coupon.value));
      }

      discountAmount = Number(discountAmount.toFixed(2));
      couponApplied = {
        code: coupon.code,
        description: coupon.description,
        discount: discountAmount,
      };
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    // 3. Calculate Shipping
    let shippingAmount = env.DEFAULT_SHIPPING_FEE;
    if (env.FREE_SHIPPING_THRESHOLD > 0 && discountedSubtotal >= env.FREE_SHIPPING_THRESHOLD) {
      shippingAmount = 0;
    }

    // 4. Calculate Tax (Indian App default: 0% / Tax-inclusive)
    const taxAmount = Number(((discountedSubtotal * env.TAX_RATE) / 100).toFixed(2));

    // 5. Calculate Final Order Total
    const totalAmount = Number((discountedSubtotal + shippingAmount + taxAmount).toFixed(2));

    return {
      items: computedItems,
      subtotal,
      discountAmount,
      couponCode: couponApplied?.code || null,
      couponApplied,
      shippingAmount,
      taxAmount,
      totalAmount,
      currency: env.CURRENCY,
    };
  }
}

export const pricingService = new PricingService();
