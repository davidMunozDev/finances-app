"use client";

import { Box, Typography, LinearProgress } from "@mui/material";
import { useCurrency } from "@/hooks/useCurrency";

interface BudgetOverviewCardProps {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
}

export function BudgetOverviewCard({
  totalBudgeted,
  totalSpent,
  totalRemaining,
}: BudgetOverviewCardProps) {
  const { formatCurrency } = useCurrency();

  const percentageSpent =
    totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        p: { xs: 2.5, md: 3 },
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          mb: 3,
        }}
      >
        Resumen del presupuesto
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 3,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: 600,
              display: "block",
              mb: 0.5,
            }}
          >
            Presupuestado
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "text.primary",
            }}
          >
            {formatCurrency(totalBudgeted)}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: 600,
              display: "block",
              mb: 0.5,
            }}
          >
            Gastado
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: percentageSpent > 100 ? "error.main" : "text.primary",
            }}
          >
            {formatCurrency(totalSpent)}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: 600,
              display: "block",
              mb: 0.5,
            }}
          >
            Restante
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: totalRemaining >= 0 ? "primary.main" : "error.main",
            }}
          >
            {formatCurrency(totalRemaining)}
          </Typography>
        </Box>
      </Box>

      <LinearProgress
        variant="determinate"
        value={Math.min(percentageSpent, 100)}
        sx={{
          height: 8,
          borderRadius: 1,
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
          justifyContent: "flex-end",
          mt: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: percentageSpent > 100 ? "error.main" : "text.secondary",
          }}
        >
          {percentageSpent.toFixed(1)}% del presupuesto
        </Typography>
      </Box>
    </Box>
  );
}
