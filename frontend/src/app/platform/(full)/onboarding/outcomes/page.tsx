"use client";

import { useState } from "react";
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
          .min(0, "El monto debe ser mayor o igual a 0"),
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

export default function Outcomes({ totalIncome = 1000 }: OutcomesProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

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

  const totalExpenses = categories.reduce((sum, cat) => sum + cat.total, 0);
  const remainingAmount = totalIncome - totalExpenses;

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

    setCategories([...categories, newCategory]);
    setModalOpen(false);
    reset();
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  const existingCategories = categories.map((cat) => cat.category);

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
          }}
        >
          ${remainingAmount.toFixed(2)}
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
                    ${category.total.toFixed(2)}
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
      />
    </Box>
  );
}
