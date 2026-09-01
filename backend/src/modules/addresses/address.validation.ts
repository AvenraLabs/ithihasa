import { z } from 'zod';

export const createAddressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, '').slice(-10))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: 'Valid 10-digit phone number required',
    }),
  line1: z.string().min(3, 'Address line 1 is required'),
  line2: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => /^\d{6}$/.test(val), {
      message: 'Valid 6-digit PIN code required',
    }),
  country: z.string().optional().default('India'),
  isDefaultShipping: z.boolean().optional().default(true),
  isDefaultBilling: z.boolean().optional().default(true),
});

export const updateAddressSchema = createAddressSchema.partial();
