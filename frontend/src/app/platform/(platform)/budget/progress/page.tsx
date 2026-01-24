"use client";

import { useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import BudgetTabs from "@/components/BudgetTabs";
import { BudgetOverviewCard } from "@/components/BudgetOverviewCard";
import { CategoryProgressCard } from "@/components/CategoryProgressCard";
import { useBudget } from "@/budget/BudgetProvider";
import { useProvisionProgress } from "@/budget/hooks";
import { useToast } from "@/hooks/useToast";
import { useCurrency } from "@/hooks/useCurrency";

export default function ProgressPage() {
  const { currentBudget } = useBudget();
  const { showToast } = useToast();
  const { formatCurrency } = useCurrency();

  const {
    categories,
    uncategorizedExpenses,
    totalBudgeted,
    totalSpent,
    totalRemaining,
    isLoading,
    isError,
  } = useProvisionProgress(currentBudget?.id || null);

  // Show error toast if there's an error
  useEffect(() => {
    if (isError) {
      showToast("Error al cargar los datos de progreso", "error");
    }
  }, [isError, showToast]);

  return (
    <Box
      sx={{
        py: { xs: 2.5, sm: 3, md: 4 },
        pb: { xs: 12, md: 4 },
      }}
    >
      {/* Tabs */}
      <BudgetTabs />

      {/* Loading State */}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Content */}
      {!isLoading && (
        <Box
          sx={{
            mt: 3,
            maxWidth: { xs: "100%", md: 900, lg: 1100 },
            mx: "auto",
          }}
        >
          <Stack spacing={3}>
            {/* Budget Overview Card */}
            <BudgetOverviewCard
              totalBudgeted={totalBudgeted}
              totalSpent={totalSpent}
              totalRemaining={totalRemaining}
            />

            {/* Category Progress Cards */}
            {categories.map((category) => (
              <CategoryProgressCard key={category.id} category={category} />
            ))}

            {/* Otros Gastos Section - Only show if there are uncategorized expenses */}
            {uncategorizedExpenses.length > 0 && (
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
                    mb: 2,
                  }}
                >
                  Otros gastos
                </Typography>

                <List sx={{ py: 0 }}>
                  {uncategorizedExpenses.map((expense, index) => (
                    <Box key={expense.id}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 1.5,
                        }}
                      >
                        <ListItemText
                          primary={expense.description}
                          secondary={new Date(expense.date).toLocaleDateString(
                            "es-ES",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                          primaryTypographyProps={{
                            fontWeight: 500,
                          }}
                        />
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            color: "error.main",
                          }}
                        >
                          {formatCurrency(expense.amount)}
                        </Typography>
                      </ListItem>
                      {index < uncategorizedExpenses.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </Box>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
