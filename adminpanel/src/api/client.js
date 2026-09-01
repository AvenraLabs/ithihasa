const getBaseUrl = () => {
  if (import.meta.env?.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env?.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  // Local Vite dev server fallback to Express backend
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api/v1';
  }
  // Production (Caddy reverse proxy on domain)
  return '/api/v1';
};

const API_BASE_URL = getBaseUrl().replace(/\/+$/, '');

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000'
    : '';
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `${base}${clean}`;
}

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

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const res = await fetch(url, config);
    let result = {};
    const text = await res.text();
    if (text) {
      try {
        result = JSON.parse(text);
      } catch {
        result = { message: text };
      }
    }

    if (!res.ok || result?.success === false) {
      const errorMsg = result?.error?.message || result?.message || `HTTP ${res.status} Error`;
      throw new Error(errorMsg);
    }

    return result.data !== undefined ? result.data : result;
  } catch (error) {
    console.warn(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

apiClient.get = (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'GET' });
apiClient.post = (endpoint, body, options = {}) => apiClient(endpoint, { ...options, method: 'POST', body });
apiClient.put = (endpoint, body, options = {}) => apiClient(endpoint, { ...options, method: 'PUT', body });
apiClient.patch = (endpoint, body, options = {}) => apiClient(endpoint, { ...options, method: 'PATCH', body });
apiClient.delete = (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'DELETE' });

