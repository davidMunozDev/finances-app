import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";

export async function createManualTransaction(params: {
  userId: number;
  budgetId: number;
  cycleId: number;
  categoryId: number;
  description?: string;
  amount: number;
  dateISO: string; // YYYY-MM-DD
}) {
  const [result] = await pool.query<DBResult>(
    `INSERT INTO transactions (user_id, budget_id, cycle_id, category_id, type, description, amount, date, source)
     VALUES (?, ?, ?, ?, 'expense', ?, ?, ?, 'manual')`,
    [
      params.userId,
      params.budgetId,
      params.cycleId,
      params.categoryId,
      params.description ?? null,
      params.amount,
      params.dateISO,
    ]
  );
  return result.insertId;
}

export async function listCycleTransactions(params: {
  userId: number;
  budgetId: number;
  cycleId: number;
}) {
  const [rows] = await pool.query<DBRow<any>[]>(
    `SELECT id, category_id, description, amount, date, source
     FROM transactions
     WHERE user_id = ? AND budget_id = ? AND cycle_id = ?
     ORDER BY date DESC, id DESC`,
    [params.userId, params.budgetId, params.cycleId]
  );
  return rows;
}

export async function getCycleTotals(params: {
  userId: number;
  budgetId: number;
  cycleId: number;
}) {
  const [[row]] = await pool.query<DBRow<{ total: string }>[]>(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE user_id = ? AND budget_id = ? AND cycle_id = ? AND type = 'expense'`,
    [params.userId, params.budgetId, params.cycleId]
  );
  return Number(row.total);
}
