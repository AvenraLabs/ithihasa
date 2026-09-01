import { apiClient } from './client.js';

export interface StorefrontConfig {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
  };
  showHighlighted?: boolean;
  highlightedItems: {
    id: string;
    title: string;
    categoryTag: string;
    price: number;
    imageUrl: string;
    slug: string;
  }[];
  trendingCollections: {
    name: string;
    slug: string;
    itemCount: number;
    imageUrl: string;
  }[];
  quickQueryTags?: {
    label: string;
    query: string;
  }[];
}

export async function fetchStorefrontData(): Promise<StorefrontConfig> {
  return apiClient<StorefrontConfig>('/merchandising/storefront');
}
