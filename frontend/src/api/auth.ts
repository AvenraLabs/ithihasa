import { apiClient, setAccessToken } from './client.js';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  phone_verified?: boolean;
  role: 'CUSTOMER' | 'ADMIN';
  avatar_url?: string | null;
  tier?: string;
}

export interface AuthResponse {
  user: UserSession;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export async function loginWithPassword(credentials: {
  identifier: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (res.tokens?.accessToken) {
    setAccessToken(res.tokens.accessToken);
  }
  return res;
}

export async function registerWithPassword(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  password: string;
}): Promise<AuthResponse> {
  const res = await apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (res.tokens?.accessToken) {
    setAccessToken(res.tokens.accessToken);
  }
  return res;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  otp?: string;
  cooldownSeconds?: number;
}

export async function requestPasswordReset(identifier: string): Promise<OtpResponse> {
  return apiClient<OtpResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  });
}

export async function resetPassword(data: {
  identifier: string;
  otp: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const res = await apiClient<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
  if (res.tokens?.accessToken) {
    setAccessToken(res.tokens.accessToken);
  }
  return res;
}

export async function sendOtpToPhone(phone: string): Promise<OtpResponse> {
  return apiClient<OtpResponse>('/auth/phone/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyPhoneOtp(
  phone: string,
  otp: string
): Promise<{ success: boolean; phone: string; phone_verified: boolean; user?: UserSession }> {
  return apiClient<{ success: boolean; phone: string; phone_verified: boolean; user?: UserSession }>('/auth/phone/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  });
}

export async function fetchUserProfile(): Promise<UserSession> {
  return apiClient<UserSession>('/account/profile');
}

export async function updateUserProfile(data: {
  name?: string;
  email?: string;
  phone?: string | null;
  avatarUrl?: string | null;
}): Promise<UserSession> {
  return apiClient<UserSession>('/account/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
