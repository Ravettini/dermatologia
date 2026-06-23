"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
    name: "Ultherapy (lifting no quirúrgico)",
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

  const items = useMemo(() => POPULAR_TREATMENTS, []);
  const selected = useMemo(
    () => items.find((t) => t.id === selectedId) ?? null,
    [selectedId, items]
  );

  return (
    <section className="bg-surface-container px-4 py-14 sm:px-6 sm:py-16 md:px-10 md:py-20 lg:px-12 lg:py-24" id="tratamientos">
      <div className="mx-auto mb-8 max-w-[1600px] sm:mb-10">
        <span className="mb-2 block font-label text-xs uppercase tracking-[0.3em] text-secondary">Tratamientos</span>
        <h2 className="font-headline text-3xl text-on-surface md:text-4xl lg:text-5xl">Tratamientos más populares</h2>
      </div>
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-px overflow-hidden border border-outline-variant/25 bg-outline-variant/25 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <article
            key={t.id}
            className="flex flex-col bg-surface-container-lowest p-6 transition-colors hover:bg-surface-container-low sm:p-8 md:p-10 lg:p-12"
          >
            <span className="material-symbols-outlined mb-6 block text-3xl text-secondary">{t.icon}</span>
            <h3 className="mb-2 font-headline text-2xl">{t.name}</h3>
            <p className="mb-2 text-xs uppercase tracking-wide text-on-surface-variant/80">{t.category}</p>
            <p className="mb-6 flex-1 text-sm leading-relaxed text-on-surface-variant">{t.short}</p>
            {t.href ? (
              <Link
                href={t.href}
                className="self-start font-label text-xs uppercase tracking-tighter underline decoration-secondary/30 underline-offset-8"
              >
                Descubrir
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedId(t.id)}
                className="self-start font-label text-xs uppercase tracking-tighter underline decoration-secondary/30 underline-offset-8"
              >
                Descubrir
              </button>
            )}
          </article>
        ))}
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
              href="/#tratamientos"
              onClick={() => setSelectedId(null)}
              className="mt-6 inline-block bg-on-primary-container px-6 py-3 font-label text-xs uppercase tracking-widest text-surface transition-opacity hover:opacity-90"
            >
              Ver más tratamientos
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
