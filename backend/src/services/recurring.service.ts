import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";
import type {
  RecurringExpenseRow,
  CreateRecurringBody,
} from "../types/recurring.types";

export async function listRecurring(budgetId: number) {
  const result = await pool.query<RecurringExpenseRow>(
    `SELECT id, budget_id, category_id, name, amount, frequency, dow, dom, month, day
     FROM budget_recurring_expenses
     WHERE budget_id = $1
     ORDER BY id DESC`,
    [budgetId]
  );
  return result.rows;
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

  const result = await pool.query<{ id: number }>(
    `INSERT INTO budget_recurring_expenses (budget_id, category_id, name, amount, frequency, dow, dom, month, day)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
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
  return result.rows[0].id;
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

  const result = await pool.query(
    `UPDATE budget_recurring_expenses
     SET category_id = $1, name = $2, amount = $3, frequency = $4, dow = $5, dom = $6, month = $7, day = $8
     WHERE id = $9 AND budget_id = $10`,
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
  return (result.rowCount ?? 0) > 0;
}

export async function deleteRecurring(budgetId: number, recurringId: number) {
  const result = await pool.query(
    `DELETE FROM budget_recurring_expenses WHERE id = $1 AND budget_id = $2`,
    [recurringId, budgetId]
  );
  return (result.rowCount ?? 0) > 0;
}
