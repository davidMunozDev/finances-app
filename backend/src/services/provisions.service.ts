import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";
import type {
  ProvisionRow,
  CreateProvisionBody,
} from "../types/provision.types";

export async function listProvisions(budgetId: number) {
  const result = await pool.query<ProvisionRow>(
    `SELECT id, budget_id, category_id, name, amount
     FROM budget_provisions
     WHERE budget_id = $1
     ORDER BY id DESC`,
    [budgetId]
  );
  return result.rows;
}

export async function createProvision(
  budgetId: number,
  body: CreateProvisionBody
) {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO budget_provisions (budget_id, category_id, name, amount)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [budgetId, body.category_id, body.name, body.amount]
  );
  return result.rows[0].id;
}

export async function deleteProvision(budgetId: number, provisionId: number) {
  const result = await pool.query(
    `DELETE FROM budget_provisions WHERE id = $1 AND budget_id = $2`,
    [provisionId, budgetId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function updateProvision(params: {
  budgetId: number;
  provisionId: number;
  name: string;
  amount: number;
  category_id: number;
}) {
  const result = await pool.query(
    `UPDATE budget_provisions
     SET name = $1, amount = $2, category_id = $3
     WHERE id = $4 AND budget_id = $5`,
    [
      params.name,
      params.amount,
      params.category_id,
      params.provisionId,
      params.budgetId,
    ]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function createProvisionBulk(params: {
  budgetId: number;
  items: Array<{ category_id: number; name: string; amount: number }>;
}) {
  const { budgetId, items } = params;

  // Construimos placeholders para PostgreSQL: ($1, $2, $3, $4), ($5, $6, $7, $8), ...
  const placeholders = items
    .map((_, i) => {
      const base = i * 4;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
    })
    .join(", ");

  const values: Array<number | string> = [];

  for (const it of items) {
    values.push(budgetId, it.category_id, it.name, it.amount);
  }

  const result = await pool.query<{ id: number }>(
    `INSERT INTO budget_provisions (budget_id, category_id, name, amount)
     VALUES ${placeholders}
     RETURNING id`,
    values
  );

  // PostgreSQL devuelve todos los IDs en result.rows
  const ids = result.rows.map((row: any) => row.id);

  return ids;
}

export async function getProvisionsTotal(budgetId: number) {
  const result = await pool.query<{ total: string }>(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM budget_provisions
     WHERE budget_id = $1`,
    [budgetId]
  );
  return Number(result.rows[0].total);
}
