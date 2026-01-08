import { defaultServerInstance } from "@/config/servers";
import { endpoints } from "@/config/endpoints";
import type {
  Expense,
  ExpenseFilters,
  CreateExpenseBody,
  CreateExpenseResult,
} from "./types";

/**
 * Get expenses for a budget with optional filtering
 * @param budgetId - The budget ID
 * @param filters - Optional filters (all, startDate, endDate)
 * @returns Array of expenses with amounts converted from string to number
 */
export async function getExpenses(
  budgetId: string,
  filters?: ExpenseFilters
): Promise<Expense[]> {
  const params: Record<string, string> = {};

  if (filters?.all) {
    params.all = "true";
  }
  if (filters?.startDate) {
    params.startDate = filters.startDate;
  }
  if (filters?.endDate) {
    params.endDate = filters.endDate;
  }

  const response = await defaultServerInstance.get<
    Array<{
      id: number;
      category_id: number | null;
      category_name: string | null;
      description: string;
      amount: string;
      date: string;
      type: "expense";
      source: "fixed" | "recurring" | "manual";
    }>
  >(endpoints.expenses.getAll(budgetId), { params });

  // Transform: convert amount from string to number
  return response.data.map((expense) => ({
    ...expense,
    amount:
      typeof expense.amount === "string"
        ? parseFloat(expense.amount)
        : expense.amount,
  }));
}

/**
 * Create a new expense (one-time or recurring)
 * @param budgetId - The budget ID
 * @param body - Expense data (one-time or recurring)
 * @returns Result with kind and ID
 */
export async function createExpense(
  budgetId: string,
  body: CreateExpenseBody
): Promise<CreateExpenseResult> {
  const response = await defaultServerInstance.post<CreateExpenseResult>(
    endpoints.expenses.create(budgetId),
    body
  );
  return response.data;
}
