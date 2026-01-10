import type { Response } from "express";
import type { AuthRequest } from "../types/api.types";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";
import { HTTP_STATUS } from "../constants/http-status";

import { getBudgetById } from "../services/budgets.service";
import { syncBudgetCycle } from "../services/budget-cycles.service";
import {
  createManualIncome,
  listCycleIncomes,
  updateIncome,
  deleteIncome,
} from "../services/incomes.service";

function parseId(v: string) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// POST /budgets/:budgetId/incomes
export async function create(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  if (!budgetId) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "budgetId inválido",
    });
  }

  const budget = await getBudgetById(req.user!.id, budgetId);
  if (!budget) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });
  }

  const cycle = await syncBudgetCycle({ userId: req.user!.id, budgetId });
  if (!cycle) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "No se pudo resolver el ciclo actual",
    });
  }

  const { amount, description, date } = req.body ?? {};
  if (typeof amount !== "number" || amount <= 0) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "amount inválido",
    });
  }

  const dateISO =
    typeof date === "string" ? date : new Date().toISOString().slice(0, 10);

  const id = await createManualIncome({
    userId: req.user!.id,
    budgetId,
    cycleId: cycle.id,
    description,
    amount,
    dateISO,
  });

  return res.status(HTTP_STATUS.CREATED).json({ id, cycle });
}

// GET /budgets/:budgetId/incomes
export async function getAll(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  if (!budgetId) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "budgetId inválido",
    });
  }

  const budget = await getBudgetById(req.user!.id, budgetId);
  if (!budget) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });
  }

  const cycle = await syncBudgetCycle({ userId: req.user!.id, budgetId });
  if (!cycle) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "No se pudo resolver el ciclo actual",
    });
  }

  const incomes = await listCycleIncomes({
    userId: req.user!.id,
    budgetId,
    cycleId: cycle.id,
  });
  return res.json({ cycle, incomes });
}

// PUT /budgets/:budgetId/incomes/:incomeId
export async function update(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  const incomeId = parseId(req.params.incomeId);

  if (!budgetId || !incomeId) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "budgetId o incomeId inválido",
    });
  }

  const budget = await getBudgetById(req.user!.id, budgetId);
  if (!budget) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });
  }

  const { amount, description, date } = req.body ?? {};
  if (typeof amount !== "number" || amount <= 0) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "amount inválido",
    });
  }

  const dateISO =
    typeof date === "string" ? date : new Date().toISOString().slice(0, 10);

  const updated = await updateIncome({
    userId: req.user!.id,
    budgetId,
    incomeId,
    description,
    amount,
    dateISO,
  });

  if (!updated) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "Ingreso no encontrado",
    });
  }

  return res.json({ success: true });
}

// DELETE /budgets/:budgetId/incomes/:incomeId
export async function remove(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  const incomeId = parseId(req.params.incomeId);

  if (!budgetId || !incomeId) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "budgetId o incomeId inválido",
    });
  }

  const budget = await getBudgetById(req.user!.id, budgetId);
  if (!budget) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });
  }

  const deleted = await deleteIncome({
    userId: req.user!.id,
    budgetId,
    incomeId,
  });

  if (!deleted) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "Ingreso no encontrado",
    });
  }

  return res.json({ success: true });
}
