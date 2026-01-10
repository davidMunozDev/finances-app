import useSWR from "swr";
import type { Provision } from "./types";
import { endpoints } from "@/config/endpoints";
import { defaultServerInstance } from "@/config/servers";

/**
 * Hook to fetch provisions for a budget with SWR
 * @param budgetId - The budget ID to fetch provisions for
 */
export function useProvisions(budgetId: string) {
  const { data, error, isLoading, mutate } = useSWR<Provision[]>(
    budgetId ? endpoints.provisions.getAll(budgetId) : null,
    async (url: string) => {
      const response = await defaultServerInstance.get<
        Array<{
          id: number;
          budget_id: number;
          category_id: number;
          name: string;
          amount: string; // DECIMAL from DB
        }>
      >(url);

      // Transform: convert amount from string to number
      return response.data.map((provision) => ({
        ...provision,
        amount:
          typeof provision.amount === "string"
            ? parseFloat(provision.amount)
            : provision.amount,
      }));
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    provisions: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
