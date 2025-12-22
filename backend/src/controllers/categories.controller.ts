import type { Response } from "express";
import type { AuthRequest } from "../types/api.types";

import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";

import {
  CreateCategorySchema,
  UpdateCategorySchema,
} from "../validators/category.validator";
import {
  listCategories,
  createCategory,
  getCategoryById,
  deleteCategory,
  findUserCategoryById,
  existsUserCategoryName,
  updateUserCategory,
} from "../services/categories.service";

function parseId(v: string) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// GET /categories
export async function getAll(req: AuthRequest, res: Response) {
  const rows = await listCategories(req.user!.id);
  return res.json(rows);
}

// POST /categories
export async function create(req: AuthRequest, res: Response) {
  const parsed = CreateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Body inválido",
      details: parsed.error.flatten(),
    });
  }

  const name = parsed.data.name.trim();
  const icon = parsed.data.icon;

  const result = await createCategory(req.user!.id, name, icon);

  if (result.conflict) {
    throw new AppError({
      status: 409,
      code: ERROR_CODES.CONFLICT,
      message: "Ya existe una categoría con ese nombre",
    });
  }

  return res.status(201).json({ id: result.id });
}

// DELETE /categories/:id
export async function remove(req: AuthRequest, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "id inválido",
    });
  }

  const cat = await getCategoryById(id);
  if (!cat) {
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Categoría no encontrada",
    });
  }

  if (cat.user_id === null) {
    throw new AppError({
      status: 403,
      code: ERROR_CODES.FORBIDDEN,
      message: "No puedes borrar una categoría global",
    });
  }

  if (cat.user_id !== req.user!.id) {
    throw new AppError({
      status: 403,
      code: ERROR_CODES.FORBIDDEN,
      message: "No puedes borrar categorías de otro usuario",
    });
  }

  const ok = await deleteCategory(req.user!.id, id);
  if (!ok) {
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Categoría no encontrada",
    });
  }

  return res.status(204).send();
}

// PUT /categories/:id
export async function update(req: AuthRequest, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "id inválido",
    });
  }

  // Solo categorías del usuario (no global)
  const existing = await findUserCategoryById(req.user!.id, id);
  if (!existing) {
    // aquí entran: no existe, es global, o es de otro usuario
    throw new AppError({
      status: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: "Categoría no encontrada",
    });
  }

  const parsed = UpdateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Body inválido",
      details: parsed.error.flatten(),
    });
  }

  const nextName = parsed.data.name?.trim();

  // Evitar duplicado de nombre dentro del usuario
  if (nextName) {
    const nameTaken = await existsUserCategoryName(req.user!.id, nextName, id);
    if (nameTaken) {
      throw new AppError({
        status: 409,
        code: ERROR_CODES.CONFLICT,
        message: "Ya existe una categoría con ese nombre",
      });
    }
  }

  const updated = await updateUserCategory({
    userId: req.user!.id,
    id,
    name: nextName,
    icon: parsed.data.icon,
  });

  if (!updated) {
    throw new AppError({
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "No se pudo actualizar la categoría",
    });
  }

  return res.json(updated);
}
