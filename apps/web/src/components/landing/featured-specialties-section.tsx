"use client";

import { useEffect, useId, useMemo, useState } from "react";

type Highlight = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  category: string;
  requiresPriorEval: boolean;
};

const FEATURED_SPECIALTIES_STATIC: Highlight[] = [
  {
    id: "feat-medicina-clinica",
    name: "Medicina Clínica",
    description:
      "Evaluación y tratamiento de las enfermedades de la piel, el pelo y las uñas. Cuando el caso lo requiere, se indican estudios complementarios o biopsias dentro del plan médico correspondiente.",
    durationMinutes: 45,
    category: "Dermatología clínica",
    requiresPriorEval: false,
  },
  {
    id: "feat-medicina-estetica",
    name: "Medicina Estética",
    description:
      "Procedimientos para mejorar y mantener la calidad de la piel con criterio médico, buscando resultados naturales y armónicos.",
    durationMinutes: 45,
    category: "Estética",
    requiresPriorEval: false,
  },
  {
    id: "feat-medicina-pediatrica",
    name: "Medicina Pediátrica",
    description:
      "Atención dermatológica para bebés, niños y adolescentes, con un enfoque cuidadoso y especializado en la piel en crecimiento.",
    durationMinutes: 45,
    category: "Pediátrica",
    requiresPriorEval: false,
  },
  {
    id: "feat-medicina-funcional",
    name: "Medicina Funcional",
    description:
      "Abordaje integral que relaciona la salud de la piel con hábitos, metabolismo y bienestar general.",
    durationMinutes: 45,
    category: "Integral",
    requiresPriorEval: false,
  },
  {
    id: "feat-mapeo-digital",
    name: "Mapeo digital",
    description:
      "Control digital de lunares para la detección temprana y el seguimiento de lesiones de la piel a lo largo del tiempo.",
    durationMinutes: 30,
    category: "Diagnóstico",
    requiresPriorEval: false,
  },
];

const INITIAL_COUNT = FEATURED_SPECIALTIES_STATIC.length;

function SpecialtyCard({
  t,
  onOpenDetail,
}: {
  t: Highlight;
  onOpenDetail: () => void;
}) {
  return (
    <article className="group flex items-start justify-between border border-outline-variant/40 bg-surface-container-lowest p-5 transition-colors duration-500 hover:bg-surface-container-low sm:p-8 md:p-10">
      <div className="min-w-0 pr-3">
        <h5 className="mb-2 font-headline text-2xl leading-snug">{t.name}</h5>
        <p className="max-w-lg text-sm text-on-surface-variant">{t.description}</p>
      </div>
      <button
        type="button"
        onClick={onOpenDetail}
        className="shrink-0 rounded-full p-1 text-secondary transition hover:bg-secondary/10"
        aria-label={`Ver detalle de ${t.name}`}
      >
        <span className="material-symbols-outlined text-secondary opacity-80 transition-opacity group-hover:opacity-100">
          arrow_outward
        </span>
      </button>
    </article>
  );
}

export function FeaturedSpecialtiesSection({ treatments: _treatments }: { treatments: unknown[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const modalTitleId = useId();

  const all = useMemo(() => FEATURED_SPECIALTIES_STATIC, []);
  const visible = useMemo(() => all.slice(0, INITIAL_COUNT), [all]);
  const rest = useMemo(() => all.slice(INITIAL_COUNT), [all]);
  const hasMore = rest.length > 0;

  const selected = useMemo(() => all.find((item) => item.id === selectedId) ?? null, [all, selectedId]);

  useEffect(() => {
    if (!moreOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  function openDetail(id: string, options?: { closeListModal?: boolean }) {
    if (options?.closeListModal) setMoreOpen(false);
    setSelectedId(id);
  }

  return (
    <section className="bg-surface px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32">
      <div className="mx-auto mb-14 max-w-[1600px] text-center sm:mb-16 md:mb-20">
        <span className="mb-4 block font-label text-xs uppercase tracking-[0.3em] text-secondary">
          Nuestra experiencia
        </span>
        <h2 className="font-headline text-4xl md:text-5xl">Especialidades destacadas</h2>
      </div>
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        {visible.map((t) => (
          <SpecialtyCard key={t.id} t={t} onOpenDetail={() => openDetail(t.id)} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="inline-flex items-center gap-2 border border-outline-variant bg-surface-container-low px-6 py-3 font-label text-xs uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-lg leading-none">add</span>+ Especialidades
          </button>
        </div>
      )}

      {moreOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-on-primary-container/40 backdrop-blur-[2px]"
            aria-label="Cerrar lista de especialidades"
            onClick={() => setMoreOpen(false)}
          />
          <div className="relative flex max-h-[min(92dvh,900px)] w-full max-w-5xl flex-col rounded-t-2xl bg-surface shadow-soft sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-outline-variant/40 px-5 py-4 sm:px-6">
              <h3 id={modalTitleId} className="font-headline text-xl text-on-surface sm:text-2xl">
                Más especialidades
              </h3>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-high"
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-4 sm:px-6 sm:pt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:gap-10">
                {rest.map((t) => (
                  <SpecialtyCard
                    key={t.id}
                    t={t}
                    onOpenDetail={() => openDetail(t.id, { closeListModal: true })}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Cerrar detalle de especialidad"
            onClick={() => setSelectedId(null)}
          />
          <div className="relative z-[111] w-full max-w-xl rounded-xl bg-surface-container-lowest p-6 shadow-soft sm:p-8">
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
              Duración orientativa: <strong>{selected.durationMinutes} minutos</strong>
            </p>
            <p className="text-base leading-relaxed text-on-surface-variant">{selected.description}</p>
            {selected.requiresPriorEval && (
              <p className="mt-4 rounded-lg bg-secondary/10 px-3 py-2 text-sm text-on-surface">
                Requiere evaluación médica previa.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
