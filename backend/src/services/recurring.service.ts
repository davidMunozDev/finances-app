import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";
import type {
  RecurringExpenseRow,
  CreateRecurringBody,
} from "../types/recurring.types";

export async function listRecurring(budgetId: number) {
  const [rows] = await pool.query<DBRow<RecurringExpenseRow>[]>(
    `SELECT id, budget_id, category_id, name, amount, frequency, dow, dom, month, day
     FROM budget_recurring_expenses
     WHERE budget_id = ?
     ORDER BY id DESC`,
    [budgetId]
  );
  return rows;
}

export async function createRecurring(
  budgetId: number,
  body: CreateRecurringBody
) {
  const frequency = body.frequency;
  const dow = frequency === "weekly" ? body.dow : null;
  const dom = frequency === "monthly" ? body.dom : null;
  const month = frequency === "yearly" ? body.month : null;
  const day = frequency === "yearly" ? body.day : null;

  const [result] = await pool.query<DBResult>(
    `INSERT INTO budget_recurring_expenses (budget_id, category_id, name, amount, frequency, dow, dom, month, day)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      budgetId,
      body.category_id,
      body.name,
      body.amount,
      frequency,
      dow,
      dom,
      month,
      day,
    ]
  );
  return result.insertId;
}

export async function updateRecurring(
  budgetId: number,
  recurringId: number,
  body: CreateRecurringBody
) {
  const frequency = body.frequency;
  const dow = frequency === "weekly" ? body.dow : null;
  const dom = frequency === "monthly" ? body.dom : null;
  const month = frequency === "yearly" ? body.month : null;
  const day = frequency === "yearly" ? body.day : null;

  const [result] = await pool.query<DBResult>(
    `UPDATE budget_recurring_expenses
     SET category_id = ?, name = ?, amount = ?, frequency = ?, dow = ?, dom = ?, month = ?, day = ?
     WHERE id = ? AND budget_id = ?`,
    [
      body.category_id,
      body.name,
      body.amount,
      frequency,
      dow,
      dom,
      month,
      day,
      recurringId,
      budgetId,
    ]
  );
  return result.affectedRows > 0;
}

export async function deleteRecurring(budgetId: number, recurringId: number) {
  const [result] = await pool.query<DBResult>(
    `DELETE FROM budget_recurring_expenses WHERE id = ? AND budget_id = ?`,
    [recurringId, budgetId]
  );
  return result.affectedRows > 0;
}
