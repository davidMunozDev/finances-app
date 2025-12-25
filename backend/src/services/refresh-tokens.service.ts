import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";

export async function storeRefreshToken(params: {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}) {
  const [result] = await pool.query<DBResult>(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [params.userId, params.tokenHash, params.expiresAt]
  );
  return result.insertId;
}

export async function findRefreshToken(tokenHash: string) {
  const [rows] = await pool.query<
    DBRow<{
      id: number;
      user_id: number;
      expires_at: string;
      revoked_at: string | null;
      replaced_by_token_hash: string | null;
    }>[]
  >(
    `SELECT id, user_id, expires_at, revoked_at, replaced_by_token_hash
     FROM refresh_tokens
     WHERE token_hash = ?
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0] ?? null;
}

export async function rotateRefreshToken(params: {
  tokenHash: string;
  replacedByTokenHash: string;
}) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW(), replaced_by_token_hash = ?
     WHERE token_hash = ? AND revoked_at IS NULL`,
    [params.replacedByTokenHash, params.tokenHash]
  );
}

export async function revokeRefreshToken(tokenHash: string) {
  const [result] = await pool.query<DBResult>(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE token_hash = ? AND revoked_at IS NULL`,
    [tokenHash]
  );
  return result.affectedRows > 0;
}

export async function revokeAllUserRefreshTokens(userId: number) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE user_id = ? AND revoked_at IS NULL`,
    [userId]
  );
}
