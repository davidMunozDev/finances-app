import useSWR from "swr";
import type { RecurringExpense } from "./types";
import { getRecurringExpenses } from "./api";

/**
 * Hook to fetch recurring expenses for a budget
 * @param budgetId - The budget ID (null to disable fetching)
 * @returns Recurring expenses array, loading state, error state, and mutate function
 */
export function useRecurringExpenses(budgetId: number | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<RecurringExpense[]>(
    budgetId ? ["recurring-expenses", budgetId.toString()] : null,
    async () => {
      if (!budgetId) return [];
      return getRecurringExpenses(budgetId.toString());
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    recurringExpenses: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
