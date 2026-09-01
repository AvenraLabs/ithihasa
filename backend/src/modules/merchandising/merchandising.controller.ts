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
}

// In-memory persistent state initialized with Ithihasa luxury defaults
let activeStorefrontConfig: StorefrontConfig = {
  hero: {
    title: 'The Heritage Collection',
    subtitle: 'Wear Your Legacy.',
    description: 'Quiet luxury handcrafted for timeless dignity. Royal Indian silhouettes woven with pure mulberry silks and antique brushed gold accents.',
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=2000&q=85',
    ctaText: 'EXPLORE COLLECTION',
    ctaLink: '/shop'
  },
  highlightedItems: [
    {
      id: 'h1',
      title: 'Kanchipuram Heirloom Silk Saree',
      categoryTag: 'Heritage Saree',
      price: 34500,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      slug: 'kanchipuram-heirloom-silk-saree'
    },
    {
      id: 'h2',
      title: 'Imperial Velvet Bandhgala Jacket',
      categoryTag: 'Bandhgalas & Jackets',
      price: 48000,
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      slug: 'imperial-velvet-bandhgala-jacket'
    }
  ],
  trendingCollections: [
    {
      name: 'Heritage Kurtas',
      slug: 'heritage-kurtas',
      itemCount: 14,
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Bandhgalas & Jackets',
      slug: 'bandhgalas-jackets',
      itemCount: 8,
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Royal Shawls & Stoles',
      slug: 'royal-shawls-stoles',
      itemCount: 12,
      imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Atelier Bespoke',
      slug: 'atelier-bespoke',
      itemCount: 6,
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80'
    }
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
      const { hero, highlightedItems, trendingCollections } = req.body;
      if (hero) {
        activeStorefrontConfig.hero = {
          ...activeStorefrontConfig.hero,
          ...hero
        };
      }
      if (highlightedItems && Array.isArray(highlightedItems)) {
        activeStorefrontConfig.highlightedItems = highlightedItems;
      }
      if (trendingCollections && Array.isArray(trendingCollections)) {
        activeStorefrontConfig.trendingCollections = trendingCollections;
      }

      sendSuccess(res, activeStorefrontConfig, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const merchandisingController = new MerchandisingController();
