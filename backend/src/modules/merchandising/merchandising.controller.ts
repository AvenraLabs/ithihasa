import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { sendSuccess } from '../../common/utils/response.js';
import { cleanupUploadedFile } from '../../common/utils/file-cleanup.js';

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

const CONFIG_FILE = path.join(process.cwd(), 'uploads', 'storefront_config.json');

const DEFAULT_CONFIG: StorefrontConfig = {
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
  quickQueryTags: []
};

function loadPersistedConfig(): StorefrontConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Storefront CMS] Error reading config file, using memory default:', err);
  }
  return DEFAULT_CONFIG;
}

function savePersistedConfig(config: StorefrontConfig): void {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Storefront CMS] Error saving config to disk:', err);
  }
}

// Persistent state configured via Adminpanel Storefront CMS
let activeStorefrontConfig: StorefrontConfig = loadPersistedConfig();

export class MerchandisingController {
  // Public endpoint for customer web & PWA
  public getStorefront(req: Request, res: Response, next: NextFunction): void {
    try {
      activeStorefrontConfig = loadPersistedConfig();
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
        if (hero.imageUrl && activeStorefrontConfig.hero.imageUrl && hero.imageUrl !== activeStorefrontConfig.hero.imageUrl) {
          cleanupUploadedFile(activeStorefrontConfig.hero.imageUrl);
        }
        activeStorefrontConfig.hero = {
          ...activeStorefrontConfig.hero,
          ...hero
        };
      }
      if (typeof showHighlighted === 'boolean') {
        activeStorefrontConfig.showHighlighted = showHighlighted;
      }
      if (highlightedItems !== undefined && Array.isArray(highlightedItems)) {
        activeStorefrontConfig.highlightedItems = highlightedItems;
      }
      if (trendingCollections !== undefined && Array.isArray(trendingCollections)) {
        activeStorefrontConfig.trendingCollections = trendingCollections;
      }
      if (quickQueryTags !== undefined && Array.isArray(quickQueryTags)) {
        activeStorefrontConfig.quickQueryTags = quickQueryTags;
      }

      savePersistedConfig(activeStorefrontConfig);

      sendSuccess(res, activeStorefrontConfig, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const merchandisingController = new MerchandisingController();
