/**
 * Dashboard-related types aligned with backend API responses
 */

export interface Budget {
  id: number;
  user_id: number;
  name: string;
  currency: string;
  reset_type: "weekly" | "monthly" | "yearly";
  reset_dow: number | null;
  reset_dom: number | null;
  reset_month: number | null;
  reset_day: number | null;
  is_active: 0 | 1;
}

export interface BudgetCycle {
  id: number;
  budget_id: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
}

export interface Transaction {
  id: number;
  category_id: number | null;
  category_name: string | null;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: "income" | "expense";
  source: "fixed" | "recurring" | "manual";
}

/**
 * Dashboard data structure matching /api/v1/transactions/summary response
 */
export interface DashboardData {
  budget: Budget;
  cycle: BudgetCycle;
  totalSpent: number;
  totalIncome: number;
  transactions: Transaction[];
}
