import { apiClient } from './client.js';

export async function fetchStorefrontCMS() {
  return apiClient.get('/merchandising/storefront');
}

export async function updateStorefrontCMS(cmsData) {
  return apiClient.put('/admin/merchandising/storefront', cmsData);
}

