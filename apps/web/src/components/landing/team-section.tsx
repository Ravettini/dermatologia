"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export type TeamMember = {
  id: string;
  name: string;
  specialty: string;
  bio: string | null;
  imageUrl: string | null;
};

const DEFAULT_FILTER = "__dermatologia_destacados__";
const ALL_FILTER = "__todos__";

const DERMATOLOGY_GENERAL = "Dermatología";
const AESTHETIC_MEDICINE = "Medicina estética";

function normalizeSpecialty(specialty: string): string {
  const clean = specialty.trim();
  const lower = clean
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (
    lower === "dermatología" ||
    lower === "dermatologia" ||
    lower === "dermatología clínica" ||
    lower === "dermatologia clinica"
  ) {
    return DERMATOLOGY_GENERAL;
  }

  if (
    lower === "estetica" ||
    (lower.includes("medicina") && lower.includes("estetic"))
  ) {
    return AESTHETIC_MEDICINE;
  }

  return clean;
}

export function TeamSection({ professionals }: { professionals: TeamMember[] }) {
  const [filter, setFilter] = useState(DEFAULT_FILTER);

  const dermatologiaClinica = useMemo(
    () => professionals.filter((p) => normalizeSpecialty(p.specialty) === DERMATOLOGY_GENERAL),
    [professionals]
  );

  const specialtyOptions = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const p of professionals) {
      const s = normalizeSpecialty(p.specialty);
      if (s && !seen.has(s)) {
        seen.add(s);
        list.push(s);
      }
    }
    return list;
  }, [professionals]);

  const visible = useMemo(() => {
    if (filter === DEFAULT_FILTER) {
      return dermatologiaClinica.slice(0, 3);
    }
    if (filter === ALL_FILTER) {
      return professionals;
    }
    return professionals.filter((p) => normalizeSpecialty(p.specialty) === filter);
  }, [filter, professionals, dermatologiaClinica]);

  if (professionals.length === 0) {
    return (
      <section
        className="bg-surface-container px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32"
        id="equipo"
      >
        <p className="mx-auto max-w-[1600px] text-center text-sm text-on-surface-variant">
          Información del equipo disponible próximamente.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-surface-container px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32" id="equipo">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-2 block font-label text-xs uppercase tracking-[0.3em] text-secondary">Equipo</span>
            <h2 className="font-headline text-3xl text-on-surface md:text-4xl">Profesionales</h2>
            <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
              Mostramos primero el equipo de dermatología. Elegí una especialidad para ver al resto del equipo.
            </p>
          </div>
          <label className="flex w-full flex-col gap-2 md:w-72">
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Especialidad</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface"
            >
              <option value={DEFAULT_FILTER}>Dermatología (destacados)</option>
              <option value={ALL_FILTER}>Todo el equipo</option>
              {specialtyOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        {visible.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant">No hay profesionales para esta especialidad.</p>
        ) : (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            {visible.map((m) => (
              <div
                key={m.id}
                className={`space-y-6 ${visible.length === 1 ? "sm:col-span-2 lg:col-span-1 lg:col-start-2" : ""}`}
              >
                <div className="relative mx-auto aspect-[4/5] w-full max-w-[240px] overflow-hidden bg-surface-container-high sm:max-w-[280px]">
                  {m.imageUrl ? (
                    <Image
                      src={m.imageUrl}
                      alt={m.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-on-surface-variant">
                      {m.name}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h4 className="font-headline text-2xl text-secondary">{m.name}</h4>
                  <p className="mt-1 font-label text-xs uppercase tracking-widest text-on-surface-variant">
                    {normalizeSpecialty(m.specialty)}
                  </p>
                  {m.bio ? (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">{m.bio}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
