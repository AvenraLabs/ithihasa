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
  // Lazily created — only instantiated when Google sign-in is actually used.
  // This prevents network connections to Google cert servers at backend startup.
  private _client: OAuth2Client | null = null;

  private get client(): OAuth2Client {
    if (!this._client) {
      this._client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    }
    return this._client;
  }

  /**
   * Verifies Google ID Token sent from frontend Google Sign-In button / One Tap
   */
  public async verifyIdToken(idToken: string): Promise<GoogleUserProfile> {
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
