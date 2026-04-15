import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET is required in production");
}

const effectiveSecret = SECRET ?? "dev-only-secret-change-me";

export type JwtPayload = { sub: string; email: string };

export function signAdminToken(payload: JwtPayload): string {
  return jwt.sign(payload, effectiveSecret, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): JwtPayload {
  return jwt.verify(token, effectiveSecret) as JwtPayload;
}
