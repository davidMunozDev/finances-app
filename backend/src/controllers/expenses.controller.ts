import type { Response } from "express";
import type { AuthRequest } from "../types/api.types";

import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";
import { HTTP_STATUS } from "../constants/http-status";

import { ExpenseCreateSchema } from "../validators/expense.validator";
import { getBudgetById } from "../services/budgets.service";
import { syncBudgetCycle } from "../services/budget-cycles.service";
import { createExpense } from "../services/expenses.service";
import { listExpenses } from "../services/transactions.service";

function parseId(v: string) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// POST /budgets/:budgetId/expenses
export async function create(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  if (!budgetId) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "budgetId inválido",
    });
  }

  // asegurar que el presupuesto pertenece al usuario
  const budget = await getBudgetById(req.user!.id, budgetId);
  if (!budget) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });
  }

  // Validación Zod
  const parsed = ExpenseCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
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

  return res.status(HTTP_STATUS.CREATED).json(result);
}

// GET /budgets/:budgetId/expenses
export async function getAll(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  if (!budgetId) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "budgetId inválido",
    });
  }

  // asegurar que el presupuesto pertenece al usuario
  const budget = await getBudgetById(req.user!.id, budgetId);
  if (!budget) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });
  }

  // Parse query parameters
  const { startDate, endDate, all, provisionId } = req.query;
  const allExpenses = all === "true";

  // Parse provisionId if provided
  let parsedProvisionId: number | undefined;
  if (provisionId && typeof provisionId === "string") {
    const num = parseId(provisionId);
    if (!num) {
      throw new AppError({
        status: HTTP_STATUS.BAD_REQUEST,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "provisionId inválido",
      });
    }
    parsedProvisionId = num;
  }

  // Validate date format if provided (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (
    startDate &&
    typeof startDate === "string" &&
    !dateRegex.test(startDate)
  ) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "startDate debe tener formato YYYY-MM-DD",
    });
  }
  if (endDate && typeof endDate === "string" && !dateRegex.test(endDate)) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "endDate debe tener formato YYYY-MM-DD",
    });
  }

  // Validate startDate <= endDate
  if (
    startDate &&
    endDate &&
    typeof startDate === "string" &&
    typeof endDate === "string" &&
    startDate > endDate
  ) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "startDate debe ser menor o igual que endDate",
    });
  }

  let cycleId: number | undefined;
  if (!allExpenses && !startDate && !endDate) {
    // Default: get current cycle expenses
    const cycle = await syncBudgetCycle({ userId: req.user!.id, budgetId });
    if (!cycle) {
      throw new AppError({
        status: HTTP_STATUS.NOT_FOUND,
        code: ERROR_CODES.NOT_FOUND,
        message: "No se pudo resolver el ciclo actual",
      });
    }
    cycleId = cycle.id;
  }

  const expenses = await listExpenses({
    userId: req.user!.id,
    budgetId,
    cycleId,
    provisionId: parsedProvisionId,
    startDate: typeof startDate === "string" ? startDate : undefined,
    endDate: typeof endDate === "string" ? endDate : undefined,
    all: allExpenses,
  });

  return res.json(expenses);
}
