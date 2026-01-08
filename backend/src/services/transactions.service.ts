import { pool } from "../db";
import type { DBRow, DBResult } from "../types/db.types";
import type { ProvisionRow } from "../types/provision.types";
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
    const [[provision]] = await pool.query<DBRow<ProvisionRow>[]>(
      `SELECT id, budget_id, category_id FROM budget_provisions WHERE id = ?`,
      [params.provisionId]
    );

    if (!provision) {
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "La provisión especificada no existe",
      });
    }

    if (provision.budget_id !== params.budgetId) {
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "La provisión no pertenece al presupuesto especificado",
      });
    }

    if (provision.category_id !== params.categoryId) {
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "La provisión no pertenece a la misma categoría del gasto",
      });
    }
  }

  const [result] = await pool.query<DBResult>(
    `INSERT INTO transactions (user_id, budget_id, cycle_id, category_id, provision_id, type, description, amount, date, source)
     VALUES (?, ?, ?, ?, ?, 'expense', ?, ?, ?, 'manual')`,
    [
      params.userId,
      params.budgetId,
      params.cycleId,
      params.categoryId,
      params.provisionId ?? null,
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
    `SELECT t.id, t.category_id, t.provision_id, t.description, t.amount, t.date, t.type, t.source, 
            c.name AS category_name, p.name AS provision_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     LEFT JOIN budget_provisions p ON t.provision_id = p.id
     WHERE t.user_id = ? AND t.budget_id = ? AND t.cycle_id = ?
     ORDER BY t.date DESC, t.id DESC`,
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
     WHERE user_id = ? AND budget_id = ? AND cycle_id = ? AND type = 'expense' AND source != 'fixed'`,
    [params.userId, params.budgetId, params.cycleId]
  );
  return Number(row.total);
}

export async function getCycleIncomes(params: {
  userId: number;
  budgetId: number;
  cycleId: number;
}) {
  const [[row]] = await pool.query<DBRow<{ total: string }>[]>(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE user_id = ? AND budget_id = ? AND cycle_id = ? AND type = 'income'`,
    [params.userId, params.budgetId, params.cycleId]
  );
  return Number(row.total);
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
     WHERE t.user_id = ? AND t.budget_id = ? AND t.type = 'expense'`;

  const queryParams: any[] = [params.userId, params.budgetId];

  if (params.all) {
    // No additional filters - get all expenses for this budget
  } else if (params.startDate && params.endDate) {
    // Date range filter
    query += ` AND t.date >= ? AND t.date <= ?`;
    queryParams.push(params.startDate, params.endDate);
  } else if (params.startDate) {
    // Only start date
    query += ` AND t.date >= ?`;
    queryParams.push(params.startDate);
  } else if (params.endDate) {
    // Only end date
    query += ` AND t.date <= ?`;
    queryParams.push(params.endDate);
  } else if (params.cycleId) {
    // Default: current cycle
    query += ` AND t.cycle_id = ?`;
    queryParams.push(params.cycleId);
  }

  // Filter by provision_id if provided
  if (params.provisionId) {
    query += ` AND t.provision_id = ?`;
    queryParams.push(params.provisionId);
  }

  query += ` ORDER BY t.date DESC, t.id DESC`;

  const [rows] = await pool.query<DBRow<any>[]>(query, queryParams);
  return rows;
}
