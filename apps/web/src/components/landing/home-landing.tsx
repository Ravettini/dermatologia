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
const SOCIO_IDS = ["seed-tod-deane", "seed-tod-olguin", "seed-tod-tezanos"] as const;

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
  const disclaimer = site["legal.disclaimer"] ?? "";

  const byId = new Map(professionals.map((p) => [p.id, p] as const));
  const socias = SOCIO_IDS.map((id) => byId.get(id)).filter(
    (p): p is PublicProfessional => p != null,
  );
  const sociasIdSet = new Set<string>(SOCIO_IDS as unknown as string[]);
  const teamProfessionals = professionals.filter((p) => !sociasIdSet.has(p.id));

  return (
    <main className="w-full min-w-0 max-w-[100vw] overflow-x-hidden">
      <section
        className="relative flex w-full max-w-[100vw] flex-col overflow-hidden bg-surface px-4 pb-0 pt-[calc(7.25rem+env(safe-area-inset-top,0px))] sm:px-6 sm:pt-28 md:px-10 md:pt-32 lg:min-h-[90svh] lg:pt-24 lg:pb-0 xl:px-12"
        id="inicio"
      >
        <div className="mx-auto grid min-h-0 w-full max-w-[1600px] grid-cols-1 gap-8 sm:gap-10 md:gap-12 lg:min-h-[calc(90svh-6rem)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-stretch lg:gap-0">
          <div className="flex min-h-0 min-w-0 max-w-2xl flex-col justify-center pb-8 sm:pb-10 lg:pb-16 lg:pr-8 xl:pr-12">
            <span className="mb-4 block font-label text-[10px] uppercase tracking-[0.28em] text-secondary sm:mb-5 sm:text-xs sm:tracking-[0.3em]">
              {tagline}
            </span>
            <h1 className="mb-5 font-headline text-[clamp(1.85rem,5.5vw,2.75rem)] leading-[1.12] text-on-surface sm:mb-6 sm:text-5xl md:text-6xl lg:mb-4 lg:text-[clamp(1.75rem,2.75vw,2.85rem)] xl:text-[clamp(2rem,3vw,3.25rem)] 2xl:text-5xl">
              {brand}
            </h1>
            <p className="mb-3 font-headline text-lg font-normal leading-snug text-on-surface sm:text-xl md:text-2xl">
              Dermatología clínica y estética con una mirada profesional y personalizada
            </p>
            <p className="mb-8 font-body text-base leading-relaxed text-on-surface-variant opacity-80 sm:mb-9 sm:text-lg md:text-xl lg:mb-6 lg:max-w-xl lg:text-[clamp(0.95rem,1.25vw,1.1rem)] xl:text-lg">
              Tratamientos pensados para cuidar, mejorar y acompañar la salud y belleza de tu piel, combinando
              evidencia científica con una estética natural y equilibrada.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <Link
                href="/#reservar"
                className="bg-on-primary-container px-6 py-3 font-label text-xs uppercase tracking-widest text-surface transition-all hover:opacity-90 sm:px-8 sm:py-4 sm:text-sm"
              >
                Solicitar turno
              </Link>
              <Link
                href="/#tratamientos"
                className="border border-outline-variant px-6 py-3 font-label text-xs uppercase tracking-widest text-secondary transition-all hover:bg-surface-container-low sm:px-8 sm:py-4 sm:text-sm"
              >
                Ver tratamientos
              </Link>
            </div>
            {disclaimer && (
              <p className="mt-6 max-w-xl text-[11px] leading-relaxed text-on-surface-variant sm:mt-8 sm:text-xs lg:mt-5">
                {disclaimer}
              </p>
            )}
          </div>
          <div className="relative min-h-[380px] w-full overflow-hidden sm:min-h-[500px] lg:min-h-0 lg:h-full">
            <div className="absolute inset-0">
              <Image
                src="/branding/imagen-hero.png"
                alt="Retrato editorial con piel luminosa y luz suave"
                fill
                className="object-contain object-right-bottom"
                sizes="(max-width: 1024px) 100vw, 52vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <TreatmentsSection treatments={treatments} />

      <section
        className="overflow-hidden bg-surface-container-lowest px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32"
        id="dermatologia"
      >
        <div className="mx-auto mb-16 max-w-4xl sm:mb-20 md:mb-24">
          <h2 className="font-headline text-3xl italic leading-tight text-secondary sm:text-4xl md:text-5xl lg:text-6xl">
            La excelencia médica se encuentra con el arte del cuidado.
          </h2>
        </div>
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          {[
            "/fotos/foto1.jpeg",
            "/fotos/foto2.jpeg",
            "/fotos/foto3.jpeg",
            "/fotos/foto4.jpeg",
          ].map((src, i) => (
            <div key={src} className={`aspect-[3/4] ${i % 2 === 0 ? "md:translate-y-12" : ""} ${i === 2 ? "md:translate-y-24" : ""} ${i === 3 ? "md:translate-y-6" : ""}`}>
              <div className="relative h-full w-full">
                <Image src={src} alt="" fill className="object-cover" sizes="25vw" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-container px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-28 lg:px-12 lg:py-32">
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
              <h4 className="font-headline text-2xl text-secondary">{x.t}</h4>
              <p className="font-body leading-relaxed text-on-surface-variant">{x.p}</p>
            </div>
          ))}
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

      <FeaturedSpecialtiesSection treatments={treatments} />

      <SociasSection members={socias} />

      <TeamSection professionals={teamProfessionals} />

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
                  <h6 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant md:text-xs">
                    Ubicación
                  </h6>
                  <p className="mt-1.5 font-body text-sm leading-snug text-on-surface md:text-[0.9375rem]">{address}</p>
                </div>
              </li>
              <li className="flex gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-low p-5 shadow-sm">
                <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-secondary md:text-2xl">phone</span>
                <div className="min-w-0">
                  <h6 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant md:text-xs">
                    WhatsApp / Teléfono
                  </h6>
                  <p className="mt-1.5 font-body text-sm leading-snug text-on-surface md:text-[0.9375rem]">{phone}</p>
                </div>
              </li>
              <li className="flex gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-low p-5 shadow-sm">
                <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-secondary md:text-2xl">mail</span>
                <div className="min-w-0">
                  <h6 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant md:text-xs">Correo</h6>
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
                  <h6 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant md:text-xs">Horarios</h6>
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
