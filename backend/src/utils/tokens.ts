import jwt from "jsonwebtoken";
import crypto from "crypto";

export function signAccessToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "1h",
  });
}

export function signRefreshToken(payload: object) {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: `${days}d`,
  });
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
