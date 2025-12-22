import type { Response } from "express";
import type { AuthRequest } from "../types/api.types";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";
import { getBudgetById } from "../services/budgets.service";
import { syncBudgetCycle } from "../services/budget-cycles.service";
import {
  createManualTransaction,
  listCycleTransactions,
  getCycleTotals,
} from "../services/transactions.service";

function parseId(v: string) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function addManual(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  if (!budgetId)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "budgetId inválido",
    });

  const budget = await getBudgetById(req.user!.id, budgetId);
  if (!budget)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });

  const cycle = await syncBudgetCycle({ userId: req.user!.id, budgetId });
  if (!cycle)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "No se pudo resolver el ciclo actual",
    });

  const { category_id, amount, description, date } = req.body ?? {};
  if (!Number.isInteger(category_id) || category_id <= 0)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "category_id inválido",
    });
  if (typeof amount !== "number" || amount <= 0)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "amount inválido",
    });

  const dateISO =
    typeof date === "string" ? date : new Date().toISOString().slice(0, 10);

  const id = await createManualTransaction({
    userId: req.user!.id,
    budgetId,
    cycleId: cycle.id,
    categoryId: category_id,
    description,
    amount,
    dateISO,
  });

  return res.status(201).json({ id, cycle });
}

export async function currentSummary(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  if (!budgetId)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "budgetId inválido",
    });

  const budget = await getBudgetById(req.user!.id, budgetId);
  if (!budget)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });

  const cycle = await syncBudgetCycle({ userId: req.user!.id, budgetId });
  if (!cycle)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "No se pudo resolver el ciclo actual",
    });

  const tx = await listCycleTransactions({
    userId: req.user!.id,
    budgetId,
    cycleId: cycle.id,
  });
  const totalSpent = await getCycleTotals({
    userId: req.user!.id,
    budgetId,
    cycleId: cycle.id,
  });

  return res.json({
    budget,
    cycle,
    totalSpent,
    transactions: tx,
  });
}
