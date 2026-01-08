import { defaultServerInstance } from "@/config/servers";
import { endpoints } from "@/config/endpoints";
import type { RecurringExpense } from "./types";

/**
 * Get all recurring expenses for a budget
 * @param budgetId - The budget ID
 * @returns Array of recurring expenses with amounts converted from string to number
 */
export async function getRecurringExpenses(
  budgetId: string
): Promise<RecurringExpense[]> {
  const response = await defaultServerInstance.get<
    Array<{
      id: number;
      budget_id: number;
      category_id: number;
      name: string;
      amount: string;
      frequency: "weekly" | "monthly" | "yearly";
      dow: number | null;
      dom: number | null;
      month: number | null;
      day: number | null;
    }>
  >(endpoints.recurringExpenses.getAll(budgetId));

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
 * Delete a recurring expense
 * @param budgetId - The budget ID
 * @param recurringId - The recurring expense ID
 */
export async function deleteRecurringExpense(
  budgetId: string,
  recurringId: string
): Promise<void> {
  await defaultServerInstance.delete(
    endpoints.recurringExpenses.byId(budgetId, recurringId)
  );
}
