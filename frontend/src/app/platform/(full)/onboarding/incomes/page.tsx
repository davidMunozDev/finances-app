"use client";

import { useEffect } from "react";
import { Box } from "@mui/material";
import { IncomeList } from "@/components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOnboarding } from "@/onboarding";

const incomeSchema = z.object({
  incomes: z
    .array(
      z.object({
        name: z.string().min(1, "El nombre del ingreso es requerido"),
        amount: z
          .number({ message: "Debe ser un número" })
          .min(0, "La cantidad debe ser mayor o igual a 0"),
      })
    )
    .min(1, "Debe haber al menos un ingreso"),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

export default function Incomes() {
  const { data, setIncomes, setSubmitHandler } = useOnboarding();
  const defaultIncomes =
    data.incomes.length > 0
      ? data.incomes.map((inc) => ({
          name: inc.description,
          amount: inc.amount,
        }))
      : [{ name: "Salario", amount: 0 }];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      incomes: defaultIncomes,
    },
  });

  // Actualizar valores del formulario cuando cambian los datos del contexto
  useEffect(() => {
    const newIncomes =
      data.incomes.length > 0
        ? data.incomes.map((inc) => ({
            name: inc.description,
            amount: inc.amount,
          }))
        : [{ name: "Salario", amount: 0 }];
    reset({ incomes: newIncomes });
  }, [data.incomes, reset]);

  const onSubmit = (formData: IncomeFormData) => {
    setIncomes(
      formData.incomes.map((income) => ({
        description: income.name,
        amount: income.amount,
      }))
    );
    return true;
  };

  useEffect(() => {
    setSubmitHandler(async () => {
      return new Promise((resolve) => {
        handleSubmit(
          (data) => {
            onSubmit(data);
            resolve(true);
          },
          () => resolve(false)
        )();
      });
    });

    return () => setSubmitHandler(null);
  }, [handleSubmit, setSubmitHandler]);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <IncomeList control={control} errors={errors} name="incomes" />
    </Box>
  );
}
