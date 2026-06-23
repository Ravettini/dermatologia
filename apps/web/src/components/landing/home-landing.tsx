import Image from "next/image";
import Link from "next/link";
import { FeaturedSpecialtiesSection } from "@/components/landing/featured-specialties-section";
import { FaqSection } from "@/components/landing/faq-section";
import { OnlineTurnosPanel } from "@/components/landing/online-turnos-section";
import { SociasSection } from "@/components/landing/socias-section";
import { TeamSection } from "@/components/landing/team-section";
import { TreatmentsSection } from "@/components/landing/treatments-section";

type FAQ = { id: string; question: string; answer: string };
type Testimonial = { id: string; quote: string; author: string };
type PublicProfessional = {
  id: string;
  name: string;
  specialty: string;
  bio: string | null;
  imageUrl: string | null;
};
type PublicTreatment = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  category: string;
  requiresPriorEval: boolean;
};

/** IDs de seed / admin alineados con las médicas socias (orden de aparición en la página). */
const SOCIO_IDS = ["seed-tod-tezanos", "seed-tod-olguin", "seed-tod-deane"] as const;

/** Textos fijos para las socias: pisan lo que venga de la base/API. */
const SOCIO_SPECIALTY_OVERRIDES: Record<string, string> = {
  "seed-tod-tezanos": "Medicina estética",
  "seed-tod-olguin": "Medicina estética",
  "seed-tod-deane": "Medicina estética",
};

const SOCIO_SUBTITLE_OVERRIDES: Record<string, string> = {
  "seed-tod-tezanos": "Posgrado en medicina estética y reparadora",
};

const SOCIO_BIO_OVERRIDES: Record<string, string> = {
  "seed-tod-tezanos": [
    "Médica dermatóloga especialista en medicina estética.",
    "International speaker.",
    "Faculty AMWC.",
    "Faculty Allergan Aesthetics.",
    "Miembro Sociedad AAD – SAD.",
  ].join("\n"),
  "seed-tod-olguin": [
    "Médica dermatóloga especialista en medicina estética y dermatoscopia.",
    "Speaker trainer Merz.",
    "Miembro Sociedad AAD – SAD.",
    "Universidad de Buenos Aires.",
  ].join("\n"),
  "seed-tod-deane": [
    "Médica dermatóloga",
    "Posgrado en Medicina Estética",
    "Diplomado en Medicina Funcional y Longevidad",
    "",
    "Speaker & Trainer | Merz · Allergan",
    "Miembro AAD – SAD",
  ].join("\n"),
};

/** Miembros del equipo definidos en front (por si aún no están en la base). */
const EXTRA_TEAM_MEMBERS: PublicProfessional[] = [
  {
    id: "seed-tod-caride",
    name: "Manuela Caride",
    specialty: "Medicina funcional",
    bio: null,
    imageUrl: null,
  },
];

/** Fotos y textos fijos del equipo (pisan lo que venga de la base/API). */
const TEAM_IMAGE_OVERRIDES: Record<string, string> = {
  "seed-tod-pardo": "/fotos/equipo/natalia-pardo.jpeg",
  "seed-tod-kahn": "/fotos/equipo/kahn-felicitas.jpeg",
  "seed-tod-toninetti": "/fotos/equipo/josefina-toninetti.jpeg",
  "seed-tod-reggiani": "/fotos/equipo/valentina-reggiani.jpeg",
  "seed-tod-ortiz": "/fotos/equipo/cintia-ortiz.jpeg",
};

const TEAM_SPECIALTY_OVERRIDES: Record<string, string> = {
  "seed-tod-reggiani": "Médica dermatóloga y clínica",
};

const TEAM_BIO_OVERRIDES: Record<string, string> = {
  "seed-tod-reggiani": "Médica dermatóloga y clínica.",
};

const DEFAULT_MAP_NAME = "Dermatología TOD";
const DEFAULT_MAP_COORDS = "-34.4853853304583,-58.594249209497896";
const DEFAULT_MAP_EMBED_ZOOM = "18";

function buildMapEmbedUrl(query: string, coords = DEFAULT_MAP_COORDS): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&ll=${coords}&z=${DEFAULT_MAP_EMBED_ZOOM}&output=embed`;
}

const FALLBACK_MAP_EMBED_URL = buildMapEmbedUrl(DEFAULT_MAP_NAME);

function resolveMapEmbedSrc(rawValue: string): string {
  const v = rawValue.trim();
  if (!v) return FALLBACK_MAP_EMBED_URL;

  // Compatibilidad: si venía una imagen vieja en este campo, usamos fallback real de Maps.
  if (/googleusercontent|\.png$|\.jpe?g$|\.webp$|\.gif$/i.test(v)) {
    return FALLBACK_MAP_EMBED_URL;
  }

  if (/google\.[^/]+\/maps\/embed/i.test(v) || /output=embed/i.test(v)) {
    // Compatibilidad con fallback viejo: centro de CABA.
    if (/-34\.6037345,-58\.3815704/.test(v)) return FALLBACK_MAP_EMBED_URL;
    return v;
  }

  if (/^https?:\/\//i.test(v) && /google\.[^/]+\/maps/i.test(v)) {
    try {
      const u = new URL(v);
      const q = u.searchParams.get("q") || u.searchParams.get("query");
      if (q) return buildMapEmbedUrl(q);
    } catch {
      return FALLBACK_MAP_EMBED_URL;
    }
  }

  // Si pasan solo coordenadas, priorizamos el lugar real (Dermatología TOD) y centramos en esas coords.
  if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(v)) {
    return buildMapEmbedUrl(DEFAULT_MAP_NAME, v.replace(/\s+/g, ""));
  }

  // Si pasan un texto cualquiera, lo buscamos pero centrando en la ubicación real de TOD.
  return buildMapEmbedUrl(v);
}

export function HomeLanding({
  site,
  faqs,
  testimonials,
  professionals,
  treatments,
}: {
  site: Record<string, string>;
  faqs: FAQ[];
  testimonials: Testimonial[];
  professionals: PublicProfessional[];
  treatments: PublicTreatment[];
}) {
  const brand = site["site.name"] ?? "DERMATOLOGÍA TOD";
  const tagline = site["site.tagline"] ?? "Dermatología clínica y estética";
  const address = site["contact.address"] ?? "Camino Boulogne Bancalari 3350, Victoria";
  const phone = site["contact.phone"] ?? "+54 9 11 2699-2405";
  const email = site["contact.email"] ?? "Dermatologiatod@gmail.com";
  const hours = site["contact.hours"] ?? "Lunes a viernes de 9 a 19 hs.";
  const mapEmbedSrc = resolveMapEmbedSrc(site["contact.mapImageUrl"] ?? "");
  const mergedProfessionals = (() => {
    const ids = new Set(professionals.map((p) => p.id));
    const extras = EXTRA_TEAM_MEMBERS.filter((e) => !ids.has(e.id));
    return extras.length > 0 ? [...professionals, ...extras] : professionals;
  })();
  const byId = new Map(mergedProfessionals.map((p) => [p.id, p] as const));
  const socias = SOCIO_IDS.map((id) => byId.get(id))
    .filter((p): p is PublicProfessional => p != null)
    .map((p) => ({
      ...p,
      specialty: SOCIO_SPECIALTY_OVERRIDES[p.id] ?? p.specialty,
      subtitle: SOCIO_SUBTITLE_OVERRIDES[p.id] ?? null,
      bio: SOCIO_BIO_OVERRIDES[p.id] ?? p.bio,
    }));
  const sociasIdSet = new Set<string>(SOCIO_IDS as unknown as string[]);
  const teamProfessionals = mergedProfessionals
    .filter((p) => !sociasIdSet.has(p.id))
    .map((p) => ({
      ...p,
      imageUrl: TEAM_IMAGE_OVERRIDES[p.id] ?? p.imageUrl,
      specialty: TEAM_SPECIALTY_OVERRIDES[p.id] ?? p.specialty,
      bio: TEAM_BIO_OVERRIDES[p.id] ?? p.bio,
    }));

  return (
    <main className="w-full min-w-0 max-w-[100vw] overflow-x-hidden">
      <section
        className="hero w-full max-w-[100vw] px-4 max-md:min-h-[100dvh] max-md:pb-8 max-md:pt-[calc(5.5rem+env(safe-area-inset-top,0px))] sm:px-6 md:px-10 xl:px-12"
        id="inicio"
      >
        <div className="hero-bg hero-bg--desktop" aria-hidden="true" />
        <div className="hero-bg hero-bg--mobile" aria-hidden="true" />
        <div className="hero-content flex w-full flex-col max-md:min-h-0 max-md:w-full max-md:justify-center">
          <div className="w-full max-w-[min(100%,44rem)] max-md:max-w-full sm:max-w-[min(100%,44rem)]">
            <span className="mb-4 block font-label text-[13.2px] uppercase tracking-[0.28em] text-secondary max-md:mb-3 sm:mb-5 sm:text-[15.4px] sm:tracking-[0.3em]">
              {tagline}
            </span>
            <h1 className="mb-5 font-headline text-[clamp(2.48rem,7.15vw,3.58rem)] leading-[1.1] text-on-surface max-md:mb-3 sm:mb-6 sm:text-[4.125rem] md:text-[4.95rem] lg:mb-4 lg:text-[clamp(2.75rem,4.18vw,4.4rem)] xl:text-[clamp(3rem,4.4vw,4.95rem)] 2xl:text-[4.125rem]">
              {brand}
              <span className="mt-3 block text-[0.38em] font-normal leading-snug tracking-normal text-on-surface-variant sm:mt-4">
                Centro de dermatología clínica y estética en Victoria
              </span>
            </h1>
            <p className="hero-lead mb-8 font-headline text-[1.375rem] font-normal leading-snug text-on-surface max-md:mb-6 max-md:text-[1.235rem] sm:mb-9 sm:text-[1.65rem] md:text-[2.06rem]">
              Cada tratamiento es pensado y realizado por médicas dermatólogas expertas en estética, combinando
              ciencia, criterio clínico y una mirada estética natural y equilibrada.
            </p>
            <div className="hero-actions flex flex-wrap gap-3 max-md:w-full max-md:flex-col sm:gap-6">
              <Link
                href="/#reservar"
                className="bg-on-primary-container px-6 py-3 text-center font-label text-xs uppercase tracking-widest text-surface transition-all hover:opacity-90 max-md:w-full sm:px-8 sm:py-4 sm:text-sm"
              >
                Solicitar turno
              </Link>
              <Link
                href="/#tratamientos"
                className="border border-white/70 bg-white/10 px-6 py-3 text-center font-label text-xs uppercase tracking-widest text-white backdrop-blur-[2px] transition-all hover:bg-white/20 max-md:w-full sm:px-8 sm:py-4 sm:text-sm"
              >
                Ver tratamientos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SociasSection members={socias} />

      <TeamSection professionals={teamProfessionals} />

      <TreatmentsSection treatments={treatments} />

      <FeaturedSpecialtiesSection treatments={treatments} />

      <section
        className="bg-surface px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32"
        id="objetivos"
        aria-labelledby="objetivos-heading"
      >
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-10 text-center sm:mb-14">
            <span className="mb-3 block font-label text-xs uppercase tracking-[0.3em] text-secondary">
              Qué tratamos
            </span>
            <h2 id="objetivos-heading" className="font-headline text-3xl text-on-surface md:text-4xl lg:text-5xl">
              Objetivos estéticos y clínicos
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {[
              {
                icon: "healing",
                t: "Acné",
                p: "Control del acné activo y sus secuelas: limpieza de cutis, peelings y protocolos médicos personalizados.",
              },
              {
                icon: "blur_on",
                t: "Rosácea",
                p: "Luz pulsada, Skin Quality (Botox) y skin booster, según evaluación médica.",
              },
              {
                icon: "gradient",
                t: "Melasma",
                p: "Mesoterapia combinada con peeling para unificar y emparejar el tono de la piel.",
              },
              {
                icon: "trending_up",
                t: "Flacidez",
                p: "Radiesse, Sculptra, Ultherapy y otros protocolos para tensar y mejorar la firmeza.",
              },
              {
                icon: "face_retouching_natural",
                t: "Papada",
                p: "Ultherapy y enzimas biológicas para definir el contorno del cuello y el mentón.",
              },
              {
                icon: "content_cut",
                t: "Alopecia / pérdida de cabello",
                p: "Mesoterapia capilar y exosomas, con diagnóstico y seguimiento personalizado.",
              },
              {
                icon: "stethoscope",
                t: "Dermatología clínica",
                p: "Diagnóstico y tratamiento de las enfermedades de la piel, el pelo y las uñas.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="flex flex-col gap-3 border border-outline-variant/40 bg-surface-container-lowest p-6 transition-colors hover:bg-surface-container-low sm:p-8"
              >
                <span className="material-symbols-outlined text-3xl text-secondary">{x.icon}</span>
                <p className="font-headline text-xl text-on-surface">{x.t}</p>
                <p className="text-sm leading-relaxed text-on-surface-variant">{x.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="bg-surface-container px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32"
        aria-label="Nuestra propuesta de valor"
      >
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-12 md:grid-cols-3 md:gap-16 lg:gap-20">
          {[
            {
              n: "01.",
              t: "Profesionales de la salud",
              p: "Médicos especialistas dedicados a dermatología clínica, estética responsable y medicina funcional.",
            },
            {
              n: "02.",
              t: "Atención personalizada",
              p: "Cada piel es única. Planes a medida según objetivos y necesidades.",
            },
            {
              n: "03.",
              t: "Tecnología especializada",
              p: "Equipamiento con estándares de seguridad y seguimiento cercano.",
            },
          ].map((x) => (
            <div key={x.n} className="flex flex-col gap-6">
              <span className="font-headline text-5xl text-secondary">{x.n}</span>
              <p className="font-headline text-2xl text-secondary">{x.t}</p>
              <p className="font-body leading-relaxed text-on-surface-variant">{x.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="bg-surface px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32"
        id="consultorio"
        aria-labelledby="consultorio-heading"
      >
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-10 sm:mb-14">
            <span className="mb-3 block font-label text-xs uppercase tracking-[0.3em] text-secondary">El espacio</span>
            <h2 id="consultorio-heading" className="font-headline text-3xl text-on-surface md:text-4xl lg:text-5xl">
              Nuestro consultorio
            </h2>
            <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-on-surface-variant md:text-base">
              Más que un consultorio: un espacio que combina tecnología de vanguardia, atención de excelencia y un
              cuidado personalizado para tu piel.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-12 md:auto-rows-[minmax(200px,1fr)] md:gap-5">
            {[
              {
                src: "/fotos/consultorio/socias.jpg",
                alt: "Las tres socias de Dermatología TOD en el consultorio",
                className:
                  "col-span-2 aspect-[3/2] md:col-span-7 md:row-span-2 md:aspect-auto md:min-h-[420px]",
                sizes: "(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 920px",
                quality: 90,
                priority: true,
              },
              {
                src: "/fotos/consultorio/consultorio-1.jpg",
                alt: "Recepción del consultorio Dermatología TOD",
                className: "aspect-[3/2] md:col-span-5 md:aspect-auto",
                sizes: "(max-width: 768px) 50vw, 42vw",
              },
              {
                src: "/fotos/consultorio/consultorio-4.jpg",
                alt: "Detalle del espacio de atención",
                className: "aspect-[3/2] md:col-span-5 md:aspect-auto",
                sizes: "(max-width: 768px) 50vw, 42vw",
              },
              {
                src: "/fotos/consultorio/consultorio-5.jpg",
                alt: "Ambiente del consultorio dermatológico",
                className: "aspect-[3/2] md:col-span-6 md:aspect-auto",
                sizes: "(max-width: 768px) 50vw, 50vw",
              },
              {
                src: "/fotos/consultorio/consultorio-6.jpg",
                alt: "Consultorio Dermatología TOD",
                className: "aspect-[3/2] md:col-span-6 md:aspect-auto",
                sizes: "(max-width: 768px) 50vw, 50vw",
              },
            ].map((photo) => (
              <div
                key={photo.src}
                className={`group relative overflow-hidden bg-surface-container-high ${photo.className}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  sizes={photo.sizes}
                  quality={"quality" in photo ? photo.quality : 80}
                  priority={"priority" in photo ? photo.priority : false}
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-on-surface/5" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid h-auto grid-cols-1 bg-tertiary-fixed md:grid-cols-2 md:h-[600px]">
        <div className="flex flex-col justify-center px-4 py-12 sm:px-10 sm:py-16 md:px-16 lg:px-24">
          <h2 className="mb-8 font-headline text-4xl md:text-5xl">Evolucioná el cuidado de tu piel.</h2>
          <Link
            href="/#reservar"
            className="w-fit bg-on-primary-container px-12 py-5 font-label text-sm uppercase tracking-widest text-surface transition-colors hover:bg-on-surface"
          >
            Agendar consulta
          </Link>
        </div>
        <div className="relative hidden min-h-[320px] md:block">
          <Image
            src="/fotos/foto-de-abajo.jpg"
            alt="Atención clínica"
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
      </section>

      <section className="bg-on-primary-container px-4 py-16 text-surface sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-12 md:grid-cols-3 md:gap-16">
          {testimonials.map((t) => (
            <div key={t.id} className="flex h-full flex-col justify-between">
              <span className="material-symbols-outlined text-4xl text-secondary">format_quote</span>
              <p className="my-8 font-headline text-2xl italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <span className="font-label text-xs uppercase tracking-widest opacity-60">— {t.author}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32" id="faq">
        <FaqSection faqs={faqs} />
      </section>

      <section
        className="border-t border-outline-variant/25 bg-surface px-4 py-14 sm:px-6 sm:py-16 md:px-10 md:py-20 lg:px-12 lg:py-24"
        id="contacto"
        aria-labelledby="contacto-heading"
      >
        <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-2 lg:items-start lg:gap-16 xl:gap-24">
          <div className="min-w-0">
            <span className="mb-3 block font-label text-[11px] uppercase tracking-[0.32em] text-on-surface-variant md:text-xs">
              Consultas
            </span>
            <h2 id="contacto-heading" className="font-headline text-3xl text-on-surface md:text-4xl">
              Contacto y ubicación
            </h2>
            <p className="mt-5 max-w-md font-body text-sm leading-relaxed text-on-surface-variant md:text-base">
              Dirección, horarios y cómo ubicarnos. En este mismo espacio encontrás también la agenda para solicitar tu
              turno.
            </p>

            <ul className="mt-10 space-y-5">
              <li className="flex gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-low p-5 shadow-sm">
                <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-secondary md:text-2xl">
                  location_on
                </span>
                <div className="min-w-0">
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant md:text-xs">
                    Ubicación
                  </p>
                  <p className="mt-1.5 font-body text-sm leading-snug text-on-surface md:text-[0.9375rem]">{address}</p>
                </div>
              </li>
              <li className="flex gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-low p-5 shadow-sm">
                <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-secondary md:text-2xl">phone</span>
                <div className="min-w-0">
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant md:text-xs">
                    WhatsApp / Teléfono
                  </p>
                  <p className="mt-1.5 font-body text-sm leading-snug text-on-surface md:text-[0.9375rem]">{phone}</p>
                </div>
              </li>
              <li className="flex gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-low p-5 shadow-sm">
                <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-secondary md:text-2xl">mail</span>
                <div className="min-w-0">
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant md:text-xs">Correo</p>
                  <a
                    className="mt-1.5 inline-block break-words font-body text-sm text-secondary underline decoration-secondary/30 underline-offset-4 md:text-[0.9375rem]"
                    href={`mailto:${email}`}
                  >
                    {email}
                  </a>
                </div>
              </li>
              <li className="flex gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-low p-5 shadow-sm">
                <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-secondary md:text-2xl">
                  schedule
                </span>
                <div className="min-w-0">
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant md:text-xs">Horarios</p>
                  <p className="mt-1.5 font-body text-sm leading-snug text-on-surface md:text-[0.9375rem]">{hours}</p>
                </div>
              </li>
            </ul>
          </div>

          <div
            id="reservar"
            className="min-w-0 scroll-mt-[calc(5rem+env(safe-area-inset-top,0px))] border-t border-outline-variant/25 pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-1 xl:pl-16"
          >
            <OnlineTurnosPanel phone={phone} variant="column" />
          </div>
        </div>
      </section>

      <section className="h-[280px] w-full overflow-hidden bg-surface-container sm:h-[340px] md:h-[400px]" id="mapa">
        <iframe
          title="Mapa de ubicación"
          src={mapEmbedSrc}
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </section>

      <section className="bg-surface px-4 py-16 text-center sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32">
        <h2 className="mb-8 font-headline text-3xl sm:mb-10 sm:text-4xl md:text-5xl lg:text-6xl">
          Cuidá tu piel. Solicitá tu turno.
        </h2>
        <Link
          href="/#reservar"
          className="inline-block max-w-[calc(100vw-2rem)] bg-on-primary-container px-8 py-5 font-label text-xs uppercase tracking-widest text-surface transition-colors hover:bg-on-surface sm:px-12 sm:py-6 sm:text-sm md:px-16"
        >
          Agendar ahora
        </Link>
      </section>
    </main>
  );
}
