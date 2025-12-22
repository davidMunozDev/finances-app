import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";

export function validateBody(req: Request, res: Response, next: NextFunction) {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new AppError({
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "El body de la petición es obligatorio",
      });
    }
  }
  next();
}
