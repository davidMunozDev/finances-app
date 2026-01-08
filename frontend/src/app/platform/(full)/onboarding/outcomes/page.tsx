"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import { AddExpenseCategoryModal } from "@/components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOnboarding } from "@/onboarding";
import { useCurrency } from "@/hooks/useCurrency";
import { useCategories } from "@/data/categories/hooks";

const expenseSchema = z.object({
  category: z.string().min(1, "La categoría es requerida"),
  period: z.enum(["weekly", "monthly", "yearly"]),
  dayOfWeek: z.string().optional(),
  dayOfMonth: z.string().optional(),
  yearlyDate: z.string().optional(),
  expenses: z
    .array(
      z.object({
        name: z.string().min(1, "El nombre del gasto es requerido"),
        amount: z
          .number({ message: "Debe ser un número" })
          .min(0, "La cantidaddebe ser mayor o igual a 0"),
      })
    )
    .min(1, "Debe haber al menos un gasto"),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseCategory {
  id: string;
  category: string;
  period: string;
  dayOfWeek?: string;
  dayOfMonth?: string;
  yearlyDate?: string;
  expenses: Array<{ name: string; amount: number }>;
  total: number;
}

interface OutcomesProps {
  totalIncome?: number;
}

export default function Outcomes({ totalIncome = 0 }: OutcomesProps) {
  const { data, setCategories, setProvisions, setSubmitHandler } =
    useOnboarding();
  const { formatCurrency } = useCurrency();
  const { categories: apiCategories } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setLocalCategories] = useState<ExpenseCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "",
      period: "monthly",
      dayOfWeek: "1",
      dayOfMonth: "1",
      yearlyDate: "",
      expenses: [{ name: "", amount: 0 }],
    },
  });

  const period = watch("period");

  // Calcular total de ingresos del contexto
  const contextTotalIncome = data.incomes.reduce(
    (sum, inc) => sum + inc.amount,
    0
  );
  const actualTotalIncome = contextTotalIncome || totalIncome;

  const totalExpenses = categories.reduce((sum, cat) => sum + cat.total, 0);
  const remainingAmount = actualTotalIncome - totalExpenses;

  // Cargar categorías guardadas del contexto al montar (solo una vez)
  useEffect(() => {
    if (!isLoaded && data.provisions.length > 0) {
      // Reconstruir las categorías desde las provisiones guardadas
      const categoriesMap = new Map<string, ExpenseCategory>();

      data.provisions.forEach((provision) => {
        const categoryKey = provision.category_name;
        if (!categoriesMap.has(categoryKey)) {
          categoriesMap.set(categoryKey, {
            id: Date.now().toString() + Math.random(),
            category: provision.category_name,
            period: "monthly", // Default, ya que no guardamos este dato
            expenses: [],
            total: 0,
          });
        }

        const category = categoriesMap.get(categoryKey)!;
        category.expenses.push({
          name: provision.name,
          amount: provision.amount,
        });
        category.total += provision.amount;
      });

      setLocalCategories(Array.from(categoriesMap.values()));
      setIsLoaded(true);
    } else if (!isLoaded && data.provisions.length === 0) {
      setIsLoaded(true);
    }
  }, [data.provisions, isLoaded]);

  // Registrar handler que siempre permite continuar
  useEffect(() => {
    setSubmitHandler(async () => true);
    return () => setSubmitHandler(null);
  }, [setSubmitHandler]);

  // Guardar en el contexto cuando cambian las categorías
  useEffect(() => {
    // Extraer categorías únicas
    const uniqueCategories = Array.from(
      new Set(categories.map((cat) => cat.category))
    ).map((name) => ({ name, icon: "📁" }));

    // Extraer provisiones de gastos
    const provisions = categories.flatMap((cat) =>
      cat.expenses.map((exp) => ({
        category_name: cat.category,
        name: exp.name,
        amount: exp.amount,
      }))
    );

    setCategories(uniqueCategories);
    setProvisions(provisions);
  }, [categories, setCategories, setProvisions]);

  const onSubmit = (data: ExpenseFormData) => {
    const total = data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const newCategory: ExpenseCategory = {
      id: Date.now().toString(),
      category: data.category,
      period: data.period,
      dayOfWeek: data.dayOfWeek,
      dayOfMonth: data.dayOfMonth,
      yearlyDate: data.yearlyDate,
      expenses: data.expenses,
      total,
    };

    setLocalCategories([...categories, newCategory]);
    setModalOpen(false);
    reset();
  };

  const handleDeleteCategory = (id: string) => {
    setLocalCategories(categories.filter((cat) => cat.id !== id));
  };

  const existingCategories = apiCategories.map((cat) => cat.name);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      {/* Cantidad Restante */}
      <Box
        sx={{
          textAlign: "center",
          mb: 4,
          p: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 1, fontSize: "0.875rem" }}
        >
          Restante de ingresos
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: remainingAmount >= 0 ? "success.main" : "error.main",
            mb: 0.5,
          }}
        >
          {formatCurrency(remainingAmount)}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          de {formatCurrency(actualTotalIncome)}
        </Typography>
      </Box>

      {/* Lista de Categorías */}
      {categories.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}
          >
            Gastos recurrentes
          </Typography>

          {categories.map((category) => (
            <Card
              key={category.id}
              sx={{
                mb: 2,
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                {/* Nombre de Categoría y Total */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      flex: 1,
                    }}
                  >
                    {category.category}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "error.main" }}
                  >
                    {formatCurrency(category.total)}
                  </Typography>
                  {/* Botón Eliminar */}
                  <IconButton
                    onClick={() => handleDeleteCategory(category.id)}
                    size="small"
                    sx={{
                      color: "error.main",
                      ml: 1,
                      "&:hover": {
                        bgcolor: "error.lighter",
                      },
                    }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Botón Añadir Categoría */}
      <Button
        variant="outlined"
        startIcon={<AddCircleOutline />}
        onClick={() => setModalOpen(true)}
        fullWidth
        sx={{
          py: 1.5,
          borderRadius: 2,
          textTransform: "none",
          fontSize: "1rem",
          fontWeight: 500,
          borderStyle: "dashed",
          "&:hover": {
            borderStyle: "dashed",
            bgcolor: "primary.lighter",
          },
        }}
      >
        Añadir categoría de gasto
      </Button>

      {/* Modal Añadir Gasto */}
      <AddExpenseCategoryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          reset();
        }}
        onSubmit={handleSubmit(onSubmit)}
        control={control}
        errors={errors}
        remainingAmount={remainingAmount}
        period={period}
        existingCategories={existingCategories}
        showPeriodFields={false}
      />
    </Box>
  );
}
