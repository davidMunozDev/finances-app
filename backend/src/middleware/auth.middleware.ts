import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/api.types";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../constants/error-codes";
import { HTTP_STATUS } from "../constants/http-status";

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError({
      status: HTTP_STATUS.UNAUTHORIZED,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "No token provided",
    });
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id };
    next();
  } catch {
    throw new AppError({
      status: HTTP_STATUS.UNAUTHORIZED,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Invalid or expired token",
    });
  }
}
