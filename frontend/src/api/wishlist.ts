import { apiClient, getAccessToken } from './client.js';

export interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string | null;
  selectedColor?: string | null;
  selectedSize?: string | null;
  productDeleted?: boolean;
  availableStock?: number | null;
  variant?: {
    id: string;
    sku?: string | null;
    size?: string | null;
    color?: string | null;
    price?: number | null;
  } | null;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    compareAtPrice?: number | null;
    image?: string | null;
    category?: { name: string };
  };
}


export interface WishlistProductPayload {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice?: number | null;
  image?: string | null;
  category?: { name: string };
  selectedColor?: string | null;
  selectedSize?: string | null;
  variant?: {
    id: string;
    sku?: string | null;
    size?: string | null;
    color?: string | null;
    price?: number | null;
  } | null;
}

const GUEST_WISHLIST_KEY = 'ithihasa_guest_wishlist';

export function getGuestWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGuestWishlist(items: WishlistItem[]): void {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('wishlist-updated'));
  } catch (e) {
    console.error('Failed to save guest wishlist', e);
  }
}

export function isGuestWishlisted(productId: string): boolean {
  const items = getGuestWishlist();
  return items.some((it) => it.productId === productId);
}

export function toggleGuestWishlistItem(
  product: WishlistProductPayload,
  variantId?: string | null,
  options?: { color?: string | null; size?: string | null; variant?: any }
): { added: boolean; message: string; wishlist: WishlistItem[] } {
  const current = getGuestWishlist();
  const exists = current.some((it) => it.productId === product.id);

  let added = false;
  let updated: WishlistItem[];

  if (exists) {
    updated = current.filter((it) => it.productId !== product.id);
    added = false;
  } else {
    const selectedColor = options?.color || product.selectedColor || options?.variant?.color || null;
    const selectedSize = options?.size || product.selectedSize || options?.variant?.size || null;
    const newItem: WishlistItem = {
      id: `guest_${product.id}`,
      productId: product.id,
      variantId: variantId || options?.variant?.id || null,
      selectedColor,
      selectedSize,
      variant: options?.variant || (selectedColor || selectedSize ? {
        id: variantId || '',
        color: selectedColor,
        size: selectedSize,
      } : null),
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: product.basePrice,
        compareAtPrice: product.compareAtPrice,
        image: product.image,
        category: product.category,
      },
    };
    updated = [newItem, ...current];
    added = true;
  }

  saveGuestWishlist(updated);
  return {
    added,
    message: added ? 'Added to Wishlist' : 'Removed from Wishlist',
    wishlist: updated,
  };
}

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const token = getAccessToken();
  if (!token) {
    return getGuestWishlist();
  }
  try {
    const serverItems = await apiClient<WishlistItem[]>('/wishlist');
    return serverItems.map((item) => ({
      ...item,
      selectedColor: item.selectedColor || item.variant?.color || null,
      selectedSize: item.selectedSize || item.variant?.size || null,
    }));
  } catch (err) {
    console.warn('Backend wishlist fetch failed, falling back to local guest wishlist', err);
    return getGuestWishlist();
  }
}

export async function toggleWishlist(
  productId: string,
  variantId?: string | null,
  productData?: WishlistProductPayload,
  options?: { color?: string | null; size?: string | null; variant?: any }
): Promise<{ added: boolean; message: string }> {
  const token = getAccessToken();
  if (!token) {
    if (productData) {
      const res = toggleGuestWishlistItem(productData, variantId, options);
      return { added: res.added, message: res.message };
    }
    // If no full product payload, remove or toggle by ID
    const current = getGuestWishlist();
    const exists = current.some((it) => it.productId === productId);
    if (exists) {
      const updated = current.filter((it) => it.productId !== productId);
      saveGuestWishlist(updated);
      return { added: false, message: 'Removed from Wishlist' };
    }
    return { added: false, message: 'Item updated' };
  }

  return apiClient<{ added: boolean; message: string }>('/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ productId, variantId }),
  });
}

export async function removeFromWishlist(productId: string): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    const current = getGuestWishlist();
    const updated = current.filter((it) => it.productId !== productId);
    saveGuestWishlist(updated);
    return;
  }
  try {
    const current = await apiClient<WishlistItem[]>('/wishlist');
    const existing = current.find((it) => it.productId === productId);
    if (existing) {
      await apiClient('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId, variantId: existing.variantId }),
      });
    }
  } catch (err) {
    console.error('Failed to remove from backend wishlist', err);
  }
}

export async function addToWishlist(
  productId: string,
  variantId?: string | null,
  productData?: WishlistProductPayload,
  options?: { color?: string | null; size?: string | null; variant?: any }
): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    const current = getGuestWishlist();
    const exists = current.some((it) => it.productId === productId);
    if (!exists && productData) {
      toggleGuestWishlistItem(productData, variantId, options);
    }
    return;
  }
  try {
    const current = await apiClient<WishlistItem[]>('/wishlist');
    const exists = current.some((it) => it.productId === productId);
    if (!exists) {
      await apiClient('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId, variantId }),
      });
    }
  } catch (err) {
    console.error('Failed to add to backend wishlist', err);
  }
}

export async function syncGuestWishlistToBackend(): Promise<void> {
  const token = getAccessToken();
  if (!token) return;
  const guestList = getGuestWishlist();
  if (guestList.length === 0) return;

  try {
    for (const item of guestList) {
      await apiClient('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: item.productId, variantId: item.variantId }),
      }).catch(() => {});
    }
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  } catch (err) {
    console.error('Error syncing guest wishlist to backend', err);
  }
}
