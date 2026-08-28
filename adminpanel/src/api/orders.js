import { apiClient } from './client.js';

export async function fetchOrders(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.status && filters.status !== 'All') queryParams.append('status', filters.status);
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.page) queryParams.append('page', filters.page);
  if (filters.limit) queryParams.append('limit', filters.limit);

  const queryStr = queryParams.toString();
  return apiClient(`/admin/orders${queryStr ? `?${queryStr}` : ''}`);
}

export async function updateOrderStatus(orderId, status, reason) {
  return apiClient(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: { status, reason },
  });
}
