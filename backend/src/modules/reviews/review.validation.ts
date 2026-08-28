import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().uuid('Valid Product UUID required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().optional().nullable(),
  comment: z.string().min(5, 'Review comment must be at least 5 characters'),
});
