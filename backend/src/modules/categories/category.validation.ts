import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens'),
  description: z.string().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().default(0),
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export const updateCategorySchema = createCategorySchema.partial();
