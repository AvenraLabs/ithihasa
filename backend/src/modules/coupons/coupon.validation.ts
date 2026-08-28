import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').regex(/^[A-Z0-9_-]+$/i, 'Invalid coupon code format'),
  description: z.string().optional().nullable(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive('Value must be positive'),
  minOrderValue: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional().nullable(),
  startAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().min(1).default(1),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateCouponSchema = createCouponSchema.partial();
