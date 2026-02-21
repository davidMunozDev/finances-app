import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";
import type { ProvisionRow } from "../types/provision.types";
import type { BulkImportItem } from "../types/assistant.types";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";

export async function createManualTransaction(params: {
  userId: number;
  budgetId: number;
  cycleId: number;
  categoryId: number;
  provisionId?: number;
  description?: string;
  amount: number;
  dateISO: string; // YYYY-MM-DD
}) {
  // Validar provision_id si está presente
  if (params.provisionId) {
    const provision = await pool.query<ProvisionRow>(
      `SELECT id, budget_id, category_id FROM budget_provisions WHERE id = $1`,
      [params.provisionId],
    );

    if (!provision.rows[0]) {
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "La provisión especificada no existe",
      });
    }

    if (provision.rows[0].budget_id !== params.budgetId) {
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "La provisión no pertenece al presupuesto especificado",
      });
    }

    if (provision.rows[0].category_id !== params.categoryId) {
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "La provisión no pertenece a la misma categoría del gasto",
      });
    }
  }

  const result = await pool.query<{ id: number }>(
    `INSERT INTO transactions (user_id, budget_id, cycle_id, category_id, provision_id, type, description, amount, date, source)
     VALUES ($1, $2, $3, $4, $5, 'expense', $6, $7, $8, 'manual')
     RETURNING id`,
    [
      params.userId,
      params.budgetId,
      params.cycleId,
      params.categoryId,
      params.provisionId ?? null,
      params.description ?? null,
      params.amount,
      params.dateISO,
    ],
  );
  return result.rows[0].id;
}

export async function listCycleTransactions(params: {
  userId: number;
  budgetId: number;
  cycleId: number;
}) {
  const result = await pool.query<any>(
    `SELECT t.id, t.category_id, t.provision_id, t.description, t.amount, t.date, t.type, t.source, 
            c.name AS category_name, p.name AS provision_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     LEFT JOIN budget_provisions p ON t.provision_id = p.id
     WHERE t.user_id = $1 AND t.budget_id = $2 AND t.cycle_id = $3
     ORDER BY t.date DESC, t.id DESC`,
    [params.userId, params.budgetId, params.cycleId],
  );
  return result.rows;
}

export async function getCycleTotals(params: {
  userId: number;
  budgetId: number;
  cycleId: number;
}) {
  const result = await pool.query<{ total: string }>(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE user_id = $1 AND budget_id = $2 AND cycle_id = $3 AND type = 'expense' AND source != 'fixed'`,
    [params.userId, params.budgetId, params.cycleId],
  );
  return Number(result.rows[0].total);
}

export async function getCycleIncomes(params: {
  userId: number;
  budgetId: number;
  cycleId: number;
}) {
  const result = await pool.query<{ total: string }>(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE user_id = $1 AND budget_id = $2 AND cycle_id = $3 AND type = 'income'`,
    [params.userId, params.budgetId, params.cycleId],
  );
  return Number(result.rows[0].total);
}

export async function listExpenses(params: {
  userId: number;
  budgetId: number;
  cycleId?: number;
  provisionId?: number;
  startDate?: string;
  endDate?: string;
  all?: boolean;
}) {
  let query = `SELECT t.id, t.category_id, t.provision_id, t.description, t.amount, t.date, t.type, t.source, 
            c.name AS category_name, p.name AS provision_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     LEFT JOIN budget_provisions p ON t.provision_id = p.id
     WHERE t.user_id = $1 AND t.budget_id = $2 AND t.type = 'expense'`;

  const queryParams: any[] = [params.userId, params.budgetId];
  let paramIndex = 3;

  if (params.all) {
    // No additional filters - get all expenses for this budget
  } else if (params.startDate && params.endDate) {
    // Date range filter
    query += ` AND t.date >= $${paramIndex++} AND t.date <= $${paramIndex++}`;
    queryParams.push(params.startDate, params.endDate);
  } else if (params.startDate) {
    // Only start date
    query += ` AND t.date >= $${paramIndex++}`;
    queryParams.push(params.startDate);
  } else if (params.endDate) {
    // Only end date
    query += ` AND t.date <= $${paramIndex++}`;
    queryParams.push(params.endDate);
  } else if (params.cycleId) {
    // Default: current cycle
    query += ` AND t.cycle_id = $${paramIndex++}`;
    queryParams.push(params.cycleId);
  }

  // Filter by provision_id if provided
  if (params.provisionId) {
    query += ` AND t.provision_id = $${paramIndex++}`;
    queryParams.push(params.provisionId);
  }

  query += ` ORDER BY t.date DESC, t.id DESC`;

  const result = await pool.query<any>(query, queryParams);
  return result.rows;
}

export async function createBulkTransactions(params: {
  userId: number;
  budgetId: number;
  cycleId: number;
  transactions: BulkImportItem[];
}): Promise<{ created: number }> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let created = 0;

    for (const tx of params.transactions) {
      await client.query(
        `INSERT INTO transactions (user_id, budget_id, cycle_id, category_id, type, description, amount, date, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'manual')`,
        [
          params.userId,
          params.budgetId,
          params.cycleId,
          tx.type === "expense" ? (tx.category_id ?? null) : null,
          tx.type,
          tx.description ?? null,
          tx.amount,
          tx.date,
        ],
      );
      created++;
    }

    await client.query("COMMIT");
    return { created };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
