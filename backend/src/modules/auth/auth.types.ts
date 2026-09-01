export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string | null;
    name: string;
    phone: string | null;
    phone_verified: boolean;
    role: 'CUSTOMER' | 'ADMIN';
    avatar_url: string | null;
    tier?: string;
  };
  tokens: AuthTokens;
}
