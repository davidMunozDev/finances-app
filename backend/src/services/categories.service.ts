import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";
import type { CategoryRow } from "../types/category.types";

export async function findUserCategoryById(userId: number, id: number) {
  const [rows] = await pool.query<DBRow<CategoryRow>[]>(
    `SELECT id, user_id, name, icon
     FROM categories
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [id, userId]
  );
  return rows[0] ?? null;
}

export async function existsUserCategoryName(
  userId: number,
  name: string,
  excludeId: number
) {
  const [rows] = await pool.query<DBRow<{ id: number }>[]>(
    `SELECT id FROM categories WHERE user_id = ? AND name = ? AND id <> ? LIMIT 1`,
    [userId, name, excludeId]
  );
  return rows.length > 0;
}

export async function updateUserCategory(params: {
  userId: number;
  id: number;
  name?: string;
  icon?: string | null;
}) {
  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (params.name !== undefined) {
    fields.push("name = ?");
    values.push(params.name);
  }

  if (params.icon !== undefined) {
    fields.push("icon = ?");
    values.push(params.icon);
  }

  if (!fields.length) return null;

  values.push(params.id, params.userId);

  await pool.query<DBResult>(
    `UPDATE categories
     SET ${fields.join(", ")}
     WHERE id = ? AND user_id = ?`,
    values
  );

  return findUserCategoryById(params.userId, params.id);
}

export async function listCategories(userId: number) {
  const [rows] = await pool.query<DBRow<CategoryRow>[]>(
    `SELECT id, user_id, name, icon
     FROM categories
     WHERE user_id IS NULL OR user_id = ?
     ORDER BY user_id IS NOT NULL DESC, name ASC`,
    [userId]
  );
  return rows;
}

export async function createCategory(
  userId: number,
  name: string,
  icon?: string
) {
  // Evitar duplicados por usuario (mismo nombre)
  const [existing] = await pool.query<DBRow<{ id: number }>[]>(
    `SELECT id FROM categories WHERE user_id = ? AND name = ? LIMIT 1`,
    [userId, name]
  );

  if (existing.length) return { conflict: true as const, id: existing[0].id };

  const [result] = await pool.query<DBResult>(
    `INSERT INTO categories (user_id, name, icon)
     VALUES (?, ?, ?)`,
    [userId, name, icon ?? null]
  );

  return { conflict: false as const, id: result.insertId };
}

export async function getCategoryById(id: number) {
  const [rows] = await pool.query<DBRow<CategoryRow>[]>(
    `SELECT id, user_id, name, icon
     FROM categories
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function deleteCategory(userId: number, id: number) {
  // Solo categorías del usuario (no globales)
  const [result] = await pool.query<DBResult>(
    `DELETE FROM categories
     WHERE id = ? AND user_id = ?`,
    [id, userId]
  );

  return result.affectedRows > 0;
}
