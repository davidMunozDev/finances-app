import type { Request, Response } from "express";
import type { AuthRequest } from "../types/api.types";
import type {
  RegisterBody,
  LoginBody,
  OnboardingDataBody,
} from "../types/auth.types";
import type { UserRow } from "../types/user.types";
import type { DBRow, DBResult } from "../types/db.types";

import jwt from "jsonwebtoken";
import { pool } from "../db";
import { hashPassword, comparePassword } from "../utils/password";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";
import { HTTP_STATUS } from "../constants/http-status";
import { syncBudgetCycle } from "../services/budget-cycles.service";
import crypto from "crypto";

function signAccessToken(userId: number) {
  return jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "1h",
  });
}

function signRefreshToken(userId: number) {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: `${days}d`,
  });
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
  await pool.query<DBResult>(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [params.userId, params.tokenHash, params.expiresAt]
  );
}

async function findRefreshToken(tokenHash: string) {
  const [rows] = await pool.query<
    DBRow<{
      id: number;
      user_id: number;
      expires_at: string;
      revoked_at: string | null;
      replaced_by_token_hash: string | null;
    }>[]
  >(
    `SELECT id, user_id, expires_at, revoked_at, replaced_by_token_hash
     FROM refresh_tokens
     WHERE token_hash = ?
     LIMIT 1`,
    [tokenHash]
  );

  return rows[0] ?? null;
}

async function rotateRefreshToken(params: {
  oldHash: string;
  newHash: string;
}) {
  await pool.query<DBResult>(
    `UPDATE refresh_tokens
     SET revoked_at = NOW(), replaced_by_token_hash = ?
     WHERE token_hash = ? AND revoked_at IS NULL`,
    [params.newHash, params.oldHash]
  );
}

async function revokeRefreshToken(tokenHash: string) {
  await pool.query<DBResult>(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE token_hash = ? AND revoked_at IS NULL`,
    [tokenHash]
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

  const [existing] = await pool.query<DBRow<Pick<UserRow, "id">>[]>(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (existing.length) {
    throw new AppError({
      status: HTTP_STATUS.CONFLICT,
      code: ERROR_CODES.CONFLICT,
      message: "Email ya registrado",
    });
  }

  const password_hash = await hashPassword(password);

  const [result] = await pool.query<DBResult>(
    `INSERT INTO users (email, password_hash, full_name, default_currency)
     VALUES (?, ?, ?, ?)`,
    [email, password_hash, full_name ?? null, default_currency ?? "EUR"]
  );

  const userId = result.insertId;

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

  const [rows] = await pool.query<DBRow<UserRow>[]>(
    `SELECT id, email, password_hash, full_name, default_currency, onboarding_completed
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  if (!rows.length) {
    throw new AppError({
      status: HTTP_STATUS.UNAUTHORIZED,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Credenciales inválidas",
    });
  }

  const user = rows[0];
  const ok = await comparePassword(password, user.password_hash);
  if (!ok) {
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

  const [rows] = await pool.query<DBRow<Omit<UserRow, "password_hash">>[]>(
    "SELECT id, email, full_name, default_currency, onboarding_completed, created_at FROM users WHERE id = ?",
    [userId]
  );

  if (!rows.length) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "Usuario no encontrado",
    });
  }

  const user = rows[0];
  return res.json({
    ...user,
    onboarding_completed: Boolean(user.onboarding_completed),
  });
}

// DELETE /auth/user
export async function deleteUser(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError({
      status: HTTP_STATUS.UNAUTHORIZED,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "No autorizado",
    });
  }

  // Opcional: revocar todos los refresh tokens del usuario (si tienes endpoint)
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = NOW()
     WHERE user_id = ? AND revoked_at IS NULL`,
    [userId]
  );

  const [result] = await pool.query<DBResult>(
    "DELETE FROM users WHERE id = ?",
    [userId]
  );

  if (result.affectedRows === 0) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "Usuario no encontrado",
    });
  }

  // Limpiar cookie por si acaso
  res.clearCookie("refresh_token", { path: "/auth/refresh" });

  return res.json({ message: "Usuario eliminado correctamente" });
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

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Actualizar datos del usuario
    await connection.query(
      "UPDATE users SET full_name = ?, default_currency = ? WHERE id = ?",
      [data.user.full_name, data.user.default_currency, userId]
    );

    // 2. Crear presupuesto
    const [budgetResult] = await connection.query<DBResult>(
      `INSERT INTO budgets (user_id, name, currency, reset_type, reset_dow, reset_dom, reset_month, reset_day)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.budget.name,
        data.user.default_currency,
        data.budget.reset_type,
        data.budget.reset_dow ?? null,
        data.budget.reset_dom ?? null,
        data.budget.reset_month ?? null,
        data.budget.reset_day ?? null,
      ]
    );
    const budgetId = budgetResult.insertId;

    // 3. Crear categorías personalizadas y mapear nombres a IDs
    const categoryMap = new Map<string, number>();
    for (const cat of data.categories) {
      // Check if category already exists (global or user-specific)
      const [existing] = await connection.query<DBRow<{ id: number }>[]>(
        `SELECT id FROM categories 
         WHERE name = ? AND (user_id IS NULL OR user_id = ?)
         LIMIT 1`,
        [cat.name, userId]
      );

      let categoryId: number;
      if (existing.length > 0) {
        // Use existing category
        categoryId = existing[0].id;
      } else {
        // Create new user-specific category
        const [catResult] = await connection.query<DBResult>(
          "INSERT INTO categories (user_id, name, icon) VALUES (?, ?, ?)",
          [userId, cat.name, cat.icon ?? null]
        );
        categoryId = catResult.insertId;
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
      await connection.query(
        `INSERT INTO budget_provisions (budget_id, category_id, name, amount)
         VALUES (?, ?, ?, ?)`,
        [budgetId, categoryId, provision.name, provision.amount]
      );
    }

    // 5. Marcar onboarding como completado
    await connection.query(
      "UPDATE users SET onboarding_completed = TRUE WHERE id = ?",
      [userId]
    );

    await connection.commit();

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
         VALUES (?, ?, ?, NULL, 'income', ?, ?, ?, 'manual')`,
        [userId, budgetId, cycle.id, income.description, income.amount, dateISO]
      );
    }

    return res.json({
      message: "Onboarding completado exitosamente",
      onboarding_completed: true,
      budget_id: budgetId,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
