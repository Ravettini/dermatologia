"use client";

import { useEffect, useId, useMemo, useState } from "react";

type ServiceGroup = {
  heading: string;
  items: string[];
};

type Service = {
  id: string;
  title: string;
  shortDescription: string;
  highlights: string[];
  cta: string;
  intro: string;
  groups: ServiceGroup[];
};

const BOOKING_HREF = "/#reservar";

const SERVICES: Service[] = [
  {
    id: "clinical",
    title: "Dermatología clínica",
    shortDescription:
      "Evaluación, diagnóstico y tratamiento de enfermedades de la piel, el pelo y las uñas.",
    highlights: ["Mapeo digital", "Control de nevos", "Biopsias", "Alopecia"],
    cta: "Ver consultas clínicas",
    intro:
      "Evaluación y tratamiento médico de enfermedades de la piel, el pelo y las uñas. Cuando el caso lo requiere, se indican estudios complementarios o biopsias dentro del plan médico correspondiente.",
    groups: [
      {
        heading: "Consultas y diagnóstico",
        items: ["Mapeo digital", "Control de nevos", "Biopsia"],
      },
      {
        heading: "Patologías frecuentes",
        items: ["Alopecia", "Rosácea", "Melasma", "Acné", "Verrugas"],
      },
      {
        heading: "Tratamientos",
        items: ["Criocirugía"],
      },
    ],
  },
  {
    id: "aesthetic",
    title: "Dermatología estética",
    shortDescription:
      "Procedimientos médicos para mejorar la calidad de la piel con resultados naturales y armónicos.",
    highlights: ["Bótox", "Ácido hialurónico", "Peeling", "Bioestimuladores"],
    cta: "Ver tratamientos",
    intro:
      "Procedimientos médicos orientados a mejorar la calidad de la piel, acompañando el envejecimiento de forma natural y armónica.",
    groups: [
      {
        heading: "Facial",
        items: [
          "Bótox",
          "Ácido hialurónico",
          "Radiesse",
          "Sculptra",
          "HarmonyCa",
          "Armonización facial",
        ],
      },
      {
        heading: "Calidad de piel",
        items: [
          "Ultherapy",
          "Profhilo",
          "Peeling",
          "Microneedling",
          "Luz pulsada",
          "Light and Bright",
          "Hydroluxe",
          "Cellbooster",
        ],
      },
      {
        heading: "Capilar y corporal",
        items: [
          "Mesoterapia capilar",
          "Mesoterapia corporal",
          "Plasma rico en plaquetas",
          "Exosomas",
          "Enzimas biológicas",
        ],
      },
    ],
  },
  {
    id: "pediatric",
    title: "Dermatología pediátrica",
    shortDescription:
      "Atención dermatológica para bebés, niños y adolescentes, con enfoque en la piel en crecimiento.",
    highlights: ["Control de nevos", "Curetaje de moluscos", "Criocirugía", "Biopsias"],
    cta: "Ver detalle",
    intro:
      "Atención dermatológica para bebés, niños y adolescentes, con un enfoque cuidadoso y especializado en la piel en crecimiento.",
    groups: [
      {
        heading: "Procedimientos",
        items: [
          "Biopsias",
          "Curetaje de moluscos",
          "Criocirugía",
          "Control de acné",
          "Control de nevos",
        ],
      },
    ],
  },
  {
    id: "functional",
    title: "Dermatología funcional",
    shortDescription:
      "Abordaje integral que relaciona la salud de la piel con hábitos, metabolismo y bienestar general.",
    highlights: [],
    cta: "Ver detalle",
    intro:
      "Abordaje integral que relaciona la salud de la piel con los hábitos, el metabolismo y el bienestar general, complementando el tratamiento dermatológico con una mirada global de cada persona.",
    groups: [],
  },
  {
    id: "digital-mapping",
    title: "Mapeo digital",
    shortDescription:
      "Control digital de lunares para la detección temprana y el seguimiento de lesiones de la piel.",
    highlights: [],
    cta: "Ver detalle",
    intro:
      "Control digital de lunares para la detección temprana y el seguimiento de lesiones de la piel a lo largo del tiempo, comparando imágenes en cada consulta.",
    groups: [],
  },
];

function ServiceCard({ service, onOpen }: { service: Service; onOpen: () => void }) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`${service.title}. ${service.cta}`}
      className="group relative flex cursor-pointer flex-col rounded-[18px] border border-[rgba(120,95,75,0.12)] bg-[#fffdf9] p-8 shadow-[0_10px_30px_-24px_rgba(80,60,40,0.28)] outline-none transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(120,95,75,0.28)] hover:shadow-[0_20px_44px_-26px_rgba(80,60,40,0.4)] focus-visible:ring-2 focus-visible:ring-[#8a6f57]/40 sm:p-10"
    >
      <span
        aria-hidden
        className="material-symbols-outlined absolute right-6 top-6 text-[#8a6f57]/70 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#8a6f57]"
      >
        arrow_outward
      </span>

      <h3 className="mb-3 max-w-[85%] font-headline text-[28px] leading-tight text-[#2c2420] sm:text-[32px]">
        {service.title}
      </h3>
      <p className="max-w-md text-[15px] leading-[1.6] text-[#6b615a]">
        {service.shortDescription}
      </p>

      {service.highlights.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {service.highlights.map((item) => (
            <li
              key={item}
              className="rounded-full border border-[rgba(120,95,75,0.16)] bg-[#fbf7f0] px-3 py-1 text-xs text-[#6b615a]"
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      <span className="mt-8 inline-flex items-center gap-1.5 font-label text-sm font-medium text-[#8a6f57]">
        {service.cta}
        <span
          aria-hidden
          className="material-symbols-outlined text-base leading-none transition-transform duration-300 group-hover:translate-x-1"
        >
          arrow_forward
        </span>
      </span>
    </article>
  );
}

function ServiceDetailDrawer({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  const titleId = useId();

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center sm:items-stretch sm:justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="Cerrar detalle"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(20,15,10,0.28)] backdrop-blur-[2px]"
      />
      <div className="relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-[#fffdf9] shadow-[0_30px_80px_-40px_rgba(40,30,20,0.6)] sm:h-full sm:max-h-none sm:w-[600px] sm:max-w-[92vw] sm:rounded-l-2xl sm:rounded-tr-none">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[rgba(120,95,75,0.12)] px-6 pb-5 pt-6 sm:px-12 sm:pt-10">
          <h3 id={titleId} className="font-headline text-2xl text-[#2c2420] sm:text-3xl">
            {service.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#6b615a] transition-colors hover:bg-[#f2ebe1]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-12 sm:py-8">
          <p className="text-[15px] leading-[1.7] text-[#6b615a]">{service.intro}</p>

          {service.groups.length > 0 && (
            <div className="mt-8 divide-y divide-[rgba(120,95,75,0.12)]">
              {service.groups.map((group) => (
                <div key={group.heading} className="py-6 first:pt-0">
                  <h4 className="mb-3 font-label text-xs uppercase tracking-[0.18em] text-[#8a6f57]">
                    {group.heading}
                  </h4>
                  <ul className="grid grid-cols-1 gap-x-8 gap-y-2 text-[15px] text-[#4a423c] sm:grid-cols-2">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span
                          aria-hidden
                          className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#8a6f57]/70"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[rgba(120,95,75,0.12)] px-6 py-5 sm:px-12 sm:py-6">
          <a
            href={BOOKING_HREF}
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-full bg-[#8a6f57] px-8 py-3.5 font-label text-sm font-medium text-white transition-colors hover:bg-[#755c47]"
          >
            Solicitar turno
          </a>
        </div>
      </div>
    </div>
  );
}

export function FeaturedSpecialtiesSection({ treatments: _treatments }: { treatments: unknown[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => SERVICES.find((service) => service.id === selectedId) ?? null,
    [selectedId],
  );

  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  return (
    <section className="bg-[#f7f2ea] px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32">
      <div className="mx-auto mb-14 max-w-[1200px] text-center sm:mb-16 md:mb-20">
        <span className="mb-4 block font-label text-xs uppercase tracking-[0.3em] text-[#8a6f57]">
          Nuestra experiencia
        </span>
        <h2 className="font-headline text-4xl text-[#2c2420] md:text-5xl">
          Especialidades destacadas
        </h2>
      </div>

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {SERVICES.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onOpen={() => setSelectedId(service.id)}
          />
        ))}
      </div>

      {selected && (
        <ServiceDetailDrawer service={selected} onClose={() => setSelectedId(null)} />
      )}
    </section>
  );
}
