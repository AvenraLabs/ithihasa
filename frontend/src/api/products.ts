import { apiClient } from './client.js';

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color?: string | null;
  price: number;
  compareAtPrice?: number | null;
  availableStock: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  basePrice: number;
  compareAtPrice?: number | null;
  currency: string;
  featured: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductFilters {
  categorySlug?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'featured' | string;
  page?: number;
  limit?: number;
}

export function normalizeProduct(p: any): Product {
  return {
    ...p,
    basePrice: Number(p.basePrice ?? p.base_price ?? 0),
    compareAtPrice: p.compareAtPrice ?? (p.compare_at_price ? Number(p.compare_at_price) : null),
    images: (p.images || []).map((img: any) => ({
      ...img,
      isPrimary: img.isPrimary ?? img.is_primary ?? false,
      altText: img.altText ?? img.alt_text ?? null,
      sortOrder: img.sortOrder ?? img.sort_order ?? 0,
    })),
    variants: (p.variants || []).map((v: any) => ({
      ...v,
      price: Number(v.price ?? 0),
      compareAtPrice: v.compareAtPrice ?? (v.compare_at_price ? Number(v.compare_at_price) : null),
      availableStock: Number(v.availableStock ?? v.inventory?.available ?? 0),
    })),
  };
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters.categorySlug) params.append('categorySlug', filters.categorySlug);
  if (filters.featured !== undefined) params.append('featured', String(filters.featured));
  if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
  if (filters.size) params.append('size', filters.size);
  if (filters.color) params.append('color', filters.color);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const query = params.toString() ? `?${params.toString()}` : '';
  const rawProducts = await apiClient<any[]>(`/products${query}`);
  return rawProducts.map(normalizeProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const raw = await apiClient<any>(`/products/${slug}`);
  return normalizeProduct(raw);
}
