"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { AdminButton } from "@/components/admin/admin-button";

type Tr = {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  category: string;
  active: boolean;
  requiresPriorEval: boolean;
};

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminTreatmentsPage() {
  const [rows, setRows] = useState<Tr[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [requiresPriorEval, setRequiresPriorEval] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeEdit, setActiveEdit] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const d = await apiFetch<{ treatments: Tr[] }>("/api/admin/treatments");
    setRows(d.treatments);
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

  useEffect(() => {
    if (!editingId && !slugTouched && name.trim()) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched, editingId]);

  function startEdit(t: Tr) {
    setErr(null);
    setEditingId(t.id);
    setName(t.name);
    setSlug(t.slug);
    setSlugTouched(true);
    setDescription(t.description);
    setCategory(t.category);
    setDurationMinutes(t.durationMinutes);
    setRequiresPriorEval(t.requiresPriorEval);
    setActiveEdit(t.active);
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setCategory("General");
    setDurationMinutes(30);
    setRequiresPriorEval(false);
    setActiveEdit(true);
  }

  async function create() {
    setErr(null);
    if (!name.trim() || !slug.trim() || !description.trim() || !category.trim()) {
      setErr("Completá al menos nombre, URL, descripción y categoría.");
      return;
    }
    try {
      await apiFetch("/api/admin/treatments", {
        method: "POST",
        json: {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          category: category.trim(),
          durationMinutes,
          requiresPriorEval,
        },
      });
      cancelEdit();
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo crear");
    }
  }

  async function saveEdit() {
    if (!editingId) return;
    setErr(null);
    if (!name.trim() || !slug.trim() || !description.trim() || !category.trim()) {
      setErr("Completá al menos nombre, URL, descripción y categoría.");
      return;
    }
    try {
      await apiFetch(`/api/admin/treatments/${editingId}`, {
        method: "PATCH",
        json: {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          category: category.trim(),
          durationMinutes,
          requiresPriorEval,
          active: activeEdit,
        },
      });
      cancelEdit();
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo guardar");
    }
  }

  async function remove(t: Tr) {
    const ok = window.confirm(
      `¿Eliminar el tratamiento «${t.name}»? Los profesionales dejan de asociarse a esta especialidad; los turnos ya reservados no se borran.`,
    );
    if (!ok) return;
    setErr(null);
    try {
      await apiFetch(`/api/admin/treatments/${t.id}`, { method: "DELETE" });
      if (editingId === t.id) cancelEdit();
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  }

  const isEditing = editingId !== null;

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h1 className="font-headline text-2xl text-slate-900 sm:text-3xl">Tratamientos</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Estos datos alimentan la web pública, el buscador de turnos y la <strong>especialidad</strong> de cada
          profesional. El <strong>slug</strong> se genera solo desde el nombre; podés ajustarlo si hace falta.
        </p>
      </div>

      {err && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100">{err}</p>}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 lg:sticky lg:top-6">
          <h2 className="text-sm font-semibold text-slate-800">{isEditing ? "Editar tratamiento" : "Nuevo tratamiento"}</h2>

          <div className="mt-4 space-y-5">
            <div>
              <label className="text-xs font-medium text-slate-700">Nombre visible</label>
              <p className="mt-0.5 text-xs text-slate-500">Cómo aparece en la web y en los listados (ej. &quot;Peelings médicos&quot;).</p>
              <input
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del servicio"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">Slug (URL)</label>
              <p className="mt-0.5 text-xs text-slate-500">
                Identificador en minúsculas, sin espacios, para URLs y enlaces internos. Se rellena solo al escribir el nombre;
                tocá el campo si querés cambiarlo a mano.
              </p>
              <input
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="peelings-medicos"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">Descripción</label>
              <p className="mt-0.5 text-xs text-slate-500">
                Texto que describe el tratamiento para pacientes (web, fichas, exportaciones). Una o dos frases claras.
              </p>
              <textarea
                className="mt-1.5 min-h-[88px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Renovación celular guiada para manchas y texturas irregulares."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-700">Categoría</label>
                <p className="mt-0.5 text-xs text-slate-500">Agrupa en la web (ej. Facial, Clínica, Láser).</p>
                <input
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Facial"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Duración (minutos)</label>
                <p className="mt-0.5 text-xs text-slate-500">Tiempo estimado del turno; se usa al generar franjas horarias.</p>
                <input
                  type="number"
                  min={5}
                  max={600}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value) || 30)}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={requiresPriorEval}
                onChange={(e) => setRequiresPriorEval(e.target.checked)}
              />
              <span>
                <span className="font-medium text-slate-800">Requiere evaluación previa</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Marcá si el paciente debe tener una consulta u otra condición antes de este procedimiento.
                </span>
              </span>
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
                  <AdminButton variant="neutral" className="w-full sm:w-auto sm:flex-1" onClick={() => void saveEdit()}>
                    Guardar cambios
                  </AdminButton>
                  <AdminButton variant="ghost" className="w-full sm:w-auto" onClick={cancelEdit}>
                    Cancelar
                  </AdminButton>
                </>
              ) : (
                <AdminButton variant="neutral" className="w-full sm:w-auto" onClick={() => void create()}>
                  Crear tratamiento
                </AdminButton>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <h2 className="text-sm font-semibold text-slate-800">Tratamientos dados de alta</h2>
          {rows.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Todavía no hay tratamientos. Usá el formulario de la izquierda para crear el primero.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100 text-sm">
              {rows.map((t) => (
                <li key={t.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <span className="font-medium text-slate-900">{t.name}</span>{" "}
                    <span className="font-mono text-xs text-slate-500">({t.slug})</span>
                    <span className="ml-2 text-xs text-slate-500">
                      {t.durationMinutes} min · {t.category}
                    </span>
                    <span className="ml-2 text-xs font-medium text-slate-500">{t.active ? "Activo" : "Inactivo"}</span>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <AdminButton variant="ghost" className="text-sm" onClick={() => startEdit(t)}>
                      Editar
                    </AdminButton>
                    <AdminButton variant="danger" className="text-sm" onClick={() => void remove(t)}>
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
