import { z } from "zod";

// one_time
const OneTimeExpenseSchema = z.object({
  type: z.literal("one_time"),
  category_id: z.number().int().positive(),
  provision_id: z.number().int().positive().optional(),
  amount: z.number().positive(),
  description: z.string().max(255).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(), // YYYY-MM-DD
});

// recurring schedules
const WeeklySchedule = z.object({
  frequency: z.literal("weekly"),
  dow: z.number().int().min(1).max(7), // 1..7 (Mon..Sun)
});

const MonthlySchedule = z.object({
  frequency: z.literal("monthly"),
  dom: z.number().int().min(1).max(28), // recomiendo 1..28
});

const YearlySchedule = z.object({
  frequency: z.literal("yearly"),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
});

const RecurringExpenseSchema = z.object({
  type: z.literal("recurring"),
  category_id: z.number().int().positive(),
  name: z.string().min(2).max(255),
  amount: z.number().positive(),
  schedule: z.discriminatedUnion("frequency", [
    WeeklySchedule,
    MonthlySchedule,
    YearlySchedule,
  ]),
});

export const ExpenseCreateSchema = z.discriminatedUnion("type", [
  OneTimeExpenseSchema,
  RecurringExpenseSchema,
]);

export type ExpenseCreateBody = z.infer<typeof ExpenseCreateSchema>;
