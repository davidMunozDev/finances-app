"use client";

import { Box, Typography, Skeleton } from "@mui/material";
import { CategoryOutlined } from "@mui/icons-material";
import Link from "next/link";
import { useCurrency } from "@/hooks/useCurrency";
import { useLocale } from "@/hooks/useLocale";
import type { Transaction } from "@/dashboard/types";
import { DashboardCard } from "./DashboardCard";

interface RecentTransactionsListProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function RecentTransactionsList({
  transactions,
  isLoading = false,
}: RecentTransactionsListProps) {
  const { formatCurrency } = useCurrency();
  const { formatRelativeDate } = useLocale();

  // Show only the 5 most recent transactions
  const recentTransactions = transactions.slice(0, 3);

  if (isLoading) {
    return (
      <DashboardCard isLoading>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 3 }} />
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
      </DashboardCard>
    );
  }

  if (recentTransactions.length === 0) {
    return (
      <DashboardCard>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0 }}>
          Transacciones más recientes
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
            No hay transacciones recientes
          </Typography>
        </Box>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: 0,
        }}
      >
        Transacciones más recientes
      </Typography>

      <Box>
        {recentTransactions.map((transaction, index) => (
          <Link
            key={transaction.id}
            href="#"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderBottom: index < recentTransactions.length - 1 ? 1 : 0,
                borderColor: "divider",
                cursor: "pointer",
                transition: "background-color 0.2s ease-in-out",
                p: 1,
                mx: -1,
                "&:hover": {
                  bgcolor: "action.hover",
                },
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

              {/* Transaction Details */}
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
                  {transaction.category_name || "Miscelánea"}
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
                  {transaction.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatRelativeDate(transaction.date)}
                </Typography>
              </Box>

              {/* Amount */}
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color:
                    transaction.type === "expense"
                      ? "error.main"
                      : "success.main",
                  flexShrink: 0,
                }}
              >
                {transaction.type === "expense" ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </Typography>
            </Box>
          </Link>
        ))}
      </Box>
    </DashboardCard>
  );
}
