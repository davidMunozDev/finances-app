import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";
import type { CategoryRow } from "../types/category.types";

export async function findUserCategoryById(userId: number, id: number) {
  const result = await pool.query<CategoryRow>(
    `SELECT id, user_id, name, icon
     FROM categories
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [id, userId]
  );
  return result.rows[0] ?? null;
}

export async function existsUserCategoryName(
  userId: number,
  name: string,
  excludeId: number
) {
  const result = await pool.query<{ id: number }>(
    `SELECT id FROM categories WHERE user_id = $1 AND name = $2 AND id <> $3 LIMIT 1`,
    [userId, name, excludeId]
  );
  return result.rows.length > 0;
}

export async function updateUserCategory(params: {
  userId: number;
  id: number;
  name?: string;
  icon?: string | null;
}) {
  const fields: string[] = [];
  const values: Array<string | number | null> = [];
  let paramIndex = 1;

  if (params.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(params.name);
  }

  if (params.icon !== undefined) {
    fields.push(`icon = $${paramIndex++}`);
    values.push(params.icon);
  }

  if (!fields.length) return null;

  values.push(params.id, params.userId);

  await pool.query(
    `UPDATE categories
     SET ${fields.join(", ")}
     WHERE id = $${paramIndex++} AND user_id = $${paramIndex}`,
    values
  );

  return findUserCategoryById(params.userId, params.id);
}

export async function listCategories(userId: number) {
  const result = await pool.query<CategoryRow>(
    `SELECT id, user_id, name, icon
     FROM categories
     WHERE user_id IS NULL OR user_id = $1
     ORDER BY user_id IS NOT NULL DESC, name ASC`,
    [userId]
  );
  return result.rows;
}

export async function createCategory(
  userId: number,
  name: string,
  icon?: string
) {
  // Evitar duplicados por usuario (mismo nombre)
  const existing = await pool.query<{ id: number }>(
    `SELECT id FROM categories WHERE user_id = $1 AND name = $2 LIMIT 1`,
    [userId, name]
  );

  if (existing.rows.length)
    return { conflict: true as const, id: existing.rows[0].id };

  const result = await pool.query<{ id: number }>(
    `INSERT INTO categories (user_id, name, icon)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [userId, name, icon ?? null]
  );

  return { conflict: false as const, id: result.rows[0].id };
}

export async function getCategoryById(id: number) {
  const result = await pool.query<CategoryRow>(
    `SELECT id, user_id, name, icon
     FROM categories
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function deleteCategory(userId: number, id: number) {
  // Solo categorías del usuario (no globales)
  const result = await pool.query(
    `DELETE FROM categories
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  return (result.rowCount ?? 0) > 0;
}
