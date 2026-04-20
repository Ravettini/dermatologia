"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { downloadAdminExport } from "@/lib/admin-export";

type Dashboard = {
  metrics: {
    pendingConfirmation: number;
    newRequests: number;
    confirmedToday: number;
    canceledTotal: number;
    bookingsLastWeek: number;
    bookingsLastMonth: number;
  };
  bySource: { source: string; count: number }[];
  topTreatments: { treatmentId: string; name: string; count: number }[];
};

const EXPORT_ROWS: { label: string; dataset: string; hint: string }[] = [
  { label: "Reservas", dataset: "bookings", hint: "Solicitudes de turno con paciente y estado" },
  { label: "Contactos", dataset: "leads", hint: "Base de leads y datos de contacto" },
  { label: "Profesionales", dataset: "professionals", hint: "Equipo y especialidad vinculada" },
  { label: "Tratamientos", dataset: "treatments", hint: "Catálogo cargado en el sistema" },
  { label: "Agenda (120 días)", dataset: "availability", hint: "Cupos cargados próximos cuatro meses" },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [exportErr, setExportErr] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const d = await apiFetch<Dashboard>("/api/admin/dashboard");
        setData(d);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error");
      }
    })();
  }, []);

  if (err) return <p className="rounded-lg bg-red-50 px-4 py-3 text-red-800 ring-1 ring-red-100">{err}</p>;
  if (!data) return <p className="text-sm text-slate-500">Cargando…</p>;

  const m = data.metrics;

  async function runExport(dataset: string, format: "csv" | "xlsx") {
    const key = `${dataset}-${format}`;
    setExportErr(null);
    setExporting(key);
    try {
      await downloadAdminExport(`/api/admin/export/${dataset}?format=${format}`);
    } catch (e) {
      setExportErr(e instanceof Error ? e.message : "Error al exportar");
    } finally {
      setExporting(null);
    }
  }

  const cards: { label: string; value: number; tone: string }[] = [
    { label: "Pendientes de confirmación", value: m.pendingConfirmation, tone: "border-orange-200 bg-orange-50 text-orange-900" },
    { label: "Nuevas solicitudes (NEW)", value: m.newRequests, tone: "border-sky-200 bg-sky-50 text-sky-900" },
    { label: "Confirmadas hoy", value: m.confirmedToday, tone: "border-emerald-200 bg-emerald-50 text-emerald-900" },
    { label: "Canceladas (total)", value: m.canceledTotal, tone: "border-red-200 bg-red-50 text-red-900" },
    { label: "Reservas última semana", value: m.bookingsLastWeek, tone: "border-violet-200 bg-violet-50 text-violet-900" },
    { label: "Reservas último mes", value: m.bookingsLastMonth, tone: "border-slate-200 bg-white text-slate-900" },
  ];

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-headline text-2xl text-slate-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Resumen operativo del centro</p>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link
            href="/admin/bookings"
            className="inline-flex justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-center text-sm font-medium text-white shadow hover:bg-sky-700 sm:justify-start"
          >
            Ir a reservas
          </Link>
          <Link
            href="/admin/availability"
            className="inline-flex justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-800 hover:bg-slate-50 sm:justify-start"
          >
            Calendario de turnos
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl border p-6 shadow-sm ${c.tone}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{c.label}</p>
            <p className="mt-3 font-headline text-4xl">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <h2 className="font-headline text-xl text-slate-900">Exportar datos</h2>
        <p className="mt-2 text-sm text-slate-600">
          Descargá reportes para planillas o respaldo. Los archivos se generan en el momento con lo que hay en la base.
        </p>
        {exportErr && <p className="mt-3 text-sm text-red-700">{exportErr}</p>}
        <div className="mt-6 space-y-4">
          {EXPORT_ROWS.map((row) => (
            <div
              key={row.dataset}
              className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">{row.label}</p>
                <p className="text-xs text-slate-500">{row.hint}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={exporting !== null}
                  onClick={() => void runExport(row.dataset, "csv")}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  {exporting === `${row.dataset}-csv` ? "…" : "CSV"}
                </button>
                <button
                  type="button"
                  disabled={exporting !== null}
                  onClick={() => void runExport(row.dataset, "xlsx")}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {exporting === `${row.dataset}-xlsx` ? "…" : "Excel (.xlsx)"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <h2 className="mb-4 font-headline text-xl text-slate-900">Origen de solicitudes</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {data.bySource.map((b) => (
              <li key={b.source} className="flex justify-between border-b border-slate-100 py-2 last:border-0">
                <span>{b.source}</span>
                <span className="font-semibold text-sky-700">{b.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <h2 className="mb-4 font-headline text-xl text-slate-900">Tratamientos más consultados</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {data.topTreatments.map((t) => (
              <li key={t.treatmentId} className="flex justify-between border-b border-slate-100 py-2 last:border-0">
                <span>{t.name}</span>
                <span className="font-semibold text-emerald-700">{t.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
