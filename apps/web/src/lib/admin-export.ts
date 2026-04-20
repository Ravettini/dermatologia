import { apiUrl } from "./api";

/** Descarga un archivo exportado (CSV o XLSX) desde la API admin. */
export async function downloadAdminExport(pathWithQuery: string): Promise<void> {
  const res = await fetch(apiUrl(pathWithQuery), { credentials: "include" });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || "No se pudo exportar");
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  const nameMatch = cd?.match(/filename="([^"]+)"/);
  const explicitFormat = (() => {
    try {
      const q = new URL(pathWithQuery, "http://local").searchParams.get("format");
      return q === "xlsx" ? "xlsx" : q === "csv" ? "csv" : null;
    } catch {
      return null;
    }
  })();
  const contentType = (res.headers.get("Content-Type") || "").toLowerCase();
  const inferredExt =
    explicitFormat ??
    (contentType.includes("spreadsheetml") ? "xlsx" : contentType.includes("text/csv") ? "csv" : "csv");
  const filename = nameMatch?.[1] ?? `export.${inferredExt}`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
