import { apiClient } from './client.js';

export async function fetchStorefrontCMS() {
  const response = await apiClient.get('/merchandising/storefront');
  return response.data;
}

export async function updateStorefrontCMS(cmsData) {
  const response = await apiClient.put('/admin/merchandising/storefront', cmsData);
  return response.data;
}
