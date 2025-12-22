import type { Response } from "express";
import type { AuthRequest } from "../types/api.types";
import type { CreateBudgetBody, UpdateBudgetBody } from "../types/budget.types";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";
import {
  listBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budgets.service";
import { syncBudgetCycle } from "../services/budget-cycles.service";

function parseId(v: string) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function validateCreate(body: any): asserts body is CreateBudgetBody {
  if (
    !body?.name ||
    typeof body.name !== "string" ||
    body.name.trim().length < 2
  ) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "name es obligatorio (mínimo 2 caracteres)",
    });
  }
  if (!["weekly", "monthly", "yearly"].includes(body.reset_type)) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "reset_type inválido",
    });
  }

  if (body.reset_type === "weekly") {
    if (
      !Number.isInteger(body.reset_dow) ||
      body.reset_dow < 1 ||
      body.reset_dow > 7
    ) {
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "reset_dow debe ser 1..7",
      });
    }
  }

  if (body.reset_type === "monthly") {
    if (
      !Number.isInteger(body.reset_dom) ||
      body.reset_dom < 1 ||
      body.reset_dom > 28
    ) {
      // recomendable 1..28 para evitar meses sin 31/30/29
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "reset_dom debe ser 1..28",
      });
    }
  }

  if (body.reset_type === "yearly") {
    if (
      !Number.isInteger(body.reset_month) ||
      body.reset_month < 1 ||
      body.reset_month > 12
    ) {
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "reset_month debe ser 1..12",
      });
    }
    if (
      !Number.isInteger(body.reset_day) ||
      body.reset_day < 1 ||
      body.reset_day > 31
    ) {
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "reset_day debe ser 1..31",
      });
    }
  }
}

// GET /budgets
export async function getAll(req: AuthRequest, res: Response) {
  const budgets = await listBudgets(req.user!.id);
  return res.json(budgets);
}

// POST /budgets
export async function create(req: AuthRequest, res: Response) {
  const body = req.body;
  validateCreate(body);

  const created = await createBudget(req.user!.id, {
    ...body,
    name: body.name.trim(),
  });

  if (!created)
    throw new AppError({
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "No se pudo crear el presupuesto",
    });

  // Creamos/aseguramos ciclo actual al crear presupuesto (para que el usuario lo vea ya “activo”)
  await syncBudgetCycle({ userId: req.user!.id, budgetId: created.id });

  return res.status(201).json(created);
}

// GET /budgets/:id
export async function getOne(req: AuthRequest, res: Response) {
  const id = parseId(req.params.id);
  if (!id)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "id inválido",
    });

  const budget = await getBudgetById(req.user!.id, id);
  if (!budget)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });

  // Sync “lazy”: cada vez que consultes, aseguras ciclo y transacciones auto
  await syncBudgetCycle({ userId: req.user!.id, budgetId: id });

  return res.json(budget);
}

// PUT /budgets/:id
export async function update(req: AuthRequest, res: Response) {
  const id = parseId(req.params.id);
  if (!id)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "id inválido",
    });

  const existing = await getBudgetById(req.user!.id, id);
  if (!existing)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });

  const body = req.body as UpdateBudgetBody;
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length < 2) {
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "name debe tener mínimo 2 caracteres",
      });
    }
    body.name = body.name.trim();
  }

  const updated = await updateBudget(req.user!.id, id, body);
  if (!updated)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });

  // Al cambiar reglas, sync para recalcular ciclo actual
  await syncBudgetCycle({ userId: req.user!.id, budgetId: id });

  return res.json(updated);
}

// DELETE /budgets/:id
export async function remove(req: AuthRequest, res: Response) {
  const id = parseId(req.params.id);
  if (!id)
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "id inválido",
    });

  const ok = await deleteBudget(req.user!.id, id);
  if (!ok)
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });

  return res.status(204).send();
}
