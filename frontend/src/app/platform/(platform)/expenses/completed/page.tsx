"use client";

import { Box, Button } from "@mui/material";
import { useMemo, useState } from "react";
import { FilterList, UploadFile } from "@mui/icons-material";
import { useBudget } from "@/budget";
import { useExpenses } from "@/data/expenses/hooks";
import { useCategories } from "@/data/categories/hooks";
import ExpenseChart from "@/components/ExpenseChart";
import ExpenseTransactionsList from "@/components/ExpenseTransactionsList";
import ExpenseFiltersModal from "@/components/ExpenseFiltersModal";
import { useExpensesFilters } from "../useExpensesFilters";
import { FileImportModal } from "@/components";

export default function CompletedPage() {
  const { currentBudget } = useBudget();
  const { categories } = useCategories();
  const { filters, isModalOpen, openModal, closeModal, applyFilters } =
    useExpensesFilters();
  const [importModalOpen, setImportModalOpen] = useState(false);

  const {
    expenses,
    isLoading: expensesLoading,
    mutate: mutateExpenses,
  } = useExpenses(currentBudget?.id, {
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  // Filter expenses by category (client-side filtering)
  const filteredExpenses = useMemo(() => {
    if (!filters.categoryId) {
      return expenses;
    }
    return expenses.filter(
      (expense) => expense.category_id === filters.categoryId,
    );
  }, [expenses, filters.categoryId]);

  const hasActiveFilters = !!(
    filters.startDate ||
    filters.endDate ||
    filters.categoryId
  );

  return (
    <>
      <Box
        sx={{
          pt: { xs: 2, sm: 2.5 },
          pb: 0,
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: "100%", lg: 900 },
            mx: "auto",
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={openModal}
            variant="outlined"
            startIcon={<FilterList />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
              py: 1,
              fontWeight: 500,
              borderColor: hasActiveFilters ? "primary.main" : "divider",
              color: hasActiveFilters ? "primary.main" : "text.secondary",
              bgcolor: hasActiveFilters ? "primary.50" : "transparent",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "primary.50",
              },
            }}
          >
            Filtros{hasActiveFilters && " (activos)"}
          </Button>
          <Button
            onClick={() => setImportModalOpen(true)}
            variant="outlined"
            startIcon={<UploadFile />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
              py: 1,
              fontWeight: 500,
              borderColor: "divider",
              color: "text.secondary",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "primary.50",
              },
            }}
          >
            Importar archivo
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
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
          <ExpenseChart
            expenses={filteredExpenses}
            isLoading={expensesLoading}
          />

          {/* Expense List */}
          <ExpenseTransactionsList
            expenses={filteredExpenses}
            isLoading={expensesLoading}
          />
        </Box>
      </Box>

      <ExpenseFiltersModal
        open={isModalOpen}
        onClose={closeModal}
        onApply={applyFilters}
        categories={categories}
        initialFilters={filters}
      />

      {currentBudget && (
        <FileImportModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          budgetId={currentBudget.id.toString()}
          categories={categories}
          onImportComplete={() => {
            mutateExpenses();
          }}
        />
      )}
    </>
  );
}
