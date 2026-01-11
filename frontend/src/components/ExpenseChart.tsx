"use client";

import {
  Box,
  Typography,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useCurrency } from "@/hooks/useCurrency";
import { DashboardCard } from "@/dashboard/components/DashboardCard";
import { Expense } from "@/data/expenses/types";
import { useMemo, useState } from "react";

interface ExpenseChartProps {
  expenses: Expense[];
  isLoading?: boolean;
}

type PeriodType = "weekly" | "monthly";

export default function ExpenseChart({
  expenses,
  isLoading = false,
}: ExpenseChartProps) {
  const { formatCurrency } = useCurrency();
  const [period, setPeriod] = useState<PeriodType>("monthly");

  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: PeriodType | null
  ) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  const chartData = useMemo(() => {
    if (expenses.length === 0) {
      return { data: [], total: 0 };
    }

    const now = new Date();
    const expensesByDate = new Map<string, number>();

    if (period === "monthly") {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];
        expensesByDate.set(dateKey, 0);
      }

      // Aggregate expenses by date
      expenses.forEach((expense) => {
        const expenseDate = new Date(expense.date);
        const daysAgo = Math.floor(
          (now.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysAgo >= 0 && daysAgo < 30) {
          const dateKey = expense.date;
          const current = expensesByDate.get(dateKey) || 0;
          expensesByDate.set(dateKey, current + expense.amount);
        }
      });
    } else {
      // Weekly - last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];
        expensesByDate.set(dateKey, 0);
      }

      // Aggregate expenses by date
      expenses.forEach((expense) => {
        const expenseDate = new Date(expense.date);
        const daysAgo = Math.floor(
          (now.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysAgo >= 0 && daysAgo < 7) {
          const dateKey = expense.date;
          const current = expensesByDate.get(dateKey) || 0;
          expensesByDate.set(dateKey, current + expense.amount);
        }
      });
    }

    const data = Array.from(expensesByDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));

    const total = data.reduce((sum, item) => sum + item.amount, 0);

    return { data, total };
  }, [expenses, period]);

  if (isLoading) {
    return (
      <DashboardCard isLoading>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton
            variant="rectangular"
            width={180}
            height={40}
            sx={{ borderRadius: 1 }}
          />
        </Box>
        <Skeleton variant="text" width="30%" height={56} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
      </DashboardCard>
    );
  }

  // Extract dates and amounts for the chart
  const dates = chartData.data.map((item) => {
    const date = new Date(item.date);
    const day = date.getDate();
    const month = date.toLocaleDateString("es-ES", { month: "short" });

    // For weekly, show day of week
    if (period === "weekly") {
      const dayOfWeek = date.toLocaleDateString("es-ES", { weekday: "short" });
      return dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    }

    // For monthly, show day/month format
    return `${day} ${month}`;
  });

  const amounts = chartData.data.map((item) => item.amount);

  return (
    <DashboardCard>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: 600,
              display: "block",
            }}
          >
            Gastos estadística
          </Typography>

          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={handlePeriodChange}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                px: 2,
                py: 0.5,
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                borderRadius: 1,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                },
              },
            }}
          >
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 3,
          }}
        >
          {formatCurrency(chartData.total)}
        </Typography>

        {chartData.data.length > 0 ? (
          <Box sx={{ width: "100%", ml: -6, mr: -3, px: 3 }}>
            <LineChart
              xAxis={[
                {
                  data: dates,
                  scaleType: "band",
                  hideTooltip: true,
                  disableLine: true,
                  disableTicks: true,
                  tickLabelStyle: {
                    fontSize: 12,
                    fill: "#8C8C8C",
                  },
                },
              ]}
              yAxis={[
                {
                  disableLine: true,
                  disableTicks: true,
                  tickLabelStyle: {
                    fontSize: 0,
                  },
                },
              ]}
              series={[
                {
                  data: amounts,
                  area: true,
                  color: "#A78BFA",
                  showMark: false,
                  curve: "monotoneX",
                },
              ]}
              height={180}
              margin={{ top: 0, bottom: 30, left: 0, right: 0 }}
              sx={{
                width: "120%",
                "& .MuiLineElement-root": {
                  strokeWidth: 3,
                },
                "& .MuiAreaElement-root": {
                  fill: "url(#gradient)",
                  fillOpacity: 1,
                },
                "& .MuiChartsAxis-line": {
                  display: "none",
                },
                "& .MuiChartsAxis-tick": {
                  display: "none",
                },
              }}
              slotProps={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                legend: { hidden: true } as any,
              }}
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </LineChart>
          </Box>
        ) : (
          <Box
            sx={{
              height: 180,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "grey.50",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No hay datos para mostrar
            </Typography>
          </Box>
        )}
      </Box>
    </DashboardCard>
  );
}
