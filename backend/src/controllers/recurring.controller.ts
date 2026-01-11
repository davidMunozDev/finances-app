import type { Response } from "express";
import type { AuthRequest } from "../types/api.types";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";
import { getBudgetById } from "../services/budgets.service";
import {
  listRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
} from "../services/recurring.service";
import { syncBudgetCycle } from "../services/budget-cycles.service";

function parseId(v: string) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function getAll(req: AuthRequest, res: Response) {
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

  return res.json(await listRecurring(budgetId));
}

export async function create(req: AuthRequest, res: Response) {
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

  const b = req.body ?? {};
  if (!Number.isInteger(b.category_id) || b.category_id <= 0)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "category_id inválido",
    });
  if (typeof b.name !== "string" || b.name.trim().length < 2)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "name inválido",
    });
  if (typeof b.amount !== "number" || b.amount <= 0)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "amount inválido",
    });

  if (!["weekly", "monthly", "yearly"].includes(b.frequency))
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "frequency inválido",
    });

  // Validación por tipo
  if (
    b.frequency === "weekly" &&
    (!Number.isInteger(b.dow) || b.dow < 1 || b.dow > 7)
  )
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "dow debe ser 1..7",
    });

  if (
    b.frequency === "monthly" &&
    (!Number.isInteger(b.dom) || b.dom < 1 || b.dom > 28)
  )
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "dom debe ser 1..28",
    });

  if (b.frequency === "yearly") {
    if (!Number.isInteger(b.month) || b.month < 1 || b.month > 12)
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "month debe ser 1..12",
      });
    if (!Number.isInteger(b.day) || b.day < 1 || b.day > 31)
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "day debe ser 1..31",
      });
  }

  const id = await createRecurring(budgetId, {
    category_id: b.category_id,
    name: b.name.trim(),
    amount: b.amount,
    frequency: b.frequency,
    ...(b.frequency === "weekly" ? { dow: b.dow } : {}),
    ...(b.frequency === "monthly" ? { dom: b.dom } : {}),
    ...(b.frequency === "yearly" ? { month: b.month, day: b.day } : {}),
  } as any);

  await syncBudgetCycle({ userId: req.user!.id, budgetId });

  return res.status(201).json({ id });
}

export async function update(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  const recurringId = parseId(req.params.recurringId);
  if (!budgetId || !recurringId)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "ids inválidos",
    });

  const budget = await getBudgetById(req.user!.id, budgetId);
  if (!budget)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });

  const b = req.body ?? {};
  if (!Number.isInteger(b.category_id) || b.category_id <= 0)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "category_id inválido",
    });
  if (typeof b.name !== "string" || b.name.trim().length < 2)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "name inválido",
    });
  if (typeof b.amount !== "number" || b.amount <= 0)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "amount inválido",
    });

  if (!["weekly", "monthly", "yearly"].includes(b.frequency))
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "frequency inválido",
    });

  // Validación por tipo
  if (
    b.frequency === "weekly" &&
    (!Number.isInteger(b.dow) || b.dow < 1 || b.dow > 7)
  )
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "dow debe ser 1..7",
    });

  if (
    b.frequency === "monthly" &&
    (!Number.isInteger(b.dom) || b.dom < 1 || b.dom > 28)
  )
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "dom debe ser 1..28",
    });

  if (b.frequency === "yearly") {
    if (!Number.isInteger(b.month) || b.month < 1 || b.month > 12)
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "month debe ser 1..12",
      });
    if (!Number.isInteger(b.day) || b.day < 1 || b.day > 31)
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "day debe ser 1..31",
      });
  }

  const ok = await updateRecurring(budgetId, recurringId, {
    category_id: b.category_id,
    name: b.name.trim(),
    amount: b.amount,
    frequency: b.frequency,
    ...(b.frequency === "weekly" ? { dow: b.dow } : {}),
    ...(b.frequency === "monthly" ? { dom: b.dom } : {}),
    ...(b.frequency === "yearly" ? { month: b.month, day: b.day } : {}),
  } as any);

  if (!ok)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Recurrente no encontrado",
    });

  await syncBudgetCycle({ userId: req.user!.id, budgetId });

  return res.status(200).json({ success: true });
}

export async function remove(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  const recurringId = parseId(req.params.recurringId);
  if (!budgetId || !recurringId)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "ids inválidos",
    });

  const budget = await getBudgetById(req.user!.id, budgetId);
  if (!budget)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });

  const ok = await deleteRecurring(budgetId, recurringId);
  if (!ok)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Recurrente no encontrado",
    });

  return res.status(204).send();
}
