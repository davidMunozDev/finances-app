import type { Request, Response } from "express";
import type { AuthRequest } from "../types/api.types";
import type {
  RegisterBody,
  LoginBody,
  OnboardingDataBody,
} from "../types/auth.types";
import type { UserRow } from "../types/user.types";
import type { DBRow, DBResult } from "../types/db.types";

import jwt, { SignOptions } from "jsonwebtoken";
import { pool } from "../db";
import { hashPassword, comparePassword } from "../utils/password";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";
import { HTTP_STATUS } from "../constants/http-status";
import { syncBudgetCycle } from "../services/budget-cycles.service";
import crypto from "crypto";

function signAccessToken(userId: number) {
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || "1h";
  return jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn,
  } as SignOptions);
}

function signRefreshToken(userId: number) {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  const expiresIn = `${days}d`;
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn,
  } as SignOptions);
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function refreshCookieOptions() {
  const secure = process.env.COOKIE_SECURE === "true";
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/auth/refresh",
    maxAge: days * 24 * 60 * 60 * 1000,
  };
}

// ----------------------
// Refresh tokens DB helpers
// ----------------------

async function storeRefreshToken(params: {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}) {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [params.userId, params.tokenHash, params.expiresAt],
  );
}

async function findRefreshToken(tokenHash: string) {
  const result = await pool.query<{
    id: number;
    user_id: number;
    expires_at: string;
    revoked_at: string | null;
    replaced_by_token_hash: string | null;
  }>(
    `SELECT id, user_id, expires_at, revoked_at, replaced_by_token_hash
     FROM refresh_tokens
     WHERE token_hash = $1
     LIMIT 1`,
    [tokenHash],
  );

  return result.rows[0] ?? null;
}

async function rotateRefreshToken(params: {
  oldHash: string;
  newHash: string;
}) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP, replaced_by_token_hash = $1
     WHERE token_hash = $2 AND revoked_at IS NULL`,
    [params.newHash, params.oldHash],
  );
}

async function revokeRefreshToken(tokenHash: string) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP
     WHERE token_hash = $1 AND revoked_at IS NULL`,
    [tokenHash],
  );
}

// ----------------------
// Controllers
// ----------------------

// POST /auth/register
export async function register(req: Request, res: Response) {
  const { email, password, full_name, default_currency } =
    req.body as RegisterBody;

  if (!email || !password) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "email y password son obligatorios",
    });
  }

  const existing = await pool.query<Pick<UserRow, "id">>(
    "SELECT id FROM users WHERE email = $1 LIMIT 1",
    [email],
  );

  if (existing.rows.length) {
    throw new AppError({
      status: HTTP_STATUS.CONFLICT,
      code: ERROR_CODES.CONFLICT,
      message: "Email ya registrado",
    });
  }

  const password_hash = await hashPassword(password);

  const result = await pool.query<{ id: number }>(
    `INSERT INTO users (email, password_hash, full_name, default_currency)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [email, password_hash, full_name ?? null, default_currency ?? "EUR"],
  );

  const userId = result.rows[0].id;

  // emitir tokens
  const access_token = signAccessToken(userId);
  const refresh_token = signRefreshToken(userId);

  // guardar refresh token (hasheado)
  const refreshHash = hashToken(refresh_token);
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await storeRefreshToken({ userId, tokenHash: refreshHash, expiresAt });

  // set cookie httpOnly con refresh
  res.cookie("refresh_token", refresh_token, refreshCookieOptions());

  return res.status(HTTP_STATUS.CREATED).json({
    access_token,
    user: {
      id: userId,
      email,
      full_name: full_name ?? null,
      default_currency: default_currency ?? "EUR",
      onboarding_completed: false,
    },
  });
}

// POST /auth/login
export async function login(req: Request, res: Response) {
  const { email, password } = req.body as LoginBody;

  if (!email || !password) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "email y password son obligatorios",
    });
  }

  const result = await pool.query<UserRow>(
    `SELECT id, email, password_hash, full_name, default_currency, onboarding_completed
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  if (!result.rows.length) {
    throw new AppError({
      status: HTTP_STATUS.UNAUTHORIZED,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Credenciales inválidas",
    });
  }

  const user = result.rows[0];
  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Credenciales inválidas",
    });
  }

  // emitir tokens
  const access_token = signAccessToken(user.id);
  const refresh_token = signRefreshToken(user.id);

  // guardar refresh token (hasheado)
  const refreshHash = hashToken(refresh_token);
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await storeRefreshToken({
    userId: user.id,
    tokenHash: refreshHash,
    expiresAt,
  });

  // set cookie httpOnly con refresh
  res.cookie("refresh_token", refresh_token, refreshCookieOptions());

  return res.json({
    access_token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      default_currency: user.default_currency,
      onboarding_completed: Boolean(user.onboarding_completed),
    },
  });
}

// POST /auth/refresh
export async function refresh(req: Request, res: Response) {
  const refresh_token = (req as any).cookies?.refresh_token as
    | string
    | undefined;

  if (!refresh_token) {
    throw new AppError({
      status: HTTP_STATUS.UNAUTHORIZED,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "No autorizado",
    });
  }

  let payload: any;
  try {
    payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET!);
  } catch {
    throw new AppError({
      status: HTTP_STATUS.UNAUTHORIZED,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Refresh token inválido o expirado",
    });
  }

  const userId = Number(payload.sub);
  const oldHash = hashToken(refresh_token);

  const stored = await findRefreshToken(oldHash);
  if (!stored || stored.revoked_at) {
    throw new AppError({
      status: HTTP_STATUS.UNAUTHORIZED,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Refresh token revocado",
    });
  }

  // rotación: nuevo refresh y revocar el anterior
  const new_refresh = signRefreshToken(userId);
  const newHash = hashToken(new_refresh);

  await rotateRefreshToken({ oldHash, newHash });

  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await storeRefreshToken({ userId, tokenHash: newHash, expiresAt });

  // nuevo access
  const new_access = signAccessToken(userId);

  // set cookie nueva
  res.cookie("refresh_token", new_refresh, refreshCookieOptions());

  return res.json({ access_token: new_access });
}

// POST /auth/logout
export async function logout(req: Request, res: Response) {
  const refresh_token = (req as any).cookies?.refresh_token as
    | string
    | undefined;

  if (refresh_token) {
    await revokeRefreshToken(hashToken(refresh_token));
  }

  res.clearCookie("refresh_token", { path: "/auth/refresh" });
  return res.status(HTTP_STATUS.NO_CONTENT).send();
}

// GET /auth/me
export async function me(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "No autorizado",
    });
  }

  const result = await pool.query<Omit<UserRow, "password_hash">>(
    "SELECT id, email, full_name, default_currency, onboarding_completed, created_at FROM users WHERE id = $1",
    [userId],
  );

  if (!result.rows.length) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "Usuario no encontrado",
    });
  }

  const user = result.rows[0];
  return res.json({
    ...user,
    onboarding_completed: Boolean(user.onboarding_completed),
  });
}

// DELETE /auth/delete
export async function deleteUser(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError({
      status: HTTP_STATUS.UNAUTHORIZED,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "No autorizado",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Revocar refresh tokens
    await client.query(
      `UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    );

    // 2. Eliminar transacciones del usuario
    await client.query(`DELETE FROM transactions WHERE user_id = $1`, [userId]);

    // 3. Eliminar provisions y recurring (tienen ON DELETE RESTRICT sobre categories)
    await client.query(
      `DELETE FROM budget_provisions
       WHERE budget_id IN (SELECT id FROM budgets WHERE user_id = $1)`,
      [userId],
    );
    await client.query(
      `DELETE FROM budget_recurring_expenses
       WHERE budget_id IN (SELECT id FROM budgets WHERE user_id = $1)`,
      [userId],
    );

    // 4. Eliminar ciclos de presupuesto
    await client.query(
      `DELETE FROM budget_cycles
       WHERE budget_id IN (SELECT id FROM budgets WHERE user_id = $1)`,
      [userId],
    );

    // 5. Eliminar presupuestos
    await client.query(`DELETE FROM budgets WHERE user_id = $1`, [userId]);

    // 6. Eliminar categorías del usuario
    await client.query(`DELETE FROM categories WHERE user_id = $1`, [userId]);

    // 7. Eliminar refresh tokens
    await client.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [
      userId,
    ]);

    // 8. Eliminar usuario
    const result = await client.query("DELETE FROM users WHERE id = $1", [
      userId,
    ]);

    if ((result.rowCount ?? 0) === 0) {
      throw new AppError({
        status: HTTP_STATUS.NOT_FOUND,
        code: ERROR_CODES.NOT_FOUND,
        message: "Usuario no encontrado",
      });
    }

    await client.query("COMMIT");

    // Limpiar cookie
    res.clearCookie("refresh_token", { path: "/auth/refresh" });

    return res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// PATCH /auth/onboarding
export async function completeOnboarding(req: AuthRequest, res: Response) {
  const userId = req.user!.id;

  const data = req.body as OnboardingDataBody;

  if (
    !data.user ||
    !data.budget ||
    !data.incomes ||
    !data.categories ||
    !data.provisions
  ) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Datos de onboarding incompletos",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Actualizar datos del usuario
    await client.query(
      "UPDATE users SET full_name = $1, default_currency = $2 WHERE id = $3",
      [data.user.full_name, data.user.default_currency, userId],
    );

    // 2. Crear presupuesto
    const budgetResult = await client.query<{ id: number }>(
      `INSERT INTO budgets (user_id, name, currency, reset_type, reset_dow, reset_dom, reset_month, reset_day)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        userId,
        data.budget.name,
        data.user.default_currency,
        data.budget.reset_type,
        data.budget.reset_dow ?? null,
        data.budget.reset_dom ?? null,
        data.budget.reset_month ?? null,
        data.budget.reset_day ?? null,
      ],
    );
    const budgetId = budgetResult.rows[0].id;

    // 3. Crear categorías personalizadas y mapear nombres a IDs
    const categoryMap = new Map<string, number>();
    for (const cat of data.categories) {
      // Check if category already exists (global or user-specific)
      const existing = await client.query<{ id: number }>(
        `SELECT id FROM categories 
         WHERE name = $1 AND (user_id IS NULL OR user_id = $2)
         LIMIT 1`,
        [cat.name, userId],
      );

      let categoryId: number;
      if (existing.rows.length > 0) {
        // Use existing category
        categoryId = existing.rows[0].id;
      } else {
        // Create new user-specific category
        const catResult = await client.query<{ id: number }>(
          "INSERT INTO categories (user_id, name, icon) VALUES ($1, $2, $3) RETURNING id",
          [userId, cat.name, cat.icon ?? null],
        );
        categoryId = catResult.rows[0].id;
      }

      categoryMap.set(cat.name, categoryId);
    }

    // 4. Crear provisiones de gastos planificados
    for (const provision of data.provisions) {
      const categoryId = categoryMap.get(provision.category_name);
      if (!categoryId) {
        throw new AppError({
          status: HTTP_STATUS.BAD_REQUEST,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: `Categoría '${provision.category_name}' no encontrada`,
        });
      }
      await client.query(
        `INSERT INTO budget_provisions (budget_id, category_id, name, amount)
         VALUES ($1, $2, $3, $4)`,
        [budgetId, categoryId, provision.name, provision.amount],
      );
    }

    // 5. Marcar onboarding como completado
    await client.query(
      "UPDATE users SET onboarding_completed = TRUE WHERE id = $1",
      [userId],
    );

    await client.query("COMMIT");

    // 6. Crear el ciclo inicial del presupuesto (fuera de la transacción)
    const cycle = await syncBudgetCycle({ userId, budgetId });
    if (!cycle) {
      throw new AppError({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "No se pudo crear el ciclo del presupuesto",
      });
    }

    // 7. Crear ingresos en el ciclo actual (como transacciones de tipo income)
    const dateISO = new Date().toISOString().slice(0, 10);
    for (const income of data.incomes) {
      await pool.query(
        `INSERT INTO transactions (user_id, budget_id, cycle_id, category_id, type, description, amount, date, source)
         VALUES ($1, $2, $3, NULL, 'income', $4, $5, $6, 'manual')`,
        [
          userId,
          budgetId,
          cycle.id,
          income.description,
          income.amount,
          dateISO,
        ],
      );
    }

    return res.json({
      message: "Onboarding completado exitosamente",
      onboarding_completed: true,
      budget_id: budgetId,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
