"use client";

import { useEffect, useMemo, useState } from "react";

type PublicTreatment = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  category: string;
  requiresPriorEval: boolean;
};

const CATEGORY_ICON: Record<string, string> = {
  facial: "face",
  corporal: "body_fat",
  laser: "medical_services",
  clinica: "stethoscope",
  clínica: "stethoscope",
  estetica: "spa",
  estética: "spa",
};

function resolveIcon(category: string): string {
  const normalized = category.trim().toLowerCase();
  return CATEGORY_ICON[normalized] ?? "spa";
}

export function TreatmentsSection({ treatments }: { treatments: PublicTreatment[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardsPerView, setCardsPerView] = useState(4);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const selected = useMemo(
    () => treatments.find((t) => t.id === selectedId) ?? null,
    [selectedId, treatments]
  );

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setCardsPerView(4);
      else if (window.innerWidth >= 640) setCardsPerView(2);
      else setCardsPerView(1);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [cardsPerView, treatments.length]);

  const total = treatments.length;
  const canSlide = total > cardsPerView;

  useEffect(() => {
    if (!canSlide) return;
    const id = window.setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 7000);
    return () => window.clearInterval(id);
  }, [canSlide]);

  const loopTail = canSlide ? treatments.slice(0, cardsPerView) : [];
  const track = canSlide ? [...treatments, ...loopTail] : treatments;

  function onTrackTransitionEnd() {
    if (!canSlide) return;
    if (index < total) return;
    setAnimate(false);
    setIndex(0);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setAnimate(true));
    });
  }

  function goNext() {
    if (!canSlide) return;
    setIndex((prev) => prev + 1);
  }

  function goPrev() {
    if (!canSlide) return;
    setIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }

  return (
    <section className="bg-surface-container px-4 py-14 sm:px-6 sm:py-16 md:px-10 md:py-20 lg:px-12 lg:py-24" id="tratamientos">
      <div className="mx-auto mb-4 flex max-w-[1600px] items-center justify-end gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canSlide}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-on-surface transition hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Ver tratamientos anteriores"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canSlide}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-on-surface transition hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Ver siguientes tratamientos"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
      <div className="mx-auto max-w-[1600px] overflow-hidden">
        <div
          className={`flex ${animate ? "transition-transform duration-[1600ms] ease-out" : ""}`}
          style={{ transform: `translateX(-${(index * 100) / cardsPerView}%)` }}
          onTransitionEnd={onTrackTransitionEnd}
        >
          {track.map((t, i) => (
            <article
              key={`${t.id}-${i}`}
              className="border-r border-outline-variant/25 bg-surface-container-lowest p-6 transition-colors hover:bg-surface-container-low sm:p-8 md:p-10 lg:p-12"
              style={{ flex: `0 0 ${100 / cardsPerView}%` }}
            >
              <span className="material-symbols-outlined mb-6 block text-3xl text-secondary">{resolveIcon(t.category)}</span>
              <h3 className="mb-2 font-headline text-2xl">{t.name}</h3>
              <p className="mb-2 text-xs uppercase tracking-wide text-on-surface-variant/80">
                {t.category} · {t.durationMinutes} min
              </p>
              <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
                {t.description}
              </p>
              <button
                type="button"
                onClick={() => setSelectedId(t.id)}
                className="font-label text-xs uppercase tracking-tighter underline decoration-secondary/30 underline-offset-8"
              >
                Descubrir
              </button>
            </article>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Cerrar detalle de tratamiento"
            onClick={() => setSelectedId(null)}
          />
          <div className="relative z-[81] w-full max-w-xl rounded-xl bg-surface-container-lowest p-6 shadow-soft sm:p-8">
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
                Este tratamiento requiere evaluación médica previa.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

