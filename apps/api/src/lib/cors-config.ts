/**
 * CORS: FRONTEND_URL puede ser varios orígenes separados por coma (sin barra final).
 * Opcional: CORS_ALLOW_VERCEL_PREVIEWS=true permite cualquier https://*.vercel.app (previews).
 */

export function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

export function listExplicitOrigins(): string[] {
  const raw = process.env.FRONTEND_URL || "http://localhost:3000";
  return raw
    .split(",")
    .map((s) => normalizeOrigin(s))
    .filter(Boolean);
}

function allowVercelPreviewWildcards(): boolean {
  const v = (process.env.CORS_ALLOW_VERCEL_PREVIEWS || "").toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function isAllowedCorsOrigin(requestOrigin: string | undefined): boolean {
  if (!requestOrigin) return true;
  const o = normalizeOrigin(requestOrigin);
  const allowed = listExplicitOrigins();
  if (allowed.some((a) => a === o)) return true;
  if (allowVercelPreviewWildcards()) {
    try {
      const u = new URL(o);
      if (u.protocol === "https:" && u.hostname.endsWith(".vercel.app")) return true;
    } catch {
      /* noop */
    }
  }
  return false;
}

/** Para express cors: refleja el origen permitido (necesario con credentials). */
export function corsOriginDelegate(
  requestOrigin: string | undefined,
  callback: (err: Error | null, allow?: boolean | string) => void
): void {
  if (!requestOrigin) {
    callback(null, true);
    return;
  }
  if (isAllowedCorsOrigin(requestOrigin)) {
    callback(null, requestOrigin);
    return;
  }
  callback(null, false);
}

/** Primer origen de la lista (cookies / lógica “sitio principal”). */
export function primaryFrontendUrl(): string {
  const list = listExplicitOrigins();
  return list[0] || "http://localhost:3000";
}
