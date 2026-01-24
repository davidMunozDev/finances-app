import { Response } from "express";
import { AuthRequest } from "../types/api.types";
import { AppError } from "../errors/app-error";
import { AssistantQuerySchema } from "../validators/assistant.validator";
import { ERROR_CODES } from "../constants/error-codes";
import { HTTP_STATUS } from "../constants/http-status";
import { getBudgetById, listBudgets } from "../services/budgets.service";
import { syncBudgetCycle } from "../services/budget-cycles.service";
import {
  processQuery,
  processReceiptText,
} from "../services/assistant-ai.service";
import { AssistantContext, ScanReceiptRequest } from "../types/assistant.types";
import { invalidateCache } from "../services/assistant-datasets.service";
import { listCategories } from "../services/categories.service";

/**
 * POST /assistant/query
 * Process AI assistant query with natural language
 */
export async function query(req: AuthRequest, res: Response) {
  const userId = req.user!.id;

  // Validate request body
  const parsed = AssistantQuerySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Body inválido",
      details: parsed.error.flatten(),
    });
  }

  const { question, budgetId, timezone } = parsed.data;

  // Build assistant context
  const context: AssistantContext = {
    userId,
    timezone: timezone || "Europe/Madrid",
  };

  // Get available budgets
  const availableBudgets = await listBudgets(userId);
  context.availableBudgets = availableBudgets.map((b) => ({
    id: b.id,
    name: b.name,
    currency: b.currency,
  }));

  // If budgetId provided, validate ownership and sync cycle
  if (budgetId) {
    const budget = await getBudgetById(userId, budgetId);
    if (!budget) {
      throw new AppError({
        status: HTTP_STATUS.NOT_FOUND,
        code: ERROR_CODES.NOT_FOUND,
        message: "Presupuesto no encontrado",
      });
    }

    context.budgetId = budgetId;

    // Sync current cycle
    const cycle = await syncBudgetCycle({ userId, budgetId });
    if (cycle) {
      context.currentCycle = {
        id: cycle.id,
        start_date: cycle.start_date,
        end_date: cycle.end_date,
      };
    }
  }

  // Process query with AI
  const response = await processQuery(question, context);

  return res.json(response);
}

/**
 * POST /assistant/invalidate-cache
 * Invalidate cache for user (called after creating/updating transactions)
 */
export async function invalidateCacheEndpoint(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { dataset } = req.body;

  invalidateCache(userId, dataset);

  return res.status(HTTP_STATUS.NO_CONTENT).send();
}

/**
 * POST /assistant/scan-receipt
 * Process receipt text with AI to extract expense data
 */
export async function scanReceipt(req: AuthRequest, res: Response) {
  const userId = req.user!.id;

  // Validate request body
  const { text, budgetId } = req.body as ScanReceiptRequest;

  if (!text || typeof text !== "string") {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "El campo 'text' es requerido y debe ser un string",
    });
  }

  if (!budgetId || typeof budgetId !== "number") {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "El campo 'budgetId' es requerido y debe ser un número",
    });
  }

  // Validate budget ownership
  const budget = await getBudgetById(userId, budgetId);
  if (!budget) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "Presupuesto no encontrado",
    });
  }

  // Get user's categories (categories are user-specific, not budget-specific)
  const categories = await listCategories(userId);

  // Process receipt text with AI
  const result = await processReceiptText(text, categories);

  return res.json(result);
}
