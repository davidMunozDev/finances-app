"use client";

import { Box, Typography, LinearProgress, Skeleton } from "@mui/material";
import { useCurrency } from "@/hooks/useCurrency";
import { DashboardCard } from "./DashboardCard";

interface BudgetSummaryCardProps {
  totalIncome: number;
  totalSpent: number;
  period: string;
  isLoading?: boolean;
}

export function BudgetSummaryCard({
  totalIncome,
  totalSpent,
  period,
  isLoading = false,
}: BudgetSummaryCardProps) {
  const { formatCurrency } = useCurrency();

  const remaining = totalIncome - totalSpent;
  const percentageSpent =
    totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;

  if (isLoading) {
    return (
      <DashboardCard isLoading>
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={56} sx={{ mb: 2 }} />
        <Skeleton
          variant="rectangular"
          height={8}
          sx={{ borderRadius: 1, mb: 2 }}
        />
        <Skeleton variant="text" width="40%" height={20} />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontWeight: 600,
            display: "block",
            mb: 1,
          }}
        >
          Restante para gastar
        </Typography>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: remaining >= 0 ? "primary.main" : "error.main",
            mb: 3,
          }}
        >
          {formatCurrency(remaining)}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={Math.min(percentageSpent, 100)}
          sx={{
            height: 8,
            borderRadius: 1,
            mb: 2,
            bgcolor: "grey.200",
            "& .MuiLinearProgress-bar": {
              bgcolor: percentageSpent > 100 ? "error.main" : "primary.main",
              borderRadius: 1,
            },
          }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {period}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatCurrency(totalSpent)} / {formatCurrency(totalIncome)}
          </Typography>
        </Box>
      </Box>
    </DashboardCard>
  );
}
