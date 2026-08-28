export interface PricingItem {
  variantId: string;
  unitPrice: number;
  quantity: number;
  productName: string;
  variantName: string;
  sku: string;
  imageUrl?: string | null;
}

export interface PricingQuote {
  items: Array<PricingItem & { subtotal: number }>;
  subtotal: number;
  discountAmount: number;
  couponCode?: string | null;
  couponApplied?: {
    code: string;
    description?: string | null;
    discount: number;
  } | null;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}
