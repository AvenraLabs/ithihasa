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

export function normalizeOrder(o: any): OrderData {
  if (!o) return {} as OrderData;
  return {
    id: o.id || '',
    orderNumber: o.orderNumber ?? o.order_number ?? (o.id ? o.id.slice(0, 8).toUpperCase() : 'ITH'),
    userId: o.userId ?? o.user_id ?? '',
    status: (o.status || 'PENDING').toUpperCase(),
    subtotal: Number(o.subtotal ?? 0),
    discountAmount: Number(o.discountAmount ?? o.discount_amount ?? 0),
    couponCode: o.couponCode ?? o.coupon_code ?? null,
    shippingAmount: Number(o.shippingAmount ?? o.shipping_amount ?? 0),
    taxAmount: Number(o.taxAmount ?? o.tax_amount ?? 0),
    totalAmount: Number(o.totalAmount ?? o.total_amount ?? 0),
    currency: o.currency ?? 'INR',
    shippingAddress: o.shippingAddress ?? o.shipping_address ?? null,
    items: Array.isArray(o.items)
      ? o.items.map((item: any) => ({
          id: item.id || '',
          orderId: item.orderId ?? item.order_id ?? o.id,
          productId: item.productId ?? item.product_id ?? '',
          variantId: item.variantId ?? item.variant_id ?? '',
          productName: item.productName ?? item.product_name ?? 'Heritage Garment',
          variantName: item.variantName ?? item.variant_name ?? '',
          sku: item.sku ?? '',
          unitPrice: Number(item.unitPrice ?? item.unit_price ?? 0),
          quantity: Number(item.quantity ?? 1),
          total: Number(item.total ?? item.line_total ?? (Number(item.unitPrice ?? item.unit_price ?? 0) * Number(item.quantity ?? 1))),
          imageUrl: item.imageUrl ?? item.image_url ?? null,
        }))
      : [],
    createdAt: o.createdAt ?? o.created_at ?? new Date().toISOString(),
  };
}

export async function fetchOrders(): Promise<OrderData[]> {
  const res = await apiClient<any>('/orders');
  const rawList = Array.isArray(res) ? res : (res?.orders || []);
  return rawList.map(normalizeOrder);
}

export async function fetchOrderById(id: string): Promise<OrderData> {
  const raw = await apiClient<any>(`/orders/${id}`);
  return normalizeOrder(raw);
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
