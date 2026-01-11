"use client";

import { Box, CircularProgress } from "@mui/material";
import BudgetTabs from "@/components/BudgetTabs";
import CategoryChart from "@/components/CategoryChart";
import EditableIncomeCard from "@/components/EditableIncomeCard";
import EditableCategorySection from "@/components/EditableCategorySection";
import { useBudget } from "@/budget";
import { useIncomes } from "@/data/incomes";
import { useCategoriesWithProvisions } from "@/data/categories";

interface ExpenseCategory {
  category: string;
  total: number;
}

export default function BudgetPage() {
  const { currentBudget } = useBudget();
  const {
    incomes,
    isLoading: incomesLoading,
    mutate: mutateIncomes,
  } = useIncomes(currentBudget?.id ?? null);
  const {
    categories,
    isLoading: categoriesLoading,
    mutate: mutateCategories,
  } = useCategoriesWithProvisions(currentBudget?.id ?? null);

  const filteredCategories = categories.filter(
    (cat) => cat.provisions.length > 0 || cat.user_id !== null
  );

  // Show loading state while data is being fetched
  if (incomesLoading || categoriesLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Calcular totales
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  // Calcular gastos por categoría para el gráfico
  const expensesByCategory: ExpenseCategory[] = filteredCategories.map(
    (cat) => ({
      category: cat.name,
      total: cat.provisions.reduce((sum, prov) => sum + prov.amount, 0),
    })
  );
  const totalExpenses = expensesByCategory.reduce(
    (sum, cat) => sum + cat.total,
    0
  );

  return (
    <Box
      sx={{
        py: { xs: 2.5, sm: 3, md: 4 },
        pb: { xs: 12, md: 4 },
      }}
    >
      {/* Tabs */}
      <BudgetTabs />

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, lg: 4 },
          maxWidth: { xs: "100%", lg: 900 },
          mx: "auto",
        }}
      >
        {/* Category Chart */}
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            p: { xs: 2.5, sm: 3 },
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          }}
        >
          <CategoryChart
            categories={expensesByCategory}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
          />
        </Box>

        {/* Desktop: Two columns layout */}
        <Box
          sx={{
            display: { xs: "flex", lg: "grid" },
            flexDirection: { xs: "column", lg: "row" },
            gridTemplateColumns: { lg: "1fr 1fr" },
            gap: { xs: 3, lg: 4 },
          }}
        >
          {/* Income Section - Shows first on mobile, left column on desktop */}
          <Box sx={{ order: { xs: 1, lg: 0 } }}>
            <EditableIncomeCard
              title="Ingresos"
              incomes={incomes}
              onUpdate={async () => {
                await mutateIncomes();
              }}
              budgetId={currentBudget?.id ?? null}
            />
          </Box>

          {/* Categories Section - Shows second on mobile, right column on desktop */}
          <Box sx={{ order: { xs: 2, lg: 0 } }}>
            <EditableCategorySection
              categories={filteredCategories}
              onUpdate={async () => {
                await mutateCategories();
              }}
              budgetId={currentBudget?.id ?? null}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
