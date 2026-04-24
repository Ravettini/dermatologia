"use client";

import { useMemo, useState } from "react";

type PublicTreatment = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  category: string;
  requiresPriorEval: boolean;
};

const FALLBACK_SPECIALTIES: PublicTreatment[] = [
  {
    id: "fallback-limpieza-facial",
    name: "Limpieza facial profunda",
    description: "Remoción de impurezas y nutrición intensa para un cutis renovado.",
    durationMinutes: 45,
    category: "Facial",
    requiresPriorEval: false,
  },
  {
    id: "fallback-peelings",
    name: "Peelings médicos",
    description: "Renovación celular guiada para manchas y texturas irregulares.",
    durationMinutes: 40,
    category: "Facial",
    requiresPriorEval: false,
  },
  {
    id: "fallback-acne",
    name: "Control de acné",
    description: "Protocolos médicos integrales para brotes y secuelas.",
    durationMinutes: 35,
    category: "Clínica",
    requiresPriorEval: false,
  },
  {
    id: "fallback-rejuvenecimiento",
    name: "Rejuvenecimiento",
    description: "Enfoques combinados para una expresión fresca y natural.",
    durationMinutes: 50,
    category: "Estética",
    requiresPriorEval: true,
  },
];

export function FeaturedSpecialtiesSection({ treatments }: { treatments: PublicTreatment[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const featured = useMemo(() => {
    if (treatments.length >= 4) return treatments.slice(0, 4);
    if (treatments.length === 0) return FALLBACK_SPECIALTIES;
    return [...treatments, ...FALLBACK_SPECIALTIES].slice(0, 4);
  }, [treatments]);

  const selected = useMemo(
    () => featured.find((t) => t.id === selectedId) ?? null,
    [featured, selectedId]
  );

  return (
    <section className="bg-surface px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32">
      <div className="mx-auto mb-14 max-w-[1600px] text-center sm:mb-16 md:mb-20">
        <span className="mb-4 block font-label text-xs uppercase tracking-[0.3em] text-secondary">Nuestra experiencia</span>
        <h2 className="font-headline text-4xl md:text-5xl">Especialidades destacadas</h2>
      </div>
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        {featured.map((t) => (
          <article
            key={t.id}
            className="group flex items-start justify-between border border-outline-variant/40 bg-surface-container-lowest p-5 transition-colors duration-500 hover:bg-surface-container-low sm:p-8 md:p-10"
          >
            <div>
              <h5 className="mb-2 font-headline text-2xl">{t.name}</h5>
              <p className="max-w-xs text-sm text-on-surface-variant">{t.description}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(t.id)}
              className="rounded-full p-1 text-secondary transition hover:bg-secondary/10"
              aria-label={`Ver detalle de ${t.name}`}
            >
              <span className="material-symbols-outlined text-secondary opacity-80 transition-opacity group-hover:opacity-100">
                arrow_outward
              </span>
            </button>
          </article>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Cerrar detalle de especialidad"
            onClick={() => setSelectedId(null)}
          />
          <div className="relative z-[91] w-full max-w-xl rounded-xl bg-surface-container-lowest p-6 shadow-soft sm:p-8">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="absolute right-3 top-3 rounded-md p-1 text-on-surface-variant hover:bg-surface-container-low"
              aria-label="Cerrar"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-secondary">{selected.category}</p>
            <h4 className="mb-3 pr-8 font-headline text-3xl leading-tight text-on-surface">{selected.name}</h4>
            <p className="mb-4 text-sm text-on-surface-variant">
              Duración estimada: <strong>{selected.durationMinutes} minutos</strong>
            </p>
            <p className="text-base leading-relaxed text-on-surface-variant">{selected.description}</p>
            {selected.requiresPriorEval && (
              <p className="mt-4 rounded-lg bg-secondary/10 px-3 py-2 text-sm text-on-surface">
                Esta especialidad requiere evaluación médica previa.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

