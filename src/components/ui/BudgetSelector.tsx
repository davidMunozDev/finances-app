"use client";

import {
  Select,
  MenuItem,
  FormControl,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { useState } from "react";

export default function BudgetSelector() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedBudget, setSelectedBudget] = useState("Hogar");

  // Datos de ejemplo - reemplazar con datos reales
  const budgets = ["Hogar", "Personal", "Negocios", "Vacaciones"];

  return (
    <FormControl variant="standard" sx={{ minWidth: { xs: 120, md: 200 } }}>
      <Select
        value={selectedBudget}
        onChange={(e) => setSelectedBudget(e.target.value)}
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
        renderValue={(value) => (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.125rem", md: "1.25rem" },
              color: "text.primary",
            }}
          >
            {value}
          </Typography>
        )}
      >
        {budgets.map((budget) => (
          <MenuItem
            key={budget}
            value={budget}
            sx={{
              fontSize: "1rem",
              fontWeight: 500,
              py: 1.5,
              px: 2,
            }}
          >
            {budget}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
