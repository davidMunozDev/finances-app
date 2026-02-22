import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";
import { HTTP_STATUS } from "../constants/http-status";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Errores controlados (AppError)
  if (err instanceof AppError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      details: err.details ?? null,
    });
  }

  // Errores de body-parser (JSON inválido, etc.)
  if (
    err instanceof SyntaxError &&
    "status" in err &&
    (err as any).status === 400
  ) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "JSON inválido en el body de la petición",
      details: null,
    });
  }

  // Errores no controlados
  console.error("UNHANDLED ERROR:", err);

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    code: ERROR_CODES.INTERNAL_ERROR,
    message: "Error interno del servidor",
    details: null,
  });
}
