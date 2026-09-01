import { z } from 'zod';

export const listProductsQuerySchema = z.object({
  category: z.string().optional(),
  categorySlug: z.string().optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v !== undefined ? v === 'true' : undefined)),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  size: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'featured']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
});

export const createProductVariantSchema = z.object({
  sku: z.string().min(2, 'SKU is required'),
  size: z.string().min(1, 'Size is required'),
  color: z.string().optional().nullable(),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional().nullable(),
  barcode: z.string().optional().nullable(),
  initialStock: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens'),
  description: z.string().min(10, 'Description is required'),
  shortDescription: z.string().optional().nullable(),
  categoryId: z.string().uuid('Valid Category UUID required'),
  basePrice: z.number().positive('Base price must be positive'),
  compareAtPrice: z.number().positive().optional().nullable(),
  featured: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional().nullable(),
  images: z
    .array(
      z.object({
        url: z.string().url('Valid image URL required'),
        altText: z.string().optional().nullable(),
        sortOrder: z.number().int().default(0),
        isPrimary: z.boolean().default(false),
      })
    )
    .optional(),
  variants: z.array(createProductVariantSchema).min(1, 'At least one variant (e.g. size/SKU) is required'),
});

export const updateProductSchema = createProductSchema.partial();
