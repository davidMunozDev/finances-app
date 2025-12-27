"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  InputAdornment,
  Autocomplete,
  TextField,
} from "@mui/material";
import {
  CategoryOutlined,
  CalendarTodayOutlined,
  EventOutlined,
  Close,
} from "@mui/icons-material";
import { FormTextField, FormSelect } from "@/components";
import ExpenseList from "./ExpenseList";
import { Control, Controller } from "react-hook-form";
import { PERIODS, DAYS_OF_WEEK, DAYS_OF_MONTH } from "@/config/budget";
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
}: AddExpenseCategoryModalProps) {
  const { formatCurrency } = useCurrency();

  const renderPeriodField = () => {
    switch (period) {
      case "weekly":
        return (
          <Controller
            name="dayOfWeek"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                label="Día de inicio"
                error={!!errors.dayOfWeek}
                startIcon={
                  <CalendarTodayOutlined sx={{ color: "text.secondary" }} />
                }
                options={DAYS_OF_WEEK.map((day) => ({
                  value: day.value,
                  label: day.label,
                }))}
              />
            )}
          />
        );
      case "monthly":
        return (
          <Controller
            name="dayOfMonth"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                label="Día del mes"
                error={!!errors.dayOfMonth}
                startIcon={
                  <CalendarTodayOutlined sx={{ color: "text.secondary" }} />
                }
                options={DAYS_OF_MONTH.map((day) => ({
                  value: day.value,
                  label: day.label,
                }))}
              />
            )}
          />
        );
      case "yearly":
        return (
          <Controller
            name="yearlyDate"
            control={control}
            render={({ field }) => (
              <FormTextField
                {...field}
                label="Fecha de inicio"
                type="date"
                error={!!errors.yearlyDate}
                helperText={errors.yearlyDate?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventOutlined sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  },
                }}
              />
            )}
          />
        );
      default:
        return null;
    }
  };

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
          <Controller
            name="category"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                freeSolo
                value={value}
                onChange={(_, newValue) => onChange(newValue)}
                onInputChange={(_, newValue) => onChange(newValue)}
                options={existingCategories}
                sx={{ mt: 2 }}
                renderInput={(params) => (
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
                    <TextField
                      {...params}
                      placeholder="Ej: Casa, Transporte, Ocio"
                      error={!!errors.category}
                      helperText={errors.category?.message}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <CategoryOutlined
                                sx={{ color: "text.secondary" }}
                              />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                        sx: {
                          borderRadius: 2,
                          bgcolor: "background.paper",
                        },
                      }}
                    />
                  </Box>
                )}
              />
            )}
          />

          {/* Selector de Periodo */}
          <Controller
            name="period"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                label="Periodo"
                error={!!errors.period}
                startIcon={
                  <CalendarTodayOutlined sx={{ color: "text.secondary" }} />
                }
                options={PERIODS.map((p) => ({
                  value: p.value,
                  label: p.label,
                  subtitle: p.subtitle,
                }))}
              />
            )}
          />

          {/* Campo dinámico según el periodo */}
          {renderPeriodField()}

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
