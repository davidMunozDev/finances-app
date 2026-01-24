import { defaultServerInstance } from "@/config/servers";
import { endpoints } from "@/config/endpoints";
import type { Budget, CreateBudgetBody, UpdateBudgetBody } from "./types";
import type { Transaction } from "@/dashboard/types";

/**
 * Get all expenses for a budget (current cycle by default)
 */
export async function getExpenses(budgetId: string): Promise<Transaction[]> {
  const response = await defaultServerInstance.get<any[]>(
    endpoints.expenses.getAll(budgetId)
  );

  // Transform response: convert amount from string to number if needed
  return response.data.map((expense) => ({
    ...expense,
    amount:
      typeof expense.amount === "string"
        ? parseFloat(expense.amount)
        : expense.amount,
  }));
}

/**
 * Create a new budget
 */
export async function createBudget(
  data: CreateBudgetBody
): Promise<{ id: number }> {
  const response = await defaultServerInstance.post<{ id: number }>(
    endpoints.budgets.root,
    data
  );
  return response.data;
}

/**
 * Update a budget
 */
export async function updateBudget(
  id: number,
  data: UpdateBudgetBody
): Promise<Budget> {
  const response = await defaultServerInstance.put<Budget>(
    endpoints.budgets.byId(id.toString()),
    data
  );
  return response.data;
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: number): Promise<void> {
  await defaultServerInstance.delete(endpoints.budgets.byId(id.toString()));
}
