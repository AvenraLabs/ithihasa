import { z } from 'zod';

export const checkoutQuoteSchema = z.object({
  couponCode: z.string().optional().nullable(),
});

export const initiateCheckoutSchema = z.object({
  shippingAddressId: z.string().uuid('Valid shipping address UUID is required'),
  couponCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  idempotencyKey: z.string().min(8, 'Idempotency key required').optional(),
});
