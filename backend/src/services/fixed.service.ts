import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";
import type { FixedExpenseRow, CreateFixedBody } from "../types/fixed.types";

export async function listFixed(budgetId: number) {
  const [rows] = await pool.query<DBRow<FixedExpenseRow>[]>(
    `SELECT id, budget_id, category_id, name, amount
     FROM budget_fixed_expenses
     WHERE budget_id = ?
     ORDER BY id DESC`,
    [budgetId]
  );
  return rows;
}

export async function createFixed(budgetId: number, body: CreateFixedBody) {
  const [result] = await pool.query<DBResult>(
    `INSERT INTO budget_fixed_expenses (budget_id, category_id, name, amount)
     VALUES (?, ?, ?, ?)`,
    [budgetId, body.category_id, body.name, body.amount]
  );
  return result.insertId;
}

export async function deleteFixed(budgetId: number, fixedId: number) {
  const [result] = await pool.query<DBResult>(
    `DELETE FROM budget_fixed_expenses WHERE id = ? AND budget_id = ?`,
    [fixedId, budgetId]
  );
  return result.affectedRows > 0;
}

export async function createFixedBulk(params: {
  budgetId: number;
  items: Array<{ category_id: number; name: string; amount: number }>;
}) {
  const { budgetId, items } = params;

  // Construimos:
  // INSERT INTO ... (budget_id, category_id, name, amount)
  // VALUES (?, ?, ?, ?), (?, ?, ?, ?), ...
  const placeholders = items.map(() => "(?, ?, ?, ?)").join(", ");
  const values: Array<number | string> = [];

  for (const it of items) {
    values.push(budgetId, it.category_id, it.name, it.amount);
  }

  const [result] = await pool.query<DBResult>(
    `INSERT INTO budget_fixed_expenses (budget_id, category_id, name, amount)
     VALUES ${placeholders}`,
    values
  );

  const firstId = result.insertId;
  const count = result.affectedRows;

  // IDs consecutivos para el statement
  const ids = Array.from({ length: count }, (_, i) => firstId + i);

  return ids;
}
