"use client";

import { Box } from "@mui/material";
import { useMemo } from "react";
import { useBudget } from "@/budget";
import { useExpenses } from "@/data/expenses/hooks";
import ExpenseChart from "@/components/ExpenseChart";
import ExpenseTransactionsList from "@/components/ExpenseTransactionsList";
import { useExpensesFilters } from "../useExpensesFilters";

export default function CompletadosPage() {
  const { currentBudget } = useBudget();
  const { filters } = useExpensesFilters();

  const { expenses, isLoading: expensesLoading } = useExpenses(
    currentBudget?.id,
    {
      startDate: filters.startDate,
      endDate: filters.endDate,
    }
  );

  // Filter expenses by category (client-side filtering)
  const filteredExpenses = useMemo(() => {
    if (!filters.categoryId) {
      return expenses;
    }
    return expenses.filter(
      (expense) => expense.category_id === filters.categoryId
    );
  }, [expenses, filters.categoryId]);

  return (
    <Box
      sx={{
        px: { xs: 2.5, sm: 3, md: 4, lg: 5 },
        py: { xs: 2.5, sm: 3, md: 4 },
        pb: { xs: 12, md: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, lg: 4 },
          maxWidth: { xs: "100%", lg: 900 },
          mx: "auto",
        }}
      >
        {/* Expense Chart */}
        <ExpenseChart expenses={filteredExpenses} isLoading={expensesLoading} />

        {/* Expense List */}
        <ExpenseTransactionsList
          expenses={filteredExpenses}
          isLoading={expensesLoading}
        />
      </Box>
    </Box>
  );
}
