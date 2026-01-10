import type { Response } from "express";
import type { AuthRequest } from "../types/api.types";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";
import { getBudgetById } from "../services/budgets.service";
import {
  listProvisions,
  createProvision,
  deleteProvision,
  createProvisionBulk,
  updateProvision,
} from "../services/provisions.service";
import { CreateProvisionBulkSchema } from "../validators/provision.validator";

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

  const rows = await listProvisions(budgetId);
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

  const id = await createProvision(budgetId, {
    category_id,
    name: name.trim(),
    amount,
  });

  return res.status(201).json({ id });
}

export async function remove(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  const provisionId = parseId(req.params.provisionId);
  if (!budgetId || !provisionId)
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

  const ok = await deleteProvision(budgetId, provisionId);
  if (!ok)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Provisión no encontrada",
    });

  return res.status(204).send();
}

// PUT /budgets/:budgetId/provisions/:provisionId
export async function update(req: AuthRequest, res: Response) {
  const budgetId = parseId(req.params.budgetId);
  const provisionId = parseId(req.params.provisionId);

  if (!budgetId || !provisionId) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "ids inválidos",
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

  const updated = await updateProvision({
    budgetId,
    provisionId,
    name: name.trim(),
    amount,
    category_id,
  });

  if (!updated) {
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Provisión no encontrada",
    });
  }

  return res.json({ success: true });
}

// POST /budgets/:budgetId/provisions/bulk
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

  const parsed = CreateProvisionBulkSchema.safeParse(req.body);
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

  const ids = await createProvisionBulk({ budgetId, items });

  return res.status(201).json({
    created: ids.map((id) => ({ id })),
  });
}
