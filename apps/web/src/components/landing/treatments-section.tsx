"use client";

import { useId, useMemo, useState } from "react";

type TreatmentItem = {
  id: string;
  name: string;
  category: string;
  short: string;
  description: string;
  icon: string;
};

const POPULAR_TREATMENTS: TreatmentItem[] = [
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
      "Contamos con muchos más tratamientos faciales, corporales y capilares. Explorá el catálogo completo y encontrá el protocolo indicado para vos.",
  },
];

const MORE_TREATMENTS: TreatmentItem[] = [
  {
    id: "consulta-dermatologica",
    name: "Consulta dermatológica general",
    category: "Clínica",
    icon: "medical_services",
    short: "Evaluación integral de piel, pelo y uñas.",
    description: "Evaluación integral de piel, pelo y uñas.",
  },
  {
    id: "limpieza-facial-profunda",
    name: "Limpieza facial profunda",
    category: "Facial",
    icon: "water_drop",
    short: "Remoción de impurezas y nutrición intensa.",
    description: "Remoción de impurezas y nutrición intensa para un cutis renovado.",
  },
  {
    id: "peelings-medicos",
    name: "Peelings médicos",
    category: "Facial",
    icon: "layers",
    short: "Renovación celular para manchas y texturas.",
    description: "Renovación celular guiada para manchas y texturas irregulares.",
  },
  {
    id: "control-de-acne",
    name: "Control de acné",
    category: "Clínica",
    icon: "healing",
    short: "Protocolos médicos para brotes y secuelas.",
    description: "Protocolos médicos integrales para brotes y secuelas.",
  },
  {
    id: "rejuvenecimiento",
    name: "Rejuvenecimiento",
    category: "Estética",
    icon: "auto_awesome",
    short: "Enfoques combinados para una expresión fresca.",
    description: "Enfoques combinados para una expresión fresca y natural.",
  },
  {
    id: "mesoterapia-premium",
    name: "Mesoterapia PREMIUM corporal y capilar",
    category: "Mesoterapia",
    icon: "vaccines",
    short: "Línea premium corporal y capilar.",
    description: "Línea premium corporal y capilar. Definición de plan en consulta.",
  },
  {
    id: "mesoglow-plus",
    name: "Mesoglow PLUS",
    category: "Facial",
    icon: "flare",
    short: "Microdermoabrasión, peeling y mesoterapia facial.",
    description:
      "Protocolo integral: microdermoabrasión, peeling y mesoterapia facial en una sesión.",
  },
  {
    id: "exosomas-facial",
    name: "Exosomas facial",
    category: "Facial",
    icon: "science",
    short: "Regeneración y reparación celular facial.",
    description:
      "Tecnología avanzada que potencia la regeneración y reparación celular; mejora la calidad de la piel.",
  },
  {
    id: "exosomas-capilar",
    name: "Exosomas capilar",
    category: "Capilar",
    icon: "content_cut",
    short: "Regeneración y reparación celular capilar.",
    description:
      "Tecnología avanzada que potencia la regeneración y reparación celular; mejora la calidad del cabello.",
  },
  {
    id: "light-and-bright",
    name: "Light & Bright (Nordlys)",
    category: "Láser y tecnología",
    icon: "light_mode",
    short: "Unifica el tono y aporta luminosidad.",
    description:
      "Unifica el tono, mejora manchas y rojeces, y aporta luminosidad con tecnología Nordlys.",
  },
  {
    id: "sunekos",
    name: "Sunekos",
    category: "Medicina estética",
    icon: "water_full",
    short: "Biorrevitalización y soporte dérmico.",
    description: "Biorrevitalización y soporte de la estructura dérmica según indicación médica.",
  },
  {
    id: "enzimas-biologicas",
    name: "Enzimas biológicas",
    category: "Corporal",
    icon: "fitness_center",
    short: "Reducción de fibrosis y grasa localizada.",
    description:
      "Enzimas de uso médico para reducción de fibrosis y grasa localizada según criterio médico.",
  },
  {
    id: "hidratacion-inyectable",
    name: "Profhilo / Volite / Skinvive / Cellbooster / Skinbooster / Hydrodeluxe",
    category: "Medicina estética",
    icon: "opacity",
    short: "Hidratación inyectable y remodelación.",
    description:
      "Línea de hidratación inyectable y remodelación (nombres comerciales según plan).",
  },
  {
    id: "frax-exosomas-facial",
    name: "FRAX + exosomas facial",
    category: "Láser y tecnología",
    icon: "blur_on",
    short: "Láser fraccionado con exosomas facial.",
    description:
      "Combinación de láser fraccionado con exosomas para regeneración facial, según protocolo médico.",
  },
  {
    id: "frax-exosomas-capilar",
    name: "FRAX + exosomas capilar",
    category: "Láser y tecnología",
    icon: "blur_circular",
    short: "Láser fraccionado con exosomas capilar.",
    description:
      "Combinación de láser fraccionado con exosomas para regeneración capilar, según protocolo médico.",
  },
];

function MoreTreatmentCard({
  t,
  onOpenDetail,
}: {
  t: TreatmentItem;
  onOpenDetail: () => void;
}) {
  return (
    <article className="group flex items-start justify-between border border-outline-variant/40 bg-surface-container-lowest p-5 transition-colors duration-500 hover:bg-surface-container-low sm:p-6">
      <div className="min-w-0 pr-3">
        <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-secondary">{t.category}</p>
        <h5 className="mb-2 font-headline text-xl leading-snug sm:text-2xl">{t.name}</h5>
        <p className="max-w-lg text-sm text-on-surface-variant">{t.short}</p>
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

export function TreatmentsSection({ treatments: _treatments }: { treatments: unknown[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const modalTitleId = useId();

  const items = useMemo(() => POPULAR_TREATMENTS, []);
  const allTreatments = useMemo(() => [...POPULAR_TREATMENTS, ...MORE_TREATMENTS], []);
  const selected = useMemo(
    () => allTreatments.find((t) => t.id === selectedId) ?? null,
    [selectedId, allTreatments]
  );

  function openDetail(id: string, opts?: { closeMoreModal?: boolean }) {
    if (opts?.closeMoreModal) setMoreOpen(false);
    setSelectedId(id);
  }

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
            {t.id === "otros" ? (
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                className="self-start font-label text-xs uppercase tracking-tighter underline decoration-secondary/30 underline-offset-8"
              >
                Descubrir
              </button>
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

      {moreOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-on-primary-container/40 backdrop-blur-[2px]"
            aria-label="Cerrar lista de tratamientos"
            onClick={() => setMoreOpen(false)}
          />
          <div className="relative flex max-h-[min(92dvh,900px)] w-full max-w-5xl flex-col rounded-t-2xl bg-surface shadow-soft sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-outline-variant/40 px-5 py-4 sm:px-6">
              <h3 id={modalTitleId} className="font-headline text-xl text-on-surface sm:text-2xl">
                Más tratamientos
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8">
                {MORE_TREATMENTS.map((t) => (
                  <MoreTreatmentCard
                    key={t.id}
                    t={t}
                    onOpenDetail={() => openDetail(t.id, { closeMoreModal: true })}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selected && selected.id !== "otros" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Cerrar detalle de tratamiento"
            onClick={() => setSelectedId(null)}
          />
          <div className="relative z-[101] w-full max-w-xl rounded-xl bg-surface-container-lowest p-6 shadow-soft sm:p-8">
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
          </div>
        </div>
      )}
    </section>
  );
}
