import { query } from '../config/database';
import { RefreshToken } from '../types';

export interface CreateRefreshTokenData {
  userId: string;
  token: string;
  expiresAt: Date;
}

export const refreshTokenService = {
  async createToken(tokenData: CreateRefreshTokenData): Promise<RefreshToken> {
    const { userId, token, expiresAt } = tokenData;
    
    const result = await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, token, expiresAt]
    );

    return result.rows[0];
  },

  async findByToken(token: string): Promise<RefreshToken | null> {
    const result = await query(
      `SELECT * FROM refresh_tokens 
       WHERE token = $1 AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP`,
      [token]
    );

    return result.rows[0] || null;
  },

  async findValidTokensByUserId(userId: string): Promise<RefreshToken[]> {
    const result = await query(
      `SELECT * FROM refresh_tokens 
       WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  },

  async revokeToken(token: string): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token = $1',
      [token]
    );
  },

  async revokeAllUserTokens(userId: string): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND revoked_at IS NULL',
      [userId]
    );
  },

  async cleanExpiredTokens(): Promise<number> {
    const result = await query(
      'DELETE FROM refresh_tokens WHERE expires_at <= CURRENT_TIMESTAMP'
    );

    return result.rowCount || 0;
  },

  async revokeExpiredTokens(): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE expires_at <= CURRENT_TIMESTAMP AND revoked_at IS NULL'
    );
  },
};

export default refreshTokenService;