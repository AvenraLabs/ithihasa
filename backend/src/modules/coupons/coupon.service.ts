import { Coupon } from '../../database/index.js';
import { NotFoundError, ConflictError } from '../../common/errors/index.js';

export class CouponService {
  public async getCoupons(includeInactive = false) {
    return Coupon.findAll({
      where: includeInactive ? {} : { status: 'ACTIVE' },
      order: [['created_at', 'DESC']],
    });
  }

  public async getCouponByCode(code: string) {
    const coupon = await Coupon.findOne({
      where: { code: code.toUpperCase().trim() },
    });
    if (!coupon) throw new NotFoundError('Coupon');
    return coupon;
  }

  public async createCoupon(data: any) {
    const cleanCode = data.code.toUpperCase().trim();
    const existing = await Coupon.findOne({ where: { code: cleanCode } });
    if (existing) throw new ConflictError(`Coupon with code '${cleanCode}' already exists`);

    const rawType = (data.type || '').toUpperCase();
    const type = rawType === 'FLAT' ? 'FIXED' : rawType;

    return Coupon.create({
      code: cleanCode,
      description: data.description || null,
      type: type,
      value: Number(data.value),
      min_order_value: Number(data.minOrderValue ?? data.min_order_value ?? 0),
      max_discount: (data.maxDiscount || data.max_discount) ? Number(data.maxDiscount ?? data.max_discount) : null,
      start_at: data.startAt || data.valid_from ? new Date(data.startAt || data.valid_from) : null,
      expires_at: data.expiresAt || data.valid_until ? new Date(data.expiresAt || data.valid_until) : null,
      usage_limit: (data.usageLimit || data.usage_limit) ? Number(data.usageLimit ?? data.usage_limit) : null,
      per_user_limit: Number(data.perUserLimit ?? data.per_user_limit ?? 1),
      status: data.status || 'ACTIVE',
    });
  }

  public async deleteCoupon(id: string) {
    const coupon = await Coupon.findByPk(id);
    if (!coupon) throw new NotFoundError('Coupon');
    await coupon.destroy();
    return true;
  }

  public async updateCoupon(id: string, data: any) {
    const coupon = await Coupon.findByPk(id);
    if (!coupon) throw new NotFoundError('Coupon');

    if (data.code && data.code.toUpperCase().trim() !== coupon.code) {
      const cleanCode = data.code.toUpperCase().trim();
      const existing = await Coupon.findOne({ where: { code: cleanCode } });
      if (existing) throw new ConflictError(`Coupon with code '${cleanCode}' already exists`);
      coupon.code = cleanCode;
    }

    if (data.description !== undefined) coupon.description = data.description;
    if (data.type !== undefined) coupon.type = data.type;
    if (data.value !== undefined) coupon.value = data.value;
    if (data.minOrderValue !== undefined) coupon.min_order_value = data.minOrderValue;
    if (data.maxDiscount !== undefined) coupon.max_discount = data.maxDiscount;
    if (data.startAt !== undefined) coupon.start_at = data.startAt ? new Date(data.startAt) : null;
    if (data.expiresAt !== undefined) coupon.expires_at = data.expiresAt ? new Date(data.expiresAt) : null;
    if (data.usageLimit !== undefined) coupon.usage_limit = data.usageLimit;
    if (data.perUserLimit !== undefined) coupon.per_user_limit = data.perUserLimit;
    if (data.status !== undefined) coupon.status = data.status;

    await coupon.save();
    return coupon;
  }
}

export const couponService = new CouponService();
