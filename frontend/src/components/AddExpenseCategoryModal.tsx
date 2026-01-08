"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import {
  CategoryAutocomplete,
  PeriodSelector,
  PeriodDynamicField,
} from "@/components";
import ExpenseList from "./ExpenseList";
import { Control } from "react-hook-form";
import { useCurrency } from "@/hooks/useCurrency";

interface AddExpenseCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  control: Control<any>;
  errors: any;
  remainingAmount: number;
  period: string;
  existingCategories: string[];
  showPeriodFields?: boolean;
}

export default function AddExpenseCategoryModal({
  open,
  onClose,
  onSubmit,
  control,
  errors,
  remainingAmount,
  period,
  existingCategories,
  showPeriodFields = true,
}: AddExpenseCategoryModalProps) {
  const { formatCurrency } = useCurrency();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: "background.default",
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
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Añadir categoría de gasto
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Restante: {formatCurrency(remainingAmount)}
          </Typography>
        </Box>
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

      <DialogContent sx={{ pt: 3, px: 3, maxWidth: 600, mx: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Campo Categoría con Autocomplete */}
          <Box sx={{ mt: 2 }}>
            <CategoryAutocomplete
              control={control}
              error={errors.category}
              existingCategories={existingCategories}
            />
          </Box>

          {/* Selector de Periodo */}
          {showPeriodFields && (
            <PeriodSelector control={control} error={errors.period} />
          )}

          {/* Campo dinámico según el periodo */}
          {showPeriodFields && (
            <PeriodDynamicField
              control={control}
              period={period}
              errors={errors}
            />
          )}

          {/* Lista de Gastos */}
          <Box>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: "medium",
                color: "text.primary",
                mb: 2,
              }}
            >
              Gastos
            </Typography>
            <ExpenseList control={control} errors={errors} name="expenses" />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            fontSize: "1rem",
            px: 3,
            borderRadius: 2,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          sx={{
            textTransform: "none",
            fontSize: "1rem",
            px: 4,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(47, 126, 248, 0.3)",
          }}
        >
          Añadir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
