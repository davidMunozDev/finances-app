import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";

export async function storeRefreshToken(params: {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}) {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [params.userId, params.tokenHash, params.expiresAt]
  );
  return result.rows[0].id;
}

export async function findRefreshToken(tokenHash: string) {
  const result = await pool.query<{
    id: number;
    user_id: number;
    expires_at: string;
    revoked_at: string | null;
    replaced_by_token_hash: string | null;
  }>(
    `SELECT id, user_id, expires_at, revoked_at, replaced_by_token_hash
     FROM refresh_tokens
     WHERE token_hash = $1
     LIMIT 1`,
    [tokenHash]
  );
  return result.rows[0] ?? null;
}

export async function rotateRefreshToken(params: {
  tokenHash: string;
  replacedByTokenHash: string;
}) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP, replaced_by_token_hash = $1
     WHERE token_hash = $2 AND revoked_at IS NULL`,
    [params.replacedByTokenHash, params.tokenHash]
  );
}

export async function revokeRefreshToken(tokenHash: string) {
  const result = await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP
     WHERE token_hash = $1 AND revoked_at IS NULL`,
    [tokenHash]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function revokeAllUserRefreshTokens(userId: number) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}
