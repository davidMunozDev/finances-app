"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useBudgets } from "./hooks";
import type { Budget } from "./types";

type BudgetContextType = {
  budgets: Budget[];
  currentBudget: Budget | null;
  isLoading: boolean;
  setCurrentBudget: (budgetId: number) => void;
  refreshBudgets: () => void;
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const STORAGE_KEY = "selected_budget_id";

/**
 * Load selected budget ID from localStorage
 */
const loadSelectedBudgetId = (): number | null => {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return parseInt(saved, 10);
    }
  } catch (error) {
    console.error("Error loading selected budget ID:", error);
  }
  return null;
};

/**
 * Save selected budget ID to localStorage
 */
const saveSelectedBudgetId = (budgetId: number | null): void => {
  if (typeof window === "undefined") return;

  try {
    if (budgetId === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, budgetId.toString());
    }
  } catch (error) {
    console.error("Error saving selected budget ID:", error);
  }
};

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { budgets, isLoading, mutate } = useBudgets();
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(
    loadSelectedBudgetId
  );

  // Derive the current budget based on selection and available budgets
  const currentBudget = useMemo(() => {
    // Still loading or no budgets
    if (isLoading || budgets.length === 0) return null;

    // No selection yet, auto-select first
    if (selectedBudgetId === null) {
      return budgets[0];
    }

    // Check if selected budget exists
    const selected = budgets.find((b) => b.id === selectedBudgetId);

    // If selected budget doesn't exist, return first available
    return selected || budgets[0];
  }, [isLoading, budgets, selectedBudgetId]);

  // Sync localStorage when currentBudget changes
  useEffect(() => {
    if (currentBudget) {
      saveSelectedBudgetId(currentBudget.id);
    }
  }, [currentBudget]);

  const setCurrentBudget = (budgetId: number) => {
    setSelectedBudgetId(budgetId);
    saveSelectedBudgetId(budgetId);
  };

  const refreshBudgets = () => {
    mutate();
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        currentBudget,
        isLoading,
        setCurrentBudget,
        refreshBudgets,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudget must be used within BudgetProvider");
  }
  return context;
}
