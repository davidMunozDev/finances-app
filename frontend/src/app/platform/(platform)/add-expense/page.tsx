"use client";

import { Box, Button, Typography, InputAdornment, Switch } from "@mui/material";
import {
  EuroSymbol,
  CameraAlt,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormTextField } from "@/components/FormTextField";
import FormSelect from "@/components/FormSelect";
import CategoryAutocomplete from "@/components/CategoryAutocomplete";
import PeriodSelector from "@/components/PeriodSelector";
import PeriodDynamicField from "@/components/PeriodDynamicField";
import { useCategories } from "@/data/categories/hooks";
import type { Category } from "@/data/categories/types";
import { useBudget } from "@/budget/BudgetProvider";
import { createExpense } from "@/data/expenses/api";
import { paths } from "@/config/paths";

// Validation schema with conditional logic
const expenseSchema = z
  .object({
    amount: z
      .number({ message: "Debe ser un número" })
      .positive("La cantidad debe ser mayor que 0"),
    budgetId: z.string().min(1, "Selecciona un presupuesto"),
    category: z.string().min(1, "La categoría es requerida"),
    name: z.string().min(1, "El nombre del gasto es requerido"),
    isOneTime: z.boolean(),
    period: z.enum(["weekly", "monthly", "yearly"]).optional(),
    dayOfWeek: z.string().optional(),
    dayOfMonth: z.string().optional(),
    yearlyDate: z.string().optional(),
  })
  .refine(
    (data) => {
      // If recurring, period is required
      if (!data.isOneTime && !data.period) {
        return false;
      }
      return true;
    },
    {
      message: "El periodo es requerido para gastos recurrentes",
      path: ["period"],
    }
  )
  .refine(
    (data) => {
      // If recurring and weekly, dayOfWeek is required
      if (!data.isOneTime && data.period === "weekly" && !data.dayOfWeek) {
        return false;
      }
      return true;
    },
    {
      message: "Selecciona un día de la semana",
      path: ["dayOfWeek"],
    }
  )
  .refine(
    (data) => {
      // If recurring and monthly, dayOfMonth is required
      if (!data.isOneTime && data.period === "monthly" && !data.dayOfMonth) {
        return false;
      }
      return true;
    },
    {
      message: "Selecciona un día del mes",
      path: ["dayOfMonth"],
    }
  )
  .refine(
    (data) => {
      // If recurring and yearly, yearlyDate is required
      if (!data.isOneTime && data.period === "yearly" && !data.yearlyDate) {
        return false;
      }
      return true;
    },
    {
      message: "Selecciona una fecha",
      path: ["yearlyDate"],
    }
  );

type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function AddExpensePage() {
  const { categories } = useCategories();
  const { budgets, currentBudget, isLoading: budgetsLoading } = useBudget();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map budgets to select options
  const budgetOptions = budgets.map((budget) => ({
    value: budget.id.toString(),
    label: budget.name,
  }));

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: undefined,
      budgetId: currentBudget ? currentBudget.id.toString() : "",
      category: "",
      isOneTime: true,
      name: "",
      period: "monthly",
      dayOfWeek: "1", // Lunes por defecto
      dayOfMonth: "1", // Día 1 por defecto
      yearlyDate: new Date().toISOString().split("T")[0], // Fecha actual por defecto
    },
  });

  // Set budgetId when currentBudget becomes available
  useEffect(() => {
    if (currentBudget && !watch("budgetId")) {
      setValue("budgetId", currentBudget.id.toString());
    }
  }, [currentBudget, setValue, watch]);

  // Watch values for conditional rendering
  const isOneTime = watch("isOneTime");
  const period = watch("period");

  useEffect(() => {
    if (!isOneTime && period) {
      switch (period) {
        case "weekly":
          setValue("dayOfWeek", "1");
          break;
        case "monthly":
          setValue("dayOfMonth", "1");
          break;
        case "yearly":
          setValue("yearlyDate", new Date().toISOString().split("T")[0]);
          break;
      }
    }
  }, [period, isOneTime, setValue]);

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Find category ID from category name
      const category = categories.find((cat) => cat.name === data.category);
      if (!category) {
        setError(
          "Categoría no válida. Por favor, selecciona una categoría existente."
        );
        setIsSubmitting(false);
        return;
      }
      let payload: any;
      // Transform form data to API format
      if (data.isOneTime) {
        // One-time expense
        payload = {
          type: "one_time" as const,
          category_id: category.id,
          amount: data.amount,
          description: data.name,
          date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        };

        await createExpense(data.budgetId, payload);
      } else {
        // Recurring expense
        const schedule: {
          frequency: "weekly" | "monthly" | "yearly";
          dow?: number;
          dom?: number;
          month?: number;
          day?: number;
        } = {
          frequency: data.period!,
        };

        // Only include the field corresponding to the selected period
        if (data.period === "weekly" && data.dayOfWeek) {
          schedule.dow = parseInt(data.dayOfWeek);
        } else if (data.period === "monthly" && data.dayOfMonth) {
          schedule.dom = parseInt(data.dayOfMonth);
        } else if (data.period === "yearly" && data.yearlyDate) {
          const dateParts = data.yearlyDate.split("-");
          schedule.month = parseInt(dateParts[1]);
          schedule.day = parseInt(dateParts[2]);
        }

        payload = {
          type: "recurring" as const,
          category_id: category.id,
          name: data.name,
          amount: data.amount,
          schedule,
        };
      }
      await createExpense(data.budgetId, payload);
      router.push(paths.platform.home);
    } catch (err) {
      console.error("Error creating expense:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear el gasto. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get existing category names for autocomplete
  const existingCategories = categories?.map((cat: Category) => cat.name) || [];

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        py: { xs: 2, md: 3 },
        px: { xs: 2, md: 0 },
      }}
    >
      {error && (
        <Typography
          sx={{
            color: "error.main",
            bgcolor: "error.light",
            p: 2,
            borderRadius: 2,
            mb: 2,
          }}
        >
          {error}
        </Typography>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* Amount Field */}
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <FormTextField
              {...field}
              label="Cantidad"
              type="number"
              placeholder="0.00"
              error={!!errors.amount}
              helperText={errors.amount?.message}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                field.onChange(parseFloat(e.target.value))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EuroSymbol sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              inputProps={{
                step: "0.01",
                min: "0",
              }}
            />
          )}
        />

        {/* Photo Button (UI only) */}
        <Box>
          <Button
            variant="outlined"
            startIcon={<CameraAlt />}
            fullWidth
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              py: 1.5,
              borderRadius: 2,
              color: "text.secondary",
              borderColor: "divider",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "rgba(47, 126, 248, 0.04)",
              },
            }}
          >
            Escanear recibo
          </Button>
        </Box>

        {/* Budget Selector */}
        <Controller
          name="budgetId"
          control={control}
          render={({ field }) => (
            <FormSelect
              {...field}
              label="Presupuesto"
              startIcon={
                <AccountBalanceWallet sx={{ color: "text.secondary" }} />
              }
              options={budgetOptions}
              error={!!errors.budgetId}
            />
          )}
        />
        {errors.budgetId && (
          <Typography
            variant="caption"
            sx={{ color: "error.main", mt: -2, ml: 1.75 }}
          >
            {errors.budgetId.message}
          </Typography>
        )}

        {/* Category Autocomplete */}
        <CategoryAutocomplete
          control={control}
          name="category"
          error={errors.category}
          existingCategories={existingCategories}
        />

        {/* Name Field */}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormTextField
              {...field}
              label="Nombre del gasto"
              placeholder="Ej: Comida, Alquiler, Netflix"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "background.paper",
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: "medium",
                color: "text.primary",
              }}
            >
              Gasto puntual
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block" }}
            >
              {isOneTime ? "Gasto de una sola vez" : "Gasto recurrente"}
            </Typography>
          </Box>
          <Controller
            name="isOneTime"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                color="primary"
              />
            )}
          />
        </Box>

        {!isOneTime && (
          <>
            <PeriodSelector
              control={control}
              name="period"
              error={errors.period}
            />

            <PeriodDynamicField
              control={control}
              period={period || ""}
              errors={errors}
            />
          </>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting || budgetsLoading}
          sx={{
            textTransform: "none",
            fontSize: "1rem",
            py: 1.75,
            mt: 2,
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(47, 126, 248, 0.3)",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(47, 126, 248, 0.4)",
            },
          }}
        >
          {isSubmitting ? "Añadiendo..." : "Añadir Gasto"}
        </Button>
      </Box>
    </Box>
  );
}
