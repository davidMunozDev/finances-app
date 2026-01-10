/**
 * Backend row type - amount comes as string from database
 */
export interface IncomeBackendRow {
  id: number;
  description: string;
  amount: string; // DECIMAL from DB
  date: string;
  source: "manual" | "recurring";
}

/**
 * Frontend Income type - amount converted to number
 */
export interface Income {
  id: number;
  description: string;
  amount: number; // Converted from string
  date: string;
  source: "manual" | "recurring";
}

/**
 * Budget cycle information
 */
export interface BudgetCycle {
  id: number;
  budget_id: number;
  start_date: string;
  end_date: string;
}

/**
 * Response from GET /budgets/:budgetId/incomes
 */
export interface GetIncomesResponse {
  cycle: BudgetCycle;
  incomes: IncomeBackendRow[];
}

/**
 * Request body for creating an income
 */
export interface CreateIncomeBody {
  amount: number;
  description?: string;
  date?: string; // ISO date string YYYY-MM-DD
}

/**
 * Response from creating an income
 */
export interface CreateIncomeResult {
  id: number;
  cycle: BudgetCycle;
}

/**
 * Request body for updating an income
 */
export interface UpdateIncomeBody {
  amount: number;
  description?: string;
  date?: string; // ISO date string YYYY-MM-DD
}
