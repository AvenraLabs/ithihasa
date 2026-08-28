import { z } from 'zod';

export const toggleWishlistSchema = z.object({
  productId: z.string().uuid('Valid Product UUID required'),
  variantId: z.string().uuid('Valid Variant UUID required').optional().nullable(),
});
