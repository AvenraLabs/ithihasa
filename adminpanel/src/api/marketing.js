import { apiClient } from './client.js';

export async function fetchMarketingStats() {
  return apiClient('/admin/marketing/stats');
}

export async function fetchCoupons() {
  return apiClient('/admin/coupons');
}

export async function createCoupon(couponData) {
  return apiClient('/admin/coupons', {
    method: 'POST',
    body: couponData,
  });
}
