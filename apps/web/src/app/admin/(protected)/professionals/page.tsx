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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeEdit, setActiveEdit] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const [d, t] = await Promise.all([
      apiFetch<{ professionals: Pro[] }>("/api/admin/professionals"),
      apiFetch<{ treatments: TreatmentOpt[] }>("/api/admin/treatments"),
    ]);
    setRows(d.professionals);
    const list = t.treatments;
    setTreatments(list);
    setTreatmentId((prev) => {
      if (prev && list.some((x) => x.id === prev)) return prev;
      return list[0]?.id ?? "";
    });
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

  function startEdit(p: Pro) {
    setErr(null);
    setEditingId(p.id);
    setName(p.name);
    setTreatmentId(p.specialtyTreatment?.id ?? treatments[0]?.id ?? "");
    setActiveEdit(p.active);
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setActiveEdit(true);
    setTreatmentId(treatments[0]?.id ?? "");
  }

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

  async function saveEdit() {
    if (!editingId) return;
    setErr(null);
    if (!name.trim() || !treatmentId) {
      setErr("Completá el nombre y elegí un tratamiento como especialidad.");
      return;
    }
    try {
      await apiFetch(`/api/admin/professionals/${editingId}`, {
        method: "PATCH",
        json: { name: name.trim(), treatmentId, active: activeEdit },
      });
      cancelEdit();
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo guardar");
    }
  }

  async function remove(p: Pro) {
    const ok = window.confirm(`¿Eliminar a ${p.name}? No se borran los turnos ya registrados; dejará de mostrarse en la web.`);
    if (!ok) return;
    setErr(null);
    try {
      await apiFetch(`/api/admin/professionals/${p.id}`, { method: "DELETE" });
      if (editingId === p.id) cancelEdit();
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  }

  const isEditing = editingId !== null;

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h1 className="font-headline text-2xl text-slate-900 sm:text-3xl">Profesionales</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          La <strong>especialidad</strong> se elige entre los <strong>tratamientos</strong> dados de alta en la pestaña
          Tratamientos. Así mantenemos nombres alineados con lo que ofrece la clínica.
        </p>
      </div>

      {err && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100">{err}</p>}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 lg:sticky lg:top-6">
          <h2 className="text-sm font-semibold text-slate-800">{isEditing ? "Editar profesional" : "Nuevo profesional"}</h2>
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
                      {t.active === false ? " (inactivo)" : ""}
                    </option>
                  ))
                )}
              </select>
            </label>
            {isEditing && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="rounded border-slate-300" checked={activeEdit} onChange={(e) => setActiveEdit(e.target.checked)} />
                Activo en la web y en turnos
              </label>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {isEditing ? (
                <>
                  <AdminButton variant="neutral" className="w-full sm:w-auto sm:flex-1" onClick={() => void saveEdit()} disabled={treatments.length === 0}>
                    Guardar cambios
                  </AdminButton>
                  <AdminButton variant="ghost" className="w-full sm:w-auto" onClick={cancelEdit}>
                    Cancelar
                  </AdminButton>
                </>
              ) : (
                <AdminButton variant="neutral" className="w-full" onClick={() => void create()} disabled={treatments.length === 0}>
                  Crear profesional
                </AdminButton>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <h2 className="text-sm font-semibold text-slate-800">Profesionales dados de alta</h2>
          {rows.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Todavía no hay profesionales. Usá el formulario de la izquierda para crear el primero.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100 text-sm">
              {rows.map((p) => (
                <li key={p.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <span className="font-medium text-slate-900">{p.name}</span>
                    <span className="text-slate-600"> — {p.specialtyTreatment?.name ?? p.specialty}</span>
                    <span className="ml-2 text-xs font-medium text-slate-500">{p.active ? "Activo" : "Inactivo"}</span>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <AdminButton variant="ghost" className="text-sm" onClick={() => startEdit(p)}>
                      Editar
                    </AdminButton>
                    <AdminButton variant="danger" className="text-sm" onClick={() => void remove(p)}>
                      Eliminar
                    </AdminButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
