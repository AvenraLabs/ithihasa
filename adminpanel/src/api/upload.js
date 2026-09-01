import { apiClient } from './client.js';

const getBaseUrl = () => {
  if (import.meta.env?.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env?.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api/v1';
  }
  return '/api/v1';
};

export async function uploadImage(file, folder = 'products', previousUrl = '') {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('ithihasa_admin_token');
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const API_BASE_URL = getBaseUrl().replace(/\/+$/, '');
  const prevQuery = previousUrl ? `&previousUrl=${encodeURIComponent(previousUrl)}` : '';
  const url = `${API_BASE_URL}/admin/upload?folder=${encodeURIComponent(folder)}${prevQuery}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const text = await res.text();
  let result = {};
  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      result = { message: text };
    }
  }

  if (!res.ok || result?.success === false) {
    const errorMsg = result?.error?.message || result?.message || `Upload failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return result.data !== undefined ? result.data : result;
}

export async function uploadMultipleImages(files, folder = 'products') {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });

  const token = localStorage.getItem('ithihasa_admin_token');
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const API_BASE_URL = getBaseUrl().replace(/\/+$/, '');
  const url = `${API_BASE_URL}/admin/upload/multiple?folder=${encodeURIComponent(folder)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const text = await res.text();
  let result = {};
  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      result = { message: text };
    }
  }

  if (!res.ok || result?.success === false) {
    const errorMsg = result?.error?.message || result?.message || `Upload failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return result.data !== undefined ? result.data : result;
}

export async function deleteImage(imageUrl) {
  if (!imageUrl) return;
  const token = localStorage.getItem('ithihasa_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const API_BASE_URL = getBaseUrl().replace(/\/+$/, '');
  const url = `${API_BASE_URL}/admin/upload?url=${encodeURIComponent(imageUrl)}`;
  try {
    await fetch(url, { method: 'DELETE', headers });
  } catch (e) {
    console.warn('Delete image note:', e);
  }
}
