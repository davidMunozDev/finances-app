import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";

export async function createManualIncome(params: {
  userId: number;
  budgetId: number;
  cycleId: number;
  description?: string;
  amount: number;
  dateISO: string; // YYYY-MM-DD
}) {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO transactions (user_id, budget_id, cycle_id, category_id, type, description, amount, date, source)
     VALUES ($1, $2, $3, NULL, 'income', $4, $5, $6, 'manual')
     RETURNING id`,
    [
      params.userId,
      params.budgetId,
      params.cycleId,
      params.description ?? null,
      params.amount,
      params.dateISO,
    ]
  );
  return result.rows[0].id;
}

export async function listCycleIncomes(params: {
  userId: number;
  budgetId: number;
  cycleId: number;
}) {
  const result = await pool.query<any>(
    `SELECT id, description, amount, date, source
     FROM transactions
     WHERE user_id = $1 AND budget_id = $2 AND cycle_id = $3
       AND type = 'income'
     ORDER BY date DESC, id DESC`,
    [params.userId, params.budgetId, params.cycleId]
  );
  return result.rows;
}

export async function updateIncome(params: {
  userId: number;
  budgetId: number;
  incomeId: number;
  description?: string;
  amount: number;
  dateISO: string;
}) {
  const result = await pool.query(
    `UPDATE transactions
     SET description = $1, amount = $2, date = $3
     WHERE id = $4 AND user_id = $5 AND budget_id = $6 AND type = 'income'`,
    [
      params.description ?? null,
      params.amount,
      params.dateISO,
      params.incomeId,
      params.userId,
      params.budgetId,
    ]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deleteIncome(params: {
  userId: number;
  budgetId: number;
  incomeId: number;
}) {
  const result = await pool.query(
    `DELETE FROM transactions
     WHERE id = $1 AND user_id = $2 AND budget_id = $3 AND type = 'income'`,
    [params.incomeId, params.userId, params.budgetId]
  );
  return (result.rowCount ?? 0) > 0;
}
