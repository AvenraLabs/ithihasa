import { apiClient } from './client.js';

export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
  variant: {
    id: string;
    sku: string;
    size: string;
    color?: string | null;
    availableStock: number;
  };
}

export interface CartSummary {
  subtotal: number;
  discountAmount: number;
  couponCode?: string | null;
  couponApplied?: {
    code: string;
    description: string;
    discount: number;
  } | null;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

export interface CartData {
  id: string;
  items: CartItem[];
  summary: CartSummary;
}

export async function fetchCart(couponCode?: string): Promise<CartData> {
  const query = couponCode ? `?coupon=${encodeURIComponent(couponCode)}` : '';
  return apiClient<CartData>(`/cart${query}`);
}

export async function addToCart(variantId: string, quantity = 1): Promise<CartData> {
  return apiClient<CartData>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ variantId, quantity }),
  });
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<CartData> {
  return apiClient<CartData>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(itemId: string): Promise<CartData> {
  return apiClient<CartData>(`/cart/items/${itemId}`, {
    method: 'DELETE',
  });
}
