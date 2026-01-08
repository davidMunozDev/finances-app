import useSWR from "swr";
import type { Budget } from "./types";
import type { DashboardData } from "@/dashboard/types";
import { endpoints } from "@/config/endpoints";
import { defaultServerInstance } from "@/config/servers";

/**
 * Hook to fetch budgets with SWR
 */
export function useBudgets() {
  const { data, error, isLoading, mutate } = useSWR<Budget[]>(
    endpoints.budgets.root,
    async (url: string) => {
      const response = await defaultServerInstance.get<Budget[]>(url);
      return response.data;
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    budgets: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch dashboard summary data for a specific budget
 */
export function useDashboardSummary(budgetId: number | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    budgetId
      ? endpoints.transactions.currentSummary(budgetId.toString())
      : null,
    async (url: string) => {
      const response = await defaultServerInstance.get<any>(url);

      // Transform the response: convert amount from string to number
      const transformedData: DashboardData = {
        ...response.data,
        transactions: response.data.transactions.map((t: any) => ({
          ...t,
          amount:
            typeof t.amount === "string" ? parseFloat(t.amount) : t.amount,
        })),
      };

      return transformedData;
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    dashboardData: data,
    isLoading,
    isError: error,
    mutate,
  };
}
