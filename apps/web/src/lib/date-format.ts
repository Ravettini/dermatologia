import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";

/** yyyy-MM-dd → texto dd/MM/yyyy para mostrar o editar. */
export function formatYmdToEs(ymd: string): string {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return "—";
  const d = parse(ymd, "yyyy-MM-dd", new Date());
  return isValid(d) ? format(d, "dd/MM/yyyy", { locale: es }) : "—";
}

/** yyyy-MM-dd → "" si inválido (para inputs controlados). */
export function ymdToDdmmyyyy(ymd: string): string {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return "";
  const d = parse(ymd, "yyyy-MM-dd", new Date());
  return isValid(d) ? format(d, "dd/MM/yyyy", { locale: es }) : "";
}

/**
 * Acepta dd/mm/aaaa con o sin ceros (ej. 5/1/2026 o 05/01/2026).
 * También acepta guiones o puntos como separadores.
 */
export function parseDdmmyyyyToDate(input: string): Date | null {
  const s = input.trim();
  if (!s) return null;
  const parts = s.split(/[/.\-]/).map((p) => p.trim());
  if (parts.length !== 3) return null;
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
  if (year < 1900 || year > 2100) return null;
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

export function parseDdmmyyyyToYmd(input: string): { ok: true; ymd: string } | { ok: false; message: string } {
  const d = parseDdmmyyyyToDate(input);
  if (!d) return { ok: false, message: "Usá el formato dd/mm/aaaa (día, mes, año)." };
  return { ok: true, ymd: format(d, "yyyy-MM-dd") };
}

export function formatDateTimeEs(iso: string): string {
  return format(new Date(iso), "dd/MM/yyyy HH:mm", { locale: es });
}
