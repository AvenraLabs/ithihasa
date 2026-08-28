import { apiClient } from './client.js';

export async function loginAdmin({ identifier, password }) {
  const data = await apiClient('/auth/admin-login', {
    method: 'POST',
    body: { identifier, password },
  });

  if (data?.tokens?.accessToken) {
    localStorage.setItem('ithihasa_admin_token', data.tokens.accessToken);
    localStorage.setItem('ithihasa_admin_authenticated', 'true');
    localStorage.setItem('ithihasa_admin_user', JSON.stringify(data.user));
  }

  return data;
}

export function logoutAdmin() {
  localStorage.removeItem('ithihasa_admin_token');
  localStorage.removeItem('ithihasa_admin_authenticated');
  localStorage.removeItem('ithihasa_admin_user');
}

export function getCurrentAdmin() {
  const userStr = localStorage.getItem('ithihasa_admin_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}
