import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";
import type {
  ProvisionRow,
  CreateProvisionBody,
} from "../types/provision.types";

export async function listProvisions(budgetId: number) {
  const [rows] = await pool.query<DBRow<ProvisionRow>[]>(
    `SELECT id, budget_id, category_id, name, amount
     FROM budget_provisions
     WHERE budget_id = ?
     ORDER BY id DESC`,
    [budgetId]
  );
  return rows;
}

export async function createProvision(
  budgetId: number,
  body: CreateProvisionBody
) {
  const [result] = await pool.query<DBResult>(
    `INSERT INTO budget_provisions (budget_id, category_id, name, amount)
     VALUES (?, ?, ?, ?)`,
    [budgetId, body.category_id, body.name, body.amount]
  );
  return result.insertId;
}

export async function deleteProvision(budgetId: number, provisionId: number) {
  const [result] = await pool.query<DBResult>(
    `DELETE FROM budget_provisions WHERE id = ? AND budget_id = ?`,
    [provisionId, budgetId]
  );
  return result.affectedRows > 0;
}

export async function createProvisionBulk(params: {
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
    `INSERT INTO budget_provisions (budget_id, category_id, name, amount)
     VALUES ${placeholders}`,
    values
  );

  const firstId = result.insertId;
  const count = result.affectedRows;

  // IDs consecutivos para el statement
  const ids = Array.from({ length: count }, (_, i) => firstId + i);

  return ids;
}

export async function getProvisionsTotal(budgetId: number) {
  const [[row]] = await pool.query<DBRow<{ total: string }>[]>(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM budget_provisions
     WHERE budget_id = ?`,
    [budgetId]
  );
  return Number(row.total);
}
