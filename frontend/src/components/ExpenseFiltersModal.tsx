"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  TextField,
  Autocomplete,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { type ExpenseFilters as ExpenseFiltersType } from "@/data/expenses/types";
import { Category } from "@/data/categories/types";

interface ExpenseFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (
    filters: ExpenseFiltersType & { categoryId?: number | null }
  ) => void;
  categories: Category[];
  initialFilters?: ExpenseFiltersType & { categoryId?: number | null };
}

export default function ExpenseFiltersModal({
  open,
  onClose,
  onApply,
  categories,
  initialFilters = {},
}: ExpenseFiltersModalProps) {
  const [startDate, setStartDate] = useState<string>(
    initialFilters.startDate || ""
  );
  const [endDate, setEndDate] = useState<string>(initialFilters.endDate || "");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    categories.find((c) => c.id === initialFilters.categoryId) || null
  );

  // Update local state when initialFilters change
  useEffect(() => {
    setStartDate(initialFilters.startDate || "");
    setEndDate(initialFilters.endDate || "");
    setSelectedCategory(
      categories.find((c) => c.id === initialFilters.categoryId) || null
    );
  }, [initialFilters, categories]);

  const handleApply = () => {
    onApply({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      categoryId: selectedCategory?.id || null,
    });
    onClose();
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setSelectedCategory(null);
    onApply({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          pt: 3,
          px: 3,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filtros
        </Typography>
        <Button
          onClick={onClose}
          sx={{
            minWidth: "auto",
            p: 1,
            color: "text.secondary",
          }}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
              onChange={(e) => setStartDate(e.target.value)}
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
              onChange={(e) => setEndDate(e.target.value)}
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
              onChange={(_event, newValue) => setSelectedCategory(newValue)}
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
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
        <Button
          onClick={handleClear}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 3,
          }}
        >
          Limpiar filtros
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 3,
          }}
        >
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
