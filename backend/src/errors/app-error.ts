import type { ErrorCode } from "../constants/error-codes";

export class AppError extends Error {
  status: number;
  code: ErrorCode;
  details?: unknown;

  constructor(params: {
    status: number;
    code: ErrorCode;
    message: string;
    details?: unknown;
  }) {
    super(params.message);
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }
}
