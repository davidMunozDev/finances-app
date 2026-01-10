import useSWR from "swr";
import { getIncomes } from "./api";
import type { Income, BudgetCycle } from "./types";

/**
 * Hook to fetch incomes for a specific budget
 * Uses SWR for caching and revalidation
 *
 * @param budgetId - The budget ID (can be null if no budget selected)
 * @returns Object with incomes array, cycle info, loading state, error state, and mutate function
 */
export function useIncomes(budgetId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<{
    cycle: BudgetCycle;
    incomes: Income[];
  }>(
    budgetId ? `incomes-${budgetId}` : null,
    budgetId ? () => getIncomes(budgetId.toString()) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    incomes: data?.incomes || [],
    cycle: data?.cycle,
    isLoading,
    isError: error,
    mutate,
  };
}
