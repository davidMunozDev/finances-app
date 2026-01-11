"use client";

import { createContext, useContext } from "react";
import { type ExpenseFilters as ExpenseFiltersType } from "@/data/expenses/types";

interface ExpensesFiltersContextType {
  filters: ExpenseFiltersType & { categoryId?: number | null };
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  applyFilters: (
    filters: ExpenseFiltersType & { categoryId?: number | null }
  ) => void;
}

export const ExpensesFiltersContext = createContext<
  ExpensesFiltersContextType | undefined
>(undefined);

export function useExpensesFilters() {
  const context = useContext(ExpensesFiltersContext);
  if (!context) {
    throw new Error(
      "useExpensesFilters must be used within ExpensesFiltersProvider"
    );
  }
  return context;
}
