import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env.js';
import { AuthenticationError } from '../../common/errors/index.js';
import { logger } from '../../common/logger/index.js';

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
}

export class GoogleAuthProvider {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }

  /**
   * Verifies Google ID Token sent from frontend Google Sign-In button / One Tap
   */
  public async verifyIdToken(idToken: string): Promise<GoogleUserProfile> {
    // In local development with mock token, allow easy testing
    if (env.NODE_ENV !== 'production' && idToken.startsWith('mock_token_')) {
      const mockEmail = idToken.replace('mock_token_', '') || 'customer@ithihasa.com';
      return {
        googleId: `mock_google_id_${mockEmail}`,
        email: mockEmail,
        name: 'Ithihasa Customer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        isEmailVerified: true,
      };
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new AuthenticationError('Invalid Google authentication payload');
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        avatarUrl: payload.picture,
        isEmailVerified: payload.email_verified || false,
      };
    } catch (error) {
      logger.error({ err: error }, 'Google ID Token verification failed');
      throw new AuthenticationError('Failed to verify Google identity token');
    }
  }
}

export const googleAuthProvider = new GoogleAuthProvider();
