import type { Response } from "express";
import type { AuthRequest } from "../types/api.types";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";
import { getBudgetById } from "../services/budgets.service";
import {
  listFixed,
  createFixed,
  deleteFixed,
  createFixedBulk,
} from "../services/fixed.service";
import { syncBudgetCycle } from "../services/budget-cycles.service";
import { CreateFixedBulkSchema } from "../validators/fixed.validator";

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

  const rows = await listFixed(budgetId);
  return res.json(rows);
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

  const { category_id, name, amount } = req.body ?? {};
  if (!Number.isInteger(category_id) || category_id <= 0) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "category_id inválido",
    });
  }
  if (typeof name !== "string" || name.trim().length < 2) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "name inválido",
    });
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "amount inválido",
    });
  }

  const id = await createFixed(budgetId, {
    category_id,
    name: name.trim(),
    amount,
  });
  await syncBudgetCycle({ userId: req.user!.id, budgetId });

  return res.status(201).json({ id });
}

export async function remove(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  const fixedId = parseId(req.params.fixedId);
  if (!budgetId || !fixedId)
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

  const ok = await deleteFixed(budgetId, fixedId);
  if (!ok)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Gasto fijo no encontrado",
    });

  return res.status(204).send();
}

// POST /budgets/:budgetId/fixed-expenses/bulk
export async function createBulk(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  if (!budgetId) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "budgetId inválido",
    });
  }

  const budget = await getBudgetById(req.user!.id, budgetId);
  if (!budget) {
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });
  }

  const parsed = CreateFixedBulkSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Body inválido",
      details: parsed.error.flatten(),
    });
  }

  const items = parsed.data.items.map((i) => ({
    category_id: i.category_id,
    name: i.name.trim(),
    amount: i.amount,
  }));

  const ids = await createFixedBulk({ budgetId, items });

  await syncBudgetCycle({ userId: req.user!.id, budgetId });

  return res.status(201).json({
    created: ids.map((id) => ({ id })),
  });
}
