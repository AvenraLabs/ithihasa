// Session & Auth token storage keys
const SESSION_ID_KEY = 'ithihasa_session_id';
const ACCESS_TOKEN_KEY = 'ithihasa_access_token';

const getBaseUrl = (): string => {
  if ((import.meta as any).env?.VITE_API_URL) return (import.meta as any).env.VITE_API_URL;
  if ((import.meta as any).env?.VITE_API_BASE_URL) return (import.meta as any).env.VITE_API_BASE_URL;
  // Local Vite dev server fallback to Express backend
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api/v1';
  }
  // Production (Caddy reverse proxy on domain)
  return '/api/v1';
};

const API_BASE_URL = getBaseUrl().replace(/\/+$/, '');

export function resolveMediaUrl(url?: string | null): string {
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

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId(),
    ...(options.headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new Error(`Unable to connect to backend server. Please verify the backend is running.`);
  }

  let data: any = {};
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok || data.success === false) {
    const errorMessage = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage) as any;
    error.code = data?.error?.code;
    error.details = data?.error?.details;
    error.status = response.status;
    throw error;
  }

  return data.data !== undefined ? data.data : data;
}
