"use client";

import {
  Box,
  Button,
  Typography,
  InputAdornment,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  EuroSymbol,
  CameraAlt,
  AccountBalanceWallet,
  ExpandMore,
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
import { useBudget } from "@/budget/BudgetProvider";
import { createExpense } from "@/data/expenses/api";
import { useProvisions } from "@/data/provisions";
import { paths } from "@/config/paths";
import ReceiptScanModal from "@/add-expense/components/ReceiptScanModal";
import { ScanReceiptResponse } from "@/data/assistant/types";

// Validation schema with conditional logic
const expenseSchema = z
  .object({
    amount: z
      .number({ message: "Debe ser un número" })
      .positive("La cantidad debe ser mayor que 0"),
    budgetId: z.string().min(1, "Selecciona un presupuesto"),
    category: z.string().min(1, "La categoría es requerida"),
    provisionId: z.string().optional(),
    name: z.string().min(1, "El nombre del gasto es requerido"),
    detail: z.string().optional(),
    isOneTime: z.boolean(),
    period: z.enum(["weekly", "monthly", "yearly"]).optional(),
    dayOfWeek: z.string().optional(),
    dayOfMonth: z.string().optional(),
    yearlyDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.category !== "Otros" && !data.provisionId) {
        return false;
      }
      return true;
    },
    {
      message: "Selecciona una provisión",
      path: ["provisionId"],
    }
  )
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
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const {
    provisions,
    isLoading: provisionsLoading,
    mutate: mutateProvisions,
  } = useProvisions(selectedBudgetId);

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
      provisionId: "",
      isOneTime: true,
      name: "",
      detail: "",
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
  const budgetId = watch("budgetId");
  const category = watch("category");
  const provisionId = watch("provisionId");
  const isOneTime = watch("isOneTime");
  const period = watch("period");
  const detail = watch("detail");

  // Get existing category names for autocomplete - only categories with provisions + 'Otros'
  const categoriesWithProvisions = categories.filter(
    (cat) =>
      cat.name === "Otros" ||
      provisions.some((provision) => provision.category_id === cat.id)
  );
  const existingCategories = categoriesWithProvisions.map((cat) => cat.name);

  // Handle scan complete
  const handleScanComplete = (data: ScanReceiptResponse) => {
    if (data.amount) {
      setValue("amount", data.amount);
    }
    // Only set category if it exists in the available categories
    if (data.category && existingCategories.includes(data.category)) {
      setValue("category", data.category);
    }
    if (data.merchant) {
      setValue("name", data.merchant);
    }
    if (data.detail) {
      setValue("detail", data.detail);
    }
    setScanModalOpen(false);
  };

  // Update selectedBudgetId when budgetId changes
  useEffect(() => {
    setSelectedBudgetId(budgetId);
  }, [budgetId]);

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

  // Reset provisionId when category changes
  useEffect(() => {
    setValue("provisionId", "");
  }, [category, setValue]);

  // Filter provisions by selected category
  const selectedCategory = categories.find((cat) => cat.name === category);
  const filteredProvisions = provisions.filter(
    (provision) => provision.category_id === selectedCategory?.id
  );

  // Auto-select first provision if only one is available for the category
  useEffect(() => {
    if (filteredProvisions.length === 1 && !provisionId) {
      setValue("provisionId", filteredProvisions[0].id.toString());
    }
  }, [filteredProvisions, provisionId, setValue]);

  // Auto-fill name when provision is selected
  useEffect(() => {
    if (provisionId) {
      const selectedProvision = provisions.find(
        (p) => p.id.toString() === provisionId
      );
      if (selectedProvision) {
        setValue("name", selectedProvision.name);
      }
    }
  }, [provisionId, provisions, setValue]);

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
          ...(data.provisionId && { provision_id: parseInt(data.provisionId) }),
        };
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
      mutateProvisions(); // Refresh provisions list
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

        {/* Photo Button */}
        <Box>
          <Button
            variant="outlined"
            startIcon={<CameraAlt />}
            fullWidth
            onClick={() => setScanModalOpen(true)}
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

        {/* Provision Selector - Only show if category is not 'Otros' */}
        {category && category !== "Otros" && (
          <>
            <Controller
              name="provisionId"
              control={control}
              render={({ field }) => (
                <FormSelect
                  {...field}
                  label="Provisión"
                  options={filteredProvisions.map((provision) => ({
                    value: provision.id.toString(),
                    label: provision.name,
                  }))}
                  error={!!errors.provisionId}
                  disabled={provisionsLoading}
                />
              )}
            />
            {errors.provisionId && (
              <Typography
                variant="caption"
                sx={{ color: "error.main", mt: -2, ml: 1.75 }}
              >
                {errors.provisionId.message}
              </Typography>
            )}
          </>
        )}

        {/* Name Field */}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormTextField
              {...field}
              label="Nombre"
              placeholder="Ej: Comida, Alquiler, Netflix"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />

        {/* Detail Field (Accordion) */}
        {detail && (
          <Accordion
            sx={{
              bgcolor: "background.paper",
              borderRadius: 2,
              "&:before": { display: "none" },
              boxShadow: "none",
              border: 1,
              borderColor: "divider",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Typography sx={{ fontSize: "0.875rem", fontWeight: "medium" }}>
                Detalle del Recibo
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  color: "text.secondary",
                  fontFamily: "system-ui",
                }}
              >
                {detail}
              </Typography>
            </AccordionDetails>
          </Accordion>
        )}

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

      {/* Receipt Scan Modal */}
      <ReceiptScanModal
        open={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        budgetId={budgetId}
        onScanComplete={handleScanComplete}
      />
    </Box>
  );
}
