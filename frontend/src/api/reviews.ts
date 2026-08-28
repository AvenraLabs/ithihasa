import { apiClient } from './client.js';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewInput {
  productId: string;
  orderId?: string;
  rating: number;
  title: string;
  comment: string;
}

export function normalizeReview(r: any): Review {
  return {
    id: r.id,
    userId: r.userId ?? r.user_id,
    userName: r.user?.name ?? r.userName ?? 'Heritage Connoisseur',
    userAvatar: r.user?.avatar_url ?? r.userAvatar ?? null,
    productId: r.productId ?? r.product_id,
    rating: Number(r.rating ?? 5),
    title: r.title ?? '',
    comment: r.comment ?? '',
    verifiedPurchase: Boolean(r.isVerified ?? r.verified_purchase ?? true),
    createdAt: r.createdAt ?? r.created_at ?? new Date().toISOString(),
  };
}

export async function fetchReviewsForProduct(productId: string): Promise<Review[]> {
  try {
    const rawList = await apiClient<any[]>(`/reviews/product/${productId}`);
    return rawList.map(normalizeReview);
  } catch (e) {
    return [];
  }
}

export async function submitReview(data: ReviewInput): Promise<Review> {
  const raw = await apiClient<any>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return normalizeReview(raw);
}
