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

const CMS_STORAGE_KEY = 'ithihasa_storefront_cms';

export function getCachedStorefrontData(): StorefrontConfig | undefined {
  try {
    const saved = localStorage.getItem(CMS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : undefined;
  } catch {
    return undefined;
  }
}

export async function fetchStorefrontData(): Promise<StorefrontConfig> {
  const data = await apiClient<StorefrontConfig>('/merchandising/storefront');
  if (data) {
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }
  return data;
}
