"use client";

import { Box } from "@mui/material";
import {
  BudgetSummaryCard,
  SpendingGraph,
  RecentTransactionsList,
  SpendingCalendar,
} from "@/dashboard/components";
import { processSpendingData, formatPeriodLabel } from "@/utils/dashboard";
import { useDashboardSummary } from "@/budget/hooks";
import { useBudget } from "@/budget/BudgetProvider";
import { useRecurringExpenses } from "@/data/recurring-expenses";
import { generateAllFutureTransactions } from "@/utils/recurring";
import { useMemo } from "react";

export default function Dashboard() {
  const { currentBudget } = useBudget();
  const { dashboardData, isLoading } = useDashboardSummary(currentBudget?.id);
  const { recurringExpenses, isLoading: recurringLoading } =
    useRecurringExpenses(currentBudget?.id);

  // Generate future transactions from recurring expenses (next 6 months)
  const futureTransactions = useMemo(() => {
    if (!recurringExpenses || recurringExpenses.length === 0 || !dashboardData)
      return [];

    // Create a map of category IDs to names from existing transactions
    const categoryMap = new Map<number, string>();
    dashboardData.transactions.forEach((t) => {
      if (t.category_id && t.category_name) {
        categoryMap.set(t.category_id, t.category_name);
      }
    });

    return generateAllFutureTransactions(recurringExpenses, 6, categoryMap);
  }, [recurringExpenses, dashboardData]);

  // Handle loading and error states
  if (!dashboardData) {
    // Process empty data while loading or if no data
    const { dailyData, dailyExpenses, totalSpent } = processSpendingData(
      [],
      "",
      ""
    );

    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
          gap: { xs: 2, md: 3 },
        }}
      >
        <BudgetSummaryCard
          totalIncome={0}
          totalSpent={0}
          period=""
          isLoading={isLoading}
        />

        <SpendingGraph
          data={dailyData}
          total={totalSpent}
          period=""
          isLoading={isLoading}
        />

        <RecentTransactionsList transactions={[]} isLoading={isLoading} />

        <SpendingCalendar
          transactions={[]}
          futureTransactions={[]}
          dailyExpenses={dailyExpenses}
          isLoading={isLoading || recurringLoading}
        />
      </Box>
    );
  }

  // Process the API data
  const { dailyData, dailyExpenses, totalSpent } = processSpendingData(
    dashboardData.transactions,
    dashboardData.cycle.start_date,
    dashboardData.cycle.end_date
  );

  const periodLabel = formatPeriodLabel(
    dashboardData.cycle.start_date,
    dashboardData.cycle.end_date
  );

  // Filter only expense transactions for the recent list, sorted by date (newest first)
  const expenseTransactions = dashboardData.transactions
    .filter((t) => t.type === "expense")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, 1fr)",
        },
        gap: { xs: 2, md: 3 },
      }}
    >
      <BudgetSummaryCard
        totalIncome={dashboardData.totalIncome}
        totalSpent={dashboardData.totalSpent}
        period={periodLabel}
        isLoading={isLoading}
      />

      <SpendingGraph
        data={dailyData}
        total={totalSpent}
        period={periodLabel}
        isLoading={isLoading}
      />

      <RecentTransactionsList
        transactions={expenseTransactions}
        isLoading={isLoading}
      />

      <SpendingCalendar
        transactions={dashboardData.transactions}
        futureTransactions={futureTransactions}
        dailyExpenses={dailyExpenses}
        isLoading={isLoading || recurringLoading}
      />
    </Box>
  );
}
