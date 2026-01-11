"use client";

import { Box, Typography, Skeleton } from "@mui/material";
import { CategoryOutlined } from "@mui/icons-material";
import { useCurrency } from "@/hooks/useCurrency";
import { useLocale } from "@/hooks/useLocale";
import type { Expense } from "@/data/expenses/types";

interface ExpenseTransactionsListProps {
  expenses: Expense[];
  isLoading?: boolean;
}

export default function ExpenseTransactionsList({
  expenses,
  isLoading = false,
}: ExpenseTransactionsListProps) {
  const { formatCurrency } = useCurrency();
  const { formatRelativeDate } = useLocale();

  if (isLoading) {
    return (
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          p: { xs: 2.5, sm: 3 },
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
        {[...Array(5)].map((_, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              py: 2,
              borderBottom: index < 4 ? 1 : 0,
              borderColor: "divider",
            }}
          >
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
            <Skeleton variant="text" width="20%" height={24} />
          </Box>
        ))}
      </Box>
    );
  }

  if (expenses.length === 0) {
    return (
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          p: { xs: 2.5, sm: 3 },
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Gastos
        </Typography>
        <Box
          sx={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.50",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No hay gastos que mostrar
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        p: { xs: 2.5, sm: 3 },
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: 3,
        }}
      >
        Gastos ({expenses.length})
      </Typography>

      <Box>
        {expenses.map((expense, index) => (
          <Box
            key={expense.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderBottom: index < expenses.length - 1 ? 1 : 0,
              borderColor: "divider",
              py: 2,
            }}
          >
            {/* Category Icon */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: "grey.100",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CategoryOutlined
                sx={{ color: "text.secondary", fontSize: 24 }}
              />
            </Box>

            {/* Expense Details */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {expense.category_name || "Sin categoría"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {expense.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatRelativeDate(expense.date)}
              </Typography>
            </Box>

            {/* Amount */}
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: "error.main",
                flexShrink: 0,
              }}
            >
              -{formatCurrency(expense.amount)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
