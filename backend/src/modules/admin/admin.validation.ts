import { z } from 'zod';

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING_PAYMENT',
    'PAID',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURN_REQUESTED',
    'RETURNED',
    'REFUNDED',
  ]),
  reason: z.string().min(3, 'Reason is required for admin status updates'),
});

export const updateReturnStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'ITEM_RECEIVED', 'REFUND_ISSUED', 'CANCELLED']),
  adminNotes: z.string().optional().nullable(),
});

export const issueRefundSchema = z.object({
  returnId: z.string().uuid().optional().nullable(),
  reason: z.string().min(3, 'Refund reason required'),
  amount: z.number().positive().optional(),
});
