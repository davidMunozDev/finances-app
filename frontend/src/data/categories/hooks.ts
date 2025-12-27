import useSWR from "swr";
import type { Category } from "./types";
import { endpoints } from "@/config/endpoints";
import { defaultServerInstance } from "@/config/servers";

/**
 * Hook to fetch categories with SWR
 */
export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    endpoints.categories.root,
    async (url: string) => {
      const response = await defaultServerInstance.get<Category[]>(url);
      return response.data;
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
