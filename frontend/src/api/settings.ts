import { apiClient } from './client.js';

export interface ShippingSettings {
  shippingType: 'always_free' | 'flat_rate' | 'free_above_amount';
  freeShippingThreshold: number;
  standardRate: number;
  flatRate: number;
}

export interface StorefrontSettings {
  storeName?: string;
  storeTagline?: string;
  currency?: string;
  shipping?: ShippingSettings;
  colors?: string[];
  sizes?: string[];
}

export async function fetchStorefrontSettings(): Promise<StorefrontSettings> {
  return apiClient<StorefrontSettings>('/settings');
}

export function calculateShippingFee(subtotal: number, shipping?: ShippingSettings): number {
  if (!shipping) return 0;
  if (shipping.shippingType === 'always_free') {
    return 0;
  }
  if (shipping.shippingType === 'flat_rate') {
    return Number(shipping.flatRate ?? shipping.standardRate ?? 0);
  }
  if (shipping.shippingType === 'free_above_amount') {
    const threshold = Number(shipping.freeShippingThreshold) || 0;
    if (subtotal >= threshold) {
      return 0;
    }
    return Number(shipping.standardRate) || 0;
  }
  return 0;
}
