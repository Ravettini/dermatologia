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
    if (!slugTouched && name.trim()) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

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
      setName("");
      setSlug("");
      setSlugTouched(false);
      setDescription("");
      setCategory("General");
      setDurationMinutes(30);
      setRequiresPriorEval(false);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo crear");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl text-slate-900">Tratamientos</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Estos datos alimentan la web pública, el buscador de turnos y la <strong>especialidad</strong> de cada
          profesional. El <strong>slug</strong> se genera solo desde el nombre; podés ajustarlo si hace falta.
        </p>
      </div>

      {err && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100">{err}</p>}

      <div className="max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <h2 className="text-sm font-semibold text-slate-800">Crear tratamiento</h2>

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

          <AdminButton variant="neutral" className="w-full sm:w-auto" onClick={() => void create()}>
            Crear tratamiento
          </AdminButton>
        </div>
      </div>

      <div className="max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <h2 className="text-sm font-semibold text-slate-800">Listado</h2>
        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {rows.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span>
                <span className="font-medium text-slate-900">{t.name}</span>{" "}
                <span className="font-mono text-xs text-slate-500">({t.slug})</span>
                <span className="ml-2 text-xs text-slate-500">
                  {t.durationMinutes} min · {t.category}
                </span>
              </span>
              <span className="text-xs font-medium text-slate-500">{t.active ? "Activo" : "Inactivo"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
