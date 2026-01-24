import useSWR from "swr";
import { useMemo } from "react";
import type { Budget } from "./types";
import type { DashboardData, Transaction } from "@/dashboard/types";
import { endpoints } from "@/config/endpoints";
import { defaultServerInstance } from "@/config/servers";
import { getExpenses } from "./api";
import { useCategoriesWithProvisions } from "@/data/categories/hooks";
import type { CategoryWithProvisions } from "@/data/categories/hooks";

/**
 * Provision with progress information
 */
export interface ProvisionWithProgress {
  id: number;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
}

/**
 * Category with provisions that include progress
 */
export interface CategoryWithProgress
  extends Omit<CategoryWithProvisions, "provisions"> {
  provisions: ProvisionWithProgress[];
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
}

/**
 * Uncategorized expense item
 */
export interface UncategorizedExpense {
  id: number;
  description: string;
  amount: number;
  date: string;
}

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

/**
 * Hook to fetch provision progress data
 * Combines categories, provisions, and expenses to calculate spending progress
 */
export function useProvisionProgress(budgetId: number | null) {
  // Fetch categories with provisions
  const {
    categories: categoriesWithProvisions,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategoriesWithProvisions(budgetId);

  // Fetch expenses for current cycle
  const {
    data: expenses,
    error: expensesError,
    isLoading: expensesLoading,
  } = useSWR<Transaction[]>(
    budgetId ? `expenses-${budgetId}` : null,
    budgetId ? () => getExpenses(budgetId.toString()) : null,
    {
      revalidateOnFocus: false,
    }
  );

  // Calculate progress data
  const progressData = useMemo(() => {
    if (!categoriesWithProvisions || !expenses) {
      return {
        categories: [],
        uncategorizedExpenses: [],
        totalBudgeted: 0,
        totalSpent: 0,
        totalRemaining: 0,
      };
    }

    // Group expenses by provision_id
    const spentByProvision: Record<number, number> = {};
    const uncategorized: UncategorizedExpense[] = [];

    expenses.forEach((expense) => {
      if (expense.type === "expense") {
        // Check if provision_id exists in the transaction
        const provisionId = (expense as any).provision_id;

        if (provisionId) {
          spentByProvision[provisionId] =
            (spentByProvision[provisionId] || 0) + expense.amount;
        } else {
          // Uncategorized expense
          uncategorized.push({
            id: expense.id,
            description: expense.description,
            amount: expense.amount,
            date: expense.date,
          });
        }
      }
    });

    // Enrich categories with progress data
    const categoriesWithProgress: CategoryWithProgress[] =
      categoriesWithProvisions
        .map((category) => {
          const provisionsWithProgress = category.provisions.map(
            (provision) => {
              const spent = spentByProvision[provision.id] || 0;
              const remaining = provision.amount - spent;
              const percentage =
                provision.amount > 0 ? (spent / provision.amount) * 100 : 0;

              return {
                id: provision.id,
                name: provision.name,
                amount: provision.amount,
                spent,
                remaining,
                percentage,
              };
            }
          );

          const totalBudgeted = provisionsWithProgress.reduce(
            (sum, p) => sum + p.amount,
            0
          );
          const totalSpent = provisionsWithProgress.reduce(
            (sum, p) => sum + p.spent,
            0
          );
          const totalRemaining = totalBudgeted - totalSpent;

          return {
            ...category,
            provisions: provisionsWithProgress,
            totalBudgeted,
            totalSpent,
            totalRemaining,
          };
        })
        // Filter out categories with no provisions
        .filter((category) => category.provisions.length > 0);

    // Calculate overall totals
    const totalBudgeted = categoriesWithProgress.reduce(
      (sum, cat) => sum + cat.totalBudgeted,
      0
    );
    const totalSpent = categoriesWithProgress.reduce(
      (sum, cat) => sum + cat.totalSpent,
      0
    );
    const totalRemaining = totalBudgeted - totalSpent;

    return {
      categories: categoriesWithProgress,
      uncategorizedExpenses: uncategorized,
      totalBudgeted,
      totalSpent,
      totalRemaining,
    };
  }, [categoriesWithProvisions, expenses]);

  return {
    ...progressData,
    isLoading: categoriesLoading || expensesLoading,
    isError: categoriesError || expensesError,
  };
}
