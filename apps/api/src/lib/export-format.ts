import * as XLSX from "xlsx";

export type ExportFormat = "csv" | "xlsx";

export function parseExportFormat(q: unknown): ExportFormat {
  const f = String(q ?? "csv").toLowerCase();
  return f === "xlsx" ? "xlsx" : "csv";
}

/** Escapa celdas CSV (RFC 4180). */
export function csvEscape(cell: string): string {
  if (/[",\r\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}

export function sendCsv(res: import("express").Response, filename: string, headers: string[], data: string[][]) {
  const lines = [headers.map(csvEscape).join(","), ...data.map((row) => row.map(csvEscape).join(","))];
  const body = "\uFEFF" + lines.join("\r\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(body);
}

export function sendXlsx(
  res: import("express").Response,
  filename: string,
  sheetName: string,
  headers: string[],
  rows: string[][]
) {
  const aoa = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(buf);
}

export function sendTable(
  res: import("express").Response,
  format: ExportFormat,
  baseName: string,
  sheetName: string,
  headers: string[],
  rows: string[][]
) {
  if (format === "xlsx") {
    sendXlsx(res, `${baseName}.xlsx`, sheetName, headers, rows);
  } else {
    sendCsv(res, `${baseName}.csv`, headers, rows);
  }
}
