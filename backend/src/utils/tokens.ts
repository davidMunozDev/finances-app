import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

export function signAccessToken(payload: object) {
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || "1h";
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn } as SignOptions);
}

export function signRefreshToken(payload: object) {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  const expiresIn = `${days}d`;
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn } as SignOptions);
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
