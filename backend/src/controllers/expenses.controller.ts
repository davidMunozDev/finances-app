import type { Response } from "express";
import type { AuthRequest } from "../types/api.types";

import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";

import { ExpenseCreateSchema } from "../validators/expense.validator";
import { getBudgetById } from "../services/budgets.service";
import { createExpense } from "../services/expenses.service";

function parseId(v: string) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// POST /budgets/:budgetId/expenses
export async function create(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  if (!budgetId) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "budgetId inválido",
    });
  }

  // asegurar que el presupuesto pertenece al usuario
  const budget = await getBudgetById(req.user!.id, budgetId);
  if (!budget) {
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });
  }

  // Validación Zod
  const parsed = ExpenseCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Body inválido",
      details: parsed.error.flatten(),
    });
  }

  const result = await createExpense({
    userId: req.user!.id,
    budgetId,
    body: parsed.data,
  });

  return res.status(201).json(result);
}
