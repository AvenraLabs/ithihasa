import { z } from 'zod';

export const adjustInventorySchema = z.object({
  variantId: z.string().uuid('Valid Variant UUID required'),
  quantity: z.number().int().refine((q) => q !== 0, 'Quantity adjustment cannot be zero'),
  type: z.enum(['ADJUSTMENT', 'RESTOCK', 'DAMAGE', 'RETURN']),
  reason: z.string().min(3, 'Reason is required for inventory adjustments'),
});
