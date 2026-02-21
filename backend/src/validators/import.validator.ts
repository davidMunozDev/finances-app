import { z } from "zod";

export const ProcessFileSchema = z.object({
  content: z
    .string()
    .min(1, "El contenido del archivo es requerido")
    .max(3_000_000, "El archivo es demasiado grande"),
  format: z.enum(["csv", "pdf"]),
  budgetId: z.number().int().positive(),
});

export const BulkImportSchema = z.object({
  transactions: z
    .array(
      z.object({
        type: z.enum(["income", "expense"]),
        amount: z.number().positive("El importe debe ser positivo"),
        description: z.string().optional(),
        date: z
          .string()
          .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "La fecha debe tener formato YYYY-MM-DD",
          ),
        category_id: z.number().int().positive().nullable().optional(),
      }),
    )
    .min(1, "Debe incluir al menos una transacción")
    .max(500, "Máximo 500 transacciones por importación"),
});
