"use client";

import { Box, InputAdornment } from "@mui/material";
import {
  AccountBalanceWalletOutlined,
  CalendarTodayOutlined,
  EventOutlined,
} from "@mui/icons-material";
import { FormTextField, FormSelect } from "@/components";
import { PERIODS, DAYS_OF_WEEK, DAYS_OF_MONTH } from "@/config/budget";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const budgetSchema = z
  .object({
    budgetName: z.string().min(1, "El nombre del presupuesto es requerido"),
    period: z.enum(["weekly", "monthly", "yearly"]),
    dayOfWeek: z.string().optional(),
    dayOfMonth: z.string().optional(),
    yearlyDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.period === "weekly" && !data.dayOfWeek) return false;
      if (data.period === "monthly" && !data.dayOfMonth) return false;
      if (data.period === "yearly" && !data.yearlyDate) return false;
      return true;
    },
    {
      message:
        "Debes completar el campo de fecha según el periodo seleccionado",
    }
  );

type BudgetFormData = z.infer<typeof budgetSchema>;

export default function Budget() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budgetName: "",
      period: "monthly",
      dayOfWeek: "1",
      dayOfMonth: "1",
      yearlyDate: "",
    },
  });

  const period = watch("period");

  const onSubmit = (data: BudgetFormData) => {
    console.log("Budget data:", data);
    // Aquí guardarías los datos
  };

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
                label="Día de inicio semanal"
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
                label="Fecha de inicio anual"
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
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 600, mx: "auto" }}
    >
      {/* Campo de Nombre del Presupuesto */}
      <Box sx={{ mb: 3 }}>
        <Controller
          name="budgetName"
          control={control}
          render={({ field }) => (
            <FormTextField
              {...field}
              label="Nombre del presupuesto"
              placeholder="Ej: Gastos mensuales"
              error={!!errors.budgetName}
              helperText={errors.budgetName?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceWalletOutlined
                      sx={{ color: "text.secondary" }}
                    />
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
      </Box>

      {/* Selector de Periodo */}
      <Box sx={{ mb: 3 }}>
        <Controller
          name="period"
          control={control}
          render={({ field }) => (
            <FormSelect
              {...field}
              label="Periodo del presupuesto"
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
      </Box>

      {/* Campo dinámico según el periodo seleccionado */}
      <Box>{renderPeriodField()}</Box>
    </Box>
  );
}
