import { apiClient } from './client.js';

export async function fetchCustomerInsights() {
  return apiClient('/admin/customers/insights');
}

export async function fetchCustomers(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.append('search', filters.search);

  const queryStr = queryParams.toString();
  return apiClient(`/admin/customers${queryStr ? `?${queryStr}` : ''}`);
}

export async function fetchCustomerDossier(userId) {
  return apiClient(`/admin/customers/${userId}`);
}
