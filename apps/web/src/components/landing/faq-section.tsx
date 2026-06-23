"use client";

import { useEffect, useId, useState } from "react";

export type FaqItem = { id: string; question: string; answer: string };

const INITIAL_COUNT = 3;

function FaqAccordionList({ items, firstOpen }: { items: FaqItem[]; firstOpen: boolean }) {
  return (
    <div className="space-y-2">
      {items.map((f, idx) => (
        <details
          key={f.id}
          className="group border-b border-outline-variant/30 py-4 sm:py-6"
          open={firstOpen && idx === 0}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-headline text-lg sm:text-xl">
            <span className="min-w-0 text-left">{f.question}</span>
            <span className="material-symbols-outlined shrink-0 transition-transform group-open:rotate-180">
              expand_more
            </span>
          </summary>
          <p className="mt-3 whitespace-pre-line font-body leading-relaxed text-on-surface-variant sm:mt-4">
            {f.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const titleId = useId();
  const hasMore = faqs.length > INITIAL_COUNT;
  const visible = faqs.slice(0, INITIAL_COUNT);
  const rest = faqs.slice(INITIAL_COUNT);

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h2 className="mb-8 text-center font-headline text-3xl sm:mb-10 sm:text-4xl">Preguntas frecuentes</h2>
      <FaqAccordionList items={visible} firstOpen />

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 border border-outline-variant bg-surface-container-low px-6 py-3 font-label text-xs uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-lg leading-none">add</span>
            + Preguntas frecuentes
          </button>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-on-primary-container/40 backdrop-blur-[2px]"
            aria-label="Cerrar"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative flex max-h-[min(92dvh,900px)] w-full max-w-2xl flex-col rounded-t-2xl bg-surface shadow-soft sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-outline-variant/40 px-5 py-4 sm:px-6">
              <p id={titleId} className="font-headline text-xl text-on-surface sm:text-2xl">
                Más preguntas frecuentes
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-high"
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-2 sm:px-6">
              <FaqAccordionList items={rest} firstOpen={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
