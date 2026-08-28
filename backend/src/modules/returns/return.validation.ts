import { z } from 'zod';

export const createReturnRequestSchema = z.object({
  orderId: z.string().uuid('Valid Order UUID required'),
  reason: z.string().min(3, 'Reason is required'),
  customerComments: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        orderItemId: z.string().uuid('Valid Order Item UUID required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        reason: z.string().optional().nullable(),
      })
    )
    .min(1, 'At least one item must be selected for return'),
});
