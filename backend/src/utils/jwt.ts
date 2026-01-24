import jwt, { SignOptions } from "jsonwebtoken";

export type JwtPayload = {
  id: number;
};

export function signToken(userId: number): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn,
  } as SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}
