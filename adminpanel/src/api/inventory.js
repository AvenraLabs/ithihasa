import { apiClient } from './client.js';

export async function fetchInventory(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.search) queryParams.append('search', filters.search);

  const queryStr = queryParams.toString();
  return apiClient(`/admin/inventory${queryStr ? `?${queryStr}` : ''}`);
}

export async function adjustInventoryStock({ variantId, delta, reason }) {
  return apiClient('/admin/inventory/adjust', {
    method: 'POST',
    body: { variantId, delta, reason },
  });
}

export async function createProduct(productData) {
  return apiClient('/admin/products', {
    method: 'POST',
    body: productData,
  });
}

export async function deleteProduct(productId) {
  return apiClient(`/admin/products/${productId}`, {
    method: 'DELETE',
  });
}
