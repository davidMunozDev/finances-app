import useSWR from "swr";
import type { Expense, ExpenseFilters } from "./types";
import { getExpenses } from "./api";

/**
 * Hook to fetch expenses for a budget with optional filtering
 * @param budgetId - The budget ID (null to disable fetching)
 * @param filters - Optional filters (all, startDate, endDate)
 * @returns Expenses array, loading state, error state, and mutate function
 */
export function useExpenses(
  budgetId: number | null | undefined,
  filters?: ExpenseFilters
) {
  // Create a stable key for SWR that includes filters
  const key = budgetId
    ? [
        "expenses",
        budgetId.toString(),
        filters?.all,
        filters?.startDate,
        filters?.endDate,
      ]
    : null;

  const { data, error, isLoading, mutate } = useSWR<Expense[]>(
    key,
    async () => {
      if (!budgetId) return [];
      return getExpenses(budgetId.toString(), filters);
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    expenses: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
