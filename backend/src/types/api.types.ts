import type { Request } from "express";

export type AuthUser = {
  id: number;
};

export interface AuthRequest extends Request {
  user?: AuthUser;
}
