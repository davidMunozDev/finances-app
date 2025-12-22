import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Errores controlados (AppError)
  if (err instanceof AppError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      details: err.details ?? null,
    });
  }

  // Errores no controlados
  console.error("UNHANDLED ERROR:", err);

  return res.status(500).json({
    code: ERROR_CODES.INTERNAL_ERROR,
    message: "Error interno del servidor",
    details: null,
  });
}
