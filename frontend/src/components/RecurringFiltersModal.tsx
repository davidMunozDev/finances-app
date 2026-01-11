"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  Autocomplete,
  TextField,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState, useMemo } from "react";
import { Category } from "@/data/categories/types";

interface RecurringFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: { categoryId?: number | null }) => void;
  categories: Category[];
  initialFilters?: { categoryId?: number | null };
}

export default function RecurringFiltersModal({
  open,
  onClose,
  onApply,
  categories,
  initialFilters = {},
}: RecurringFiltersModalProps) {
  const initialCategory = useMemo(
    () => categories.find((c) => c.id === initialFilters.categoryId) || null,
    [categories, initialFilters.categoryId]
  );

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    initialCategory
  );

  const handleApply = () => {
    onApply({
      categoryId: selectedCategory?.id || null,
    });
    onClose();
  };

  const handleClear = () => {
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
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Category Filter */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                mb: 1,
                color: "text.secondary",
              }}
            >
              Categoría
            </Typography>
            <Autocomplete
              value={selectedCategory}
              onChange={(_, newValue) => setSelectedCategory(newValue)}
              options={categories}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Todas las categorías"
                  size="small"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleClear}
          variant="outlined"
          sx={{
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Limpiar
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
