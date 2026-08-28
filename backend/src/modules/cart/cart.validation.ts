import { z } from 'zod';

export const addToCartSchema = z.object({
  variantId: z.string().uuid('Valid Variant UUID required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
});

export const mergeCartSchema = z.object({
  guestSessionId: z.string().min(1, 'Guest session ID is required'),
});
