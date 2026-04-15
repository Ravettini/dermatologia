"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { AdminButton } from "@/components/admin/admin-button";

type TreatmentOpt = { id: string; name: string; active: boolean };

type Pro = {
  id: string;
  name: string;
  specialty: string;
  active: boolean;
  specialtyTreatment: { id: string; name: string; slug: string } | null;
};

export default function AdminProfessionalsPage() {
  const [rows, setRows] = useState<Pro[]>([]);
  const [treatments, setTreatments] = useState<TreatmentOpt[]>([]);
  const [name, setName] = useState("");
  const [treatmentId, setTreatmentId] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const [d, t] = await Promise.all([
      apiFetch<{ professionals: Pro[] }>("/api/admin/professionals"),
      apiFetch<{ treatments: TreatmentOpt[] }>("/api/admin/treatments"),
    ]);
    setRows(d.professionals);
    const active = t.treatments.filter((x) => x.active !== false);
    setTreatments(active);
    setTreatmentId((prev) => prev || active[0]?.id || "");
  }

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error");
      }
    })();
  }, []);

  async function create() {
    setErr(null);
    if (!name.trim() || !treatmentId) {
      setErr("Completá el nombre y elegí un tratamiento como especialidad.");
      return;
    }
    try {
      await apiFetch("/api/admin/professionals", {
        method: "POST",
        json: { name: name.trim(), treatmentId },
      });
      setName("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo crear");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl text-slate-900">Profesionales</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          La <strong>especialidad</strong> se elige entre los <strong>tratamientos</strong> dados de alta en la pestaña
          Tratamientos. Así mantenemos nombres alineados con lo que ofrece la clínica.
        </p>
      </div>

      {err && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100">{err}</p>}

      <div className="max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <h2 className="text-sm font-semibold text-slate-800">Nuevo profesional</h2>
        <div className="mt-4 grid gap-4">
          <label className="block text-xs font-medium text-slate-600">
            Nombre completo
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Ej. Dra. Ana López"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Especialidad (según tratamiento)
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={treatmentId}
              onChange={(e) => setTreatmentId(e.target.value)}
              disabled={treatments.length === 0}
            >
              {treatments.length === 0 ? (
                <option value="">Creá primero tratamientos en la pestaña Tratamientos</option>
              ) : (
                treatments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              )}
            </select>
          </label>
          <AdminButton variant="neutral" className="w-full" onClick={() => void create()} disabled={treatments.length === 0}>
            Crear profesional
          </AdminButton>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <h2 className="text-sm font-semibold text-slate-800">Listado</h2>
        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {rows.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span className="text-slate-900">
                <span className="font-medium">{p.name}</span>
                <span className="text-slate-600"> — {p.specialtyTreatment?.name ?? p.specialty}</span>
              </span>
              <span className="text-xs font-medium text-slate-500">{p.active ? "Activo" : "Inactivo"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
