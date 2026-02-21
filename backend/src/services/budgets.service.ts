import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";
import type {
  BudgetRow,
  CreateBudgetBody,
  UpdateBudgetBody,
} from "../types/budget.types";

async function getUserCurrency(userId: number) {
  const result = await pool.query<{ default_currency: string }>(
    "SELECT default_currency FROM users WHERE id = $1 LIMIT 1",
    [userId]
  );
  return result.rows[0]?.default_currency ?? "EUR";
}

export async function listBudgets(userId: number) {
  const result = await pool.query<BudgetRow>(
    `SELECT id, user_id, name, currency, reset_type, reset_dow, reset_dom, reset_month, reset_day, is_active
     FROM budgets
     WHERE user_id = $1 AND is_active = TRUE
     ORDER BY id DESC`,
    [userId]
  );
  return result.rows;
}

export async function getBudgetById(userId: number, budgetId: number) {
  const result = await pool.query<BudgetRow>(
    `SELECT id, user_id, name, currency, reset_type, reset_dow, reset_dom, reset_month, reset_day, is_active
     FROM budgets
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [budgetId, userId]
  );
  return result.rows[0] ?? null;
}

export async function createBudget(userId: number, body: CreateBudgetBody) {
  const currency = await getUserCurrency(userId);

  // Normalizamos columnas según reset_type
  const reset_type = body.reset_type;
  const reset_dow = reset_type === "weekly" ? body.reset_dow : null;
  const reset_dom = reset_type === "monthly" ? body.reset_dom : null;
  const reset_month = reset_type === "yearly" ? body.reset_month : null;
  const reset_day = reset_type === "yearly" ? body.reset_day : null;

  const result = await pool.query<{ id: number }>(
    `INSERT INTO budgets (user_id, name, currency, reset_type, reset_dow, reset_dom, reset_month, reset_day)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      userId,
      body.name,
      currency,
      reset_type,
      reset_dow,
      reset_dom,
      reset_month,
      reset_day,
    ]
  );

  return getBudgetById(userId, result.rows[0].id);
}

export async function updateBudget(
  userId: number,
  budgetId: number,
  body: UpdateBudgetBody
) {
  const fields: string[] = [];
  const values: Array<string | number | null> = [];
  let paramIndex = 1;

  if (body.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(body.name);
  }

  if (body.reset_type !== undefined) {
    fields.push(`reset_type = $${paramIndex++}`);
    values.push(body.reset_type);

    // limpiamos y seteamos reglas
    const reset_dow =
      body.reset_type === "weekly" ? (body as any).reset_dow : null;
    const reset_dom =
      body.reset_type === "monthly" ? (body as any).reset_dom : null;
    const reset_month =
      body.reset_type === "yearly" ? (body as any).reset_month : null;
    const reset_day =
      body.reset_type === "yearly" ? (body as any).reset_day : null;

    fields.push(`reset_dow = $${paramIndex++}`);
    values.push(reset_dow);
    fields.push(`reset_dom = $${paramIndex++}`);
    values.push(reset_dom);
    fields.push(`reset_month = $${paramIndex++}`);
    values.push(reset_month);
    fields.push(`reset_day = $${paramIndex++}`);
    values.push(reset_day);
  }

  if (!fields.length) return getBudgetById(userId, budgetId);

  values.push(budgetId, userId);

  await pool.query(
    `UPDATE budgets SET ${fields.join(
      ", "
    )} WHERE id = $${paramIndex++} AND user_id = $${paramIndex}`,
    values
  );

  return getBudgetById(userId, budgetId);
}

export async function deleteBudget(userId: number, budgetId: number) {
  // Soft delete (mejor para histórico si lo necesitas)
  const result = await pool.query(
    `UPDATE budgets SET is_active = FALSE WHERE id = $1 AND user_id = $2`,
    [budgetId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}
