import { apiClient } from './client.js';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  total: number;
  imageUrl?: string | null;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  couponCode?: string | null;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddress: any;
  items: OrderItem[];
  createdAt: string;
}

export async function fetchOrders(): Promise<OrderData[]> {
  return apiClient<OrderData[]>('/orders');
}

export async function fetchOrderById(id: string): Promise<OrderData> {
  return apiClient<OrderData>(`/orders/${id}`);
}

export async function initiateCheckout(data: {
  shippingAddressId: string;
  couponCode?: string | null;
  notes?: string | null;
  idempotencyKey?: string | null;
}) {
  return apiClient<{
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    currency: string;
    redirectUrl: string | null;
  }>('/checkout/initiate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
