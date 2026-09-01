const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('ithihasa_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = result?.error?.message || result?.message || `HTTP ${res.status} Error`;
      throw new Error(errorMsg);
    }

    return result.data !== undefined ? result.data : result;
  } catch (error) {
    // If backend is temporarily offline, return null or throw depending on graceful fallback
    console.warn(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}
