import { apiClient } from './client.js';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  productCount?: number;
}

export async function fetchCategories(): Promise<Category[]> {
  return apiClient<Category[]>('/categories');
}
