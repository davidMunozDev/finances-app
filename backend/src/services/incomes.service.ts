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
  const [result] = await pool.query<DBResult>(
    `INSERT INTO transactions (user_id, budget_id, cycle_id, category_id, type, description, amount, date, source)
     VALUES (?, ?, ?, NULL, 'income', ?, ?, ?, 'manual')`,
    [
      params.userId,
      params.budgetId,
      params.cycleId,
      params.description ?? null,
      params.amount,
      params.dateISO,
    ]
  );
  return result.insertId;
}

export async function listCycleIncomes(params: {
  userId: number;
  budgetId: number;
  cycleId: number;
}) {
  const [rows] = await pool.query<DBRow<any>[]>(
    `SELECT id, description, amount, date, source
     FROM transactions
     WHERE user_id = ? AND budget_id = ? AND cycle_id = ?
       AND type = 'income'
     ORDER BY date DESC, id DESC`,
    [params.userId, params.budgetId, params.cycleId]
  );
  return rows;
}
