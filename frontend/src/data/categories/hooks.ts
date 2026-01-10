import useSWR from "swr";
import { useMemo } from "react";
import type { Category } from "./types";
import { endpoints } from "@/config/endpoints";
import { defaultServerInstance } from "@/config/servers";
import { getProvisions } from "@/data/provisions/api";
import type { Provision } from "@/data/provisions/types";

// Colores para las categorías (mismo esquema que CategoryChart)
const CATEGORY_COLORS = [
  "#FF6B6B", // Rojo
  "#4ECDC4", // Turquesa
  "#FFE66D", // Amarillo
  "#FF8C42", // Naranja
  "#A8E6CF", // Verde claro
  "#95E1D3", // Verde agua
  "#F38181", // Rosa
  "#AA96DA", // Morado
];

/**
 * Category with provisions and color for UI display
 */
export interface CategoryWithProvisions {
  id: number;
  name: string;
  color: string;
  user_id: number | null;
  provisions: Array<{
    id: number;
    name: string;
    amount: number;
  }>;
}

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

/**
 * Hook to fetch categories combined with their provisions
 * Assigns colors to categories for chart display
 *
 * @param budgetId - The budget ID (can be null if no budget selected)
 * @returns Object with combined categories+provisions, loading state, error state, and mutate function
 */
export function useCategoriesWithProvisions(budgetId: number | null) {
  // Fetch categories (user-specific + global)
  const {
    data: categories,
    error: catError,
    isLoading: catLoading,
    mutate: mutateCategories,
  } = useSWR<Category[]>(
    endpoints.categories.root,
    async (url: string) => {
      const response = await defaultServerInstance.get<Category[]>(url);
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Fetch provisions for this budget
  const {
    data: provisions,
    error: provError,
    isLoading: provLoading,
    mutate: mutateProvisions,
  } = useSWR<Provision[]>(
    budgetId ? `provisions-${budgetId}` : null,
    budgetId ? () => getProvisions(budgetId.toString()) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Combine categories with their provisions and assign colors
  const categoriesWithProvisions = useMemo<CategoryWithProvisions[]>(() => {
    if (!categories || !provisions) return [];

    return categories.map((cat, index) => ({
      id: cat.id,
      name: cat.name,
      user_id: cat.user_id,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      provisions: provisions
        .filter((p) => p.category_id === cat.id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          amount: p.amount,
        })),
    }));
  }, [categories, provisions]);

  // Mutate function to refresh both categories and provisions
  const mutate = async () => {
    await Promise.all([mutateCategories(), mutateProvisions()]);
  };

  return {
    categories: categoriesWithProvisions,
    isLoading: catLoading || provLoading,
    isError: catError || provError,
    mutate,
    mutateCategories,
    mutateProvisions,
  };
}
