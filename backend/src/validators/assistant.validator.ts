import { z } from "zod";

/**
 * Validator for AI Assistant query requests
 */
export const AssistantQuerySchema = z.object({
  question: z
    .string()
    .min(1, "La pregunta no puede estar vacía")
    .max(1000, "La pregunta no puede exceder 1000 caracteres"),
  budgetId: z.number().int().positive().optional(),
  timezone: z.string().optional().default("Europe/Madrid"),
});

export type AssistantQuerySchemaType = z.infer<typeof AssistantQuerySchema>;
