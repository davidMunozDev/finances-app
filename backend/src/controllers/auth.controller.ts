import type { Request, Response } from "express";
import type { AuthRequest } from "../types/api.types";
import type { RegisterBody, LoginBody } from "../types/auth.types";
import type { UserRow } from "../types/user.types";
import type { DBRow, DBResult } from "../types/db.types";

import { pool } from "../db";
import { signToken } from "../utils/jwt";
import { hashPassword, comparePassword } from "../utils/password";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";
import { HTTP_STATUS } from "../constants/http-status";

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
  const token = signToken(userId);

  return res.status(HTTP_STATUS.CREATED).json({
    token,
    user: {
      id: userId,
      email,
      full_name: full_name ?? null,
      default_currency: default_currency ?? "EUR",
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
    `SELECT id, email, password_hash, full_name, default_currency
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  if (!rows.length) {
    throw new AppError({
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
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

  const token = signToken(user.id);

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      default_currency: user.default_currency,
    },
  });
}

// POST /auth/logout
export async function logout(_req: AuthRequest, res: Response) {
  return res.json({ message: "Sesión cerrada correctamente" });
}

// GET /auth/me
export async function me(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError({
      status: HTTP_STATUS.UNAUTHORIZED,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "No autorizado",
    });
  }

  const [rows] = await pool.query<DBRow<Omit<UserRow, "password_hash">>[]>(
    "SELECT id, email, full_name, default_currency, created_at FROM users WHERE id = ?",
    [userId]
  );

  if (!rows.length) {
    throw new AppError({
      status: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
      message: "Usuario no encontrado",
    });
  }

  return res.json(rows[0]);
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

  return res.json({ message: "Usuario eliminado correctamente" });
}
