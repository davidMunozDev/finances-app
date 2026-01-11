"use client";

import { Box, Typography, TextField, Autocomplete } from "@mui/material";
import { useState } from "react";
import { type ExpenseFilters as ExpenseFiltersType } from "@/data/expenses/types";
import { Category } from "@/data/categories/types";

interface ExpenseFiltersProps {
  onFiltersChange: (
    filters: ExpenseFiltersType & { categoryId?: number | null }
  ) => void;
  categories: Category[];
}

export default function ExpenseFilters({
  onFiltersChange,
  categories,
}: ExpenseFiltersProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    onFiltersChange({
      startDate: value || undefined,
      endDate: endDate || undefined,
      categoryId: selectedCategory?.id || null,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
    onFiltersChange({
      startDate: startDate || undefined,
      endDate: value || undefined,
      categoryId: selectedCategory?.id || null,
    });
  };

  const handleCategoryChange = (
    _event: React.SyntheticEvent,
    newValue: Category | null
  ) => {
    setSelectedCategory(newValue);
    onFiltersChange({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      categoryId: newValue?.id || null,
    });
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        p: { xs: 2.5, sm: 3 },
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        mb: { xs: 2, md: 3 },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: 2.5,
        }}
      >
        Filtros
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {/* Start Date */}
        <Box>
          <Typography
            component="label"
            sx={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "medium",
              color: "text.primary",
              mb: 0.75,
            }}
          >
            Fecha inicio
          </Typography>
          <TextField
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            fullWidth
            InputProps={{
              sx: {
                borderRadius: 2,
                bgcolor: "background.paper",
              },
            }}
            inputProps={{
              max: endDate || undefined,
            }}
          />
        </Box>

        {/* End Date */}
        <Box>
          <Typography
            component="label"
            sx={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "medium",
              color: "text.primary",
              mb: 0.75,
            }}
          >
            Fecha fin
          </Typography>
          <TextField
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            fullWidth
            InputProps={{
              sx: {
                borderRadius: 2,
                bgcolor: "background.paper",
              },
            }}
            inputProps={{
              min: startDate || undefined,
            }}
          />
        </Box>

        {/* Category Filter */}
        <Box>
          <Typography
            component="label"
            sx={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "medium",
              color: "text.primary",
              mb: 0.75,
            }}
          >
            Categoría
          </Typography>
          <Autocomplete
            value={selectedCategory}
            onChange={handleCategoryChange}
            options={categories}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Todas las categorías"
                InputProps={{
                  ...params.InputProps,
                  sx: {
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  },
                }}
              />
            )}
          />
        </Box>
      </Box>
    </Box>
  );
}
