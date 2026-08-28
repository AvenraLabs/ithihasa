import { apiClient } from './client.js';

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minimumOrderAmount: number;
  maxDiscountAmount?: number | null;
  description?: string | null;
  validUntil: string;
}

export function normalizeCoupon(c: any): Coupon {
  return {
    id: c.id,
    code: c.code,
    discountType: c.discountType ?? c.discount_type,
    discountValue: Number(c.discountValue ?? c.discount_value ?? 0),
    minimumOrderAmount: Number(c.minimumOrderAmount ?? c.min_order_amount ?? 0),
    maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : null,
    description: c.description ?? null,
    validUntil: c.validUntil ?? c.expires_at ?? '',
  };
}

export async function validateCoupon(code: string): Promise<Coupon> {
  const raw = await apiClient<any>(`/coupons/${encodeURIComponent(code.trim().toUpperCase())}`);
  return normalizeCoupon(raw);
}
