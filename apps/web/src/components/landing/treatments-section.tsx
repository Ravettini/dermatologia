"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PopularTreatment = {
  id: string;
  name: string;
  category: string;
  short: string;
  description: string;
  icon: string;
  /** Si está, la card lleva a otra sección/enlace en vez de abrir el detalle. */
  href?: string;
};

const POPULAR_TREATMENTS: PopularTreatment[] = [
  {
    id: "botox-full-face",
    name: "Botox full face",
    category: "Medicina estética",
    icon: "face",
    short: "Suaviza líneas de expresión en todo el rostro.",
    description:
      "Aplicación de toxina botulínica en todo el rostro para suavizar líneas de expresión y prevenir la formación de arrugas, con un resultado natural y armónico definido en consulta.",
  },
  {
    id: "lifting-no-quirurgico",
    name: "Lifting no quirúrgico",
    category: "Medicina estética",
    icon: "spa",
    short: "Firmeza y reposicionamiento sin cirugía.",
    description:
      "Tensado y reposicionamiento de los tejidos sin cirugía, combinando tecnología y técnicas médicas para una piel más firme y un rostro más descansado.",
  },
  {
    id: "luz-pulsada",
    name: "Luz pulsada",
    category: "Láser y tecnología",
    icon: "wb_sunny",
    short: "Unifica el tono y mejora manchas y rojeces.",
    description:
      "Tecnología que emite pulsos de luz para mejorar manchas, rojeces y signos de fotoenvejecimiento, unificando el tono y aportando luminosidad a la piel.",
  },
  {
    id: "medicina-regenerativa",
    name: "Medicina regenerativa",
    category: "Regenerativo",
    icon: "biotech",
    short: "Estímulo de la regeneración celular.",
    description:
      "Protocolos que potencian la regeneración celular (exosomas, bioestimulación y otros) para mejorar la calidad de la piel y el cabello según criterio médico.",
  },
  {
    id: "estructuracion-facial",
    name: "Estructuración facial con inyectables",
    category: "Medicina estética",
    icon: "format_shapes",
    short: "Restauración de volúmenes y armonización.",
    description:
      "Restauración de volúmenes y armonización de los rasgos con ácido hialurónico y bioestimuladores, siguiendo un plan personalizado y una mirada estética natural.",
  },
  {
    id: "otros",
    name: "Otros",
    category: "Más tratamientos",
    icon: "more_horiz",
    short: "Conocé todos nuestros tratamientos.",
    description:
      "Contamos con muchos más tratamientos faciales, corporales y capilares. Escribinos y te orientamos según tus objetivos.",
    href: "/#contacto",
  },
];

export function TreatmentsSection({ treatments: _treatments }: { treatments: unknown[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardsPerView, setCardsPerView] = useState(4);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  const items = useMemo(() => POPULAR_TREATMENTS, []);
  const selected = useMemo(
    () => items.find((t) => t.id === selectedId) ?? null,
    [selectedId, items]
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
  }, [cardsPerView]);

  const total = items.length;
  const canSlide = total > cardsPerView;

  useEffect(() => {
    if (!canSlide) return;
    const id = window.setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 7000);
    return () => window.clearInterval(id);
  }, [canSlide]);

  const loopTail = canSlide ? items.slice(0, cardsPerView) : [];
  const track = canSlide ? [...items, ...loopTail] : items;

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
      <div className="mx-auto mb-8 flex max-w-[1600px] flex-col gap-4 sm:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-2 block font-label text-xs uppercase tracking-[0.3em] text-secondary">Tratamientos</span>
          <h2 className="font-headline text-3xl text-on-surface md:text-4xl lg:text-5xl">Tratamientos más populares</h2>
        </div>
        <div className="flex items-center gap-2">
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
              <span className="material-symbols-outlined mb-6 block text-3xl text-secondary">{t.icon}</span>
              <h3 className="mb-2 font-headline text-2xl">{t.name}</h3>
              <p className="mb-2 text-xs uppercase tracking-wide text-on-surface-variant/80">{t.category}</p>
              <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">{t.short}</p>
              {t.href ? (
                <Link
                  href={t.href}
                  className="font-label text-xs uppercase tracking-tighter underline decoration-secondary/30 underline-offset-8"
                >
                  Descubrir
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className="font-label text-xs uppercase tracking-tighter underline decoration-secondary/30 underline-offset-8"
                >
                  Descubrir
                </button>
              )}
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
            <h4 className="mb-4 pr-8 font-headline text-3xl leading-tight text-on-surface">{selected.name}</h4>
            <p className="text-base leading-relaxed text-on-surface-variant">{selected.description}</p>
            <Link
              href="/#reservar"
              onClick={() => setSelectedId(null)}
              className="mt-6 inline-block bg-on-primary-container px-6 py-3 font-label text-xs uppercase tracking-widest text-surface transition-opacity hover:opacity-90"
            >
              Solicitar turno
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
