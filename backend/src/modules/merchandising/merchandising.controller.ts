import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../common/utils/response.js';

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

// Persistent state configured via Adminpanel Storefront CMS
let activeStorefrontConfig: StorefrontConfig = {
  hero: {
    title: 'The Heritage Collection',
    subtitle: 'Wear Your Legacy.',
    description: 'Quiet luxury handcrafted for timeless dignity.',
    imageUrl: '',
    ctaText: 'EXPLORE COLLECTION',
    ctaLink: '/shop'
  },
  showHighlighted: true,
  highlightedItems: [],
  trendingCollections: [],
  quickQueryTags: [
    { label: 'Silk Shirts', query: 'silk shirt' },
    { label: 'Heritage Kurtas', query: 'kurta' },
    { label: 'Bandhgalas', query: 'bandhgala' },
    { label: 'Pashmina', query: 'pashmina' }
  ]
};

export class MerchandisingController {
  // Public endpoint for customer web & PWA
  public getStorefront(req: Request, res: Response, next: NextFunction): void {
    try {
      sendSuccess(res, activeStorefrontConfig, 200);
    } catch (error) {
      next(error);
    }
  }

  // Admin-protected endpoint for CMS management
  public updateStorefront(req: Request, res: Response, next: NextFunction): void {
    try {
      const { hero, showHighlighted, highlightedItems, trendingCollections, quickQueryTags } = req.body;
      if (hero) {
        activeStorefrontConfig.hero = {
          ...activeStorefrontConfig.hero,
          ...hero
        };
      }
      if (typeof showHighlighted === 'boolean') {
        activeStorefrontConfig.showHighlighted = showHighlighted;
      }
      if (highlightedItems && Array.isArray(highlightedItems)) {
        activeStorefrontConfig.highlightedItems = highlightedItems;
      }
      if (trendingCollections && Array.isArray(trendingCollections)) {
        activeStorefrontConfig.trendingCollections = trendingCollections;
      }
      if (quickQueryTags && Array.isArray(quickQueryTags)) {
        activeStorefrontConfig.quickQueryTags = quickQueryTags;
      }

      sendSuccess(res, activeStorefrontConfig, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const merchandisingController = new MerchandisingController();
