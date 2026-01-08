"use client";

import {
  Select,
  MenuItem,
  FormControl,
  Typography,
  Skeleton,
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { useBudget } from "@/budget/BudgetProvider";

export default function BudgetSelector() {
  const { budgets, currentBudget, isLoading, setCurrentBudget } = useBudget();

  // Show loading skeleton while budgets are being fetched
  if (isLoading) {
    return (
      <Skeleton
        variant="text"
        width={200}
        height={32}
        sx={{ bgcolor: "action.hover" }}
      />
    );
  }

  // No budgets available
  if (budgets.length === 0) {
    return (
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: { xs: "1.125rem", md: "1.25rem" },
          color: "text.secondary",
        }}
      >
        Sin presupuestos
      </Typography>
    );
  }

  return (
    <FormControl variant="standard" sx={{ minWidth: { xs: 120, md: 200 } }}>
      <Select
        value={currentBudget?.id || ""}
        onChange={(e) => setCurrentBudget(e.target.value as number)}
        disableUnderline
        IconComponent={KeyboardArrowDown}
        sx={{
          color: "text.primary",
          fontWeight: 700,
          fontSize: { xs: "1.125rem", md: "1.25rem" },
          "& .MuiSelect-select": {
            py: 0,
            px: 0,
            display: "flex",
            alignItems: "center",
            backgroundColor: "transparent",
            "&:focus": {
              backgroundColor: "transparent",
            },
          },
          "& .MuiSelect-icon": {
            color: "text.primary",
            fontSize: "1.5rem",
            right: -4,
          },
        }}
        renderValue={(value) => {
          const budget = budgets.find((b) => b.id === value);
          return (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.125rem", md: "1.25rem" },
                color: "text.primary",
              }}
            >
              {budget?.name || "Seleccionar presupuesto"}
            </Typography>
          );
        }}
      >
        {budgets.map((budget) => (
          <MenuItem
            key={budget.id}
            value={budget.id}
            sx={{
              fontSize: "1rem",
              fontWeight: 500,
              py: 1.5,
              px: 2,
            }}
          >
            {budget.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
