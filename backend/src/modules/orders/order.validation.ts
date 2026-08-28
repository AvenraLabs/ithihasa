import { z } from 'zod';

export const listOrdersQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(3, 'Reason is required for order cancellation'),
});
