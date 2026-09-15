import { apiClient } from './client.js';

export interface Coupon {
  id?: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FIXED_AMOUNT' | 'FLAT';
  discountValue: number;
  minimumOrderAmount: number;
  maxDiscountAmount?: number | null;
  description?: string | null;
  validUntil?: string;
}

export function normalizeCoupon(c: any): Coupon {
  return {
    id: c.id,
    code: c.code,
    discountType: c.type ?? c.discountType ?? c.discount_type ?? 'FIXED',
    discountValue: Number(c.value ?? c.discountValue ?? c.discount_value ?? 0),
    minimumOrderAmount: Number(c.minOrderValue ?? c.min_order_value ?? c.minimumOrderAmount ?? c.min_order_amount ?? 0),
    maxDiscountAmount: (c.maxDiscount ?? c.max_discount ?? c.maxDiscountAmount) != null
      ? Number(c.maxDiscount ?? c.max_discount ?? c.maxDiscountAmount)
      : null,
    description: c.description ?? null,
    validUntil: c.validUntil ?? c.expires_at ?? c.expiresAt ?? '',
  };
}

export async function validateCoupon(code: string): Promise<Coupon> {
  const raw = await apiClient<any>(`/coupons/${encodeURIComponent(code.trim().toUpperCase())}`);
  return normalizeCoupon(raw);
}
