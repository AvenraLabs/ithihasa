import { z } from 'zod';

export const createAddressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian phone number required'),
  line1: z.string().min(3, 'Address line 1 is required'),
  line2: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^\d{6}$/, 'Valid 6-digit Indian PIN code required'),
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();
