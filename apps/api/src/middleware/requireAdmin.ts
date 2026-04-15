import type { Request, Response, NextFunction } from "express";
import { verifyAdminToken } from "../lib/jwt";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const raw =
    (req as Request & { cookies?: Record<string, string> }).cookies?.admin_token ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!raw) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  try {
    req.admin = verifyAdminToken(raw);
    next();
  } catch {
    res.status(401).json({ error: "Sesión inválida" });
  }
}
