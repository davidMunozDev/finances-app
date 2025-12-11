"use client";

import { Box } from "@mui/material";
import { IncomeList } from "@/components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const incomeSchema = z.object({
  incomes: z
    .array(
      z.object({
        name: z.string().min(1, "El nombre del ingreso es requerido"),
        amount: z
          .number({ message: "Debe ser un número" })
          .min(0, "El monto debe ser mayor o igual a 0"),
      })
    )
    .min(1, "Debe haber al menos un ingreso"),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface IncomesProps {
  initialIncomes?: Array<{ name: string; amount: number }>;
}

export default function Incomes({ initialIncomes }: IncomesProps) {
  const defaultIncomes = initialIncomes || [{ name: "Salario", amount: 0 }];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      incomes: defaultIncomes,
    },
  });

  const onSubmit = (data: IncomeFormData) => {
    console.log("Incomes data:", data);
    // Aquí guardarías los datos
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 600, mx: "auto" }}
    >
      <IncomeList control={control} errors={errors} name="incomes" />
    </Box>
  );
}
