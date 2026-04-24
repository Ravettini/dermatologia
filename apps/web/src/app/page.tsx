import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HomeLanding } from "@/components/landing/home-landing";
import { ChatWidget } from "@/components/chat-widget";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";

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

const REAL_TESTIMONIALS: { id: string; quote: string; author: string }[] = [
  {
    id: "real-jorgelina-acosta",
    quote:
      "Excelente experiencia en Dermatología TOD. Me atendí con la especialista Cintia, y la verdad que su atención fue impecable. Es muy profesional, dedicada y te explica cada paso del tratamiento con mucha claridad. Me sentí muy cómoda y en buenas manos desde el primer momento. Sin dudas volvería y lo recomiendo al 100%.",
    author: "Jorgelina Acosta",
  },
  {
    id: "real-emma-polini",
    quote:
      "La verdad que me atendieron genial. El nuevo consultorio es espectacular. La Dra. Olguín me dio un tratamiento para el acné que la verdad me cambió la vida. Súper recomendable.",
    author: "Emma Polini",
  },
  {
    id: "real-sofia-maqueda",
    quote:
      "Es un placer ir a TOD, desde llegar a un lugar impecable, la atención desde que entrás hasta que salís. El nivle de profesionalismo de es impresionante. Confianza ciega en todos los tratamientos que proponen!",
    author: "Sofia Maqueda",
  },
];

const fallbackHome = {
  site: {
    "site.name": process.env.NEXT_PUBLIC_SITE_NAME || "DERMATOLOGÍA TOD",
    "site.tagline": "Dermatología clínica y estética",
    "contact.address": "Camino Boulogne Bancalari 3350, Victoria",
    "contact.phone": "+54 9 11 2699-2405",
    "contact.whatsapp": "5491126992405",
    "contact.email": "Dermatologiatod@gmail.com",
    "contact.hours": "Lunes a viernes de 9 a 19 hs.",
    "contact.mapImageUrl": "Camino Boulogne Bancalari 3350, Victoria, Argentina",
    "legal.disclaimer":
      "La información es orientativa y no sustituye la evaluación médica presencial. Los resultados pueden variar.",
    "chatbot.welcomeMessage": "Hola, soy el asistente virtual. ¿En qué puedo orientarte?",
  },
  faqs: [] as { id: string; question: string; answer: string }[],
  testimonials: [] as { id: string; quote: string; author: string }[],
  professionals: [] as PublicProfessional[],
  treatments: [] as PublicTreatment[],
};

const siteFetchInit =
  process.env.NODE_ENV === "development"
    ? ({ cache: "no-store" } as const)
    : ({ next: { revalidate: 60 } } as const);

async function loadSite() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  try {
    const [siteRes, proRes, treatmentsRes] = await Promise.all([
      fetch(`${base}/api/public/site`, siteFetchInit),
      fetch(`${base}/api/public/professionals`, siteFetchInit),
      fetch(`${base}/api/public/treatments`, siteFetchInit),
    ]);
    if (!siteRes.ok) return fallbackHome;
    const siteJson = (await siteRes.json()) as Omit<typeof fallbackHome, "professionals" | "treatments"> & {
      site: Record<string, string>;
      faqs?: { id: string; question: string; answer: string }[];
      testimonials?: { id: string; quote: string; author: string }[];
    };
    let professionals: PublicProfessional[] = [];
    let treatments: PublicTreatment[] = [];
    if (proRes.ok) {
      const p = (await proRes.json()) as { professionals?: PublicProfessional[] };
      professionals = p.professionals ?? [];
    }
    if (treatmentsRes.ok) {
      const t = (await treatmentsRes.json()) as { treatments?: PublicTreatment[] };
      treatments = t.treatments ?? [];
    }
    return {
      site: siteJson.site ?? fallbackHome.site,
      faqs: siteJson.faqs ?? [],
      testimonials: siteJson.testimonials ?? [],
      professionals,
      treatments,
    };
  } catch {
    return fallbackHome;
  }
}

export default async function Page() {
  const data = await loadSite();
  const site = data.site;
  const name = site["site.name"] ?? "DERMATOLOGÍA TOD";
  const whatsapp =
    site["contact.whatsapp"]?.replace(/\D/g, "") ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    "5491126992405";

  return (
    <>
      <SiteHeader siteName={name} />
      <HomeLanding
        site={site}
        faqs={data.faqs}
        testimonials={REAL_TESTIMONIALS}
        professionals={data.professionals}
        treatments={data.treatments}
      />
      <SiteFooter
        siteName={name}
        address={site["contact.address"] ?? ""}
        email={site["contact.email"] ?? ""}
        phone={site["contact.phone"] ?? ""}
      />
      <FloatingWhatsApp number={whatsapp} />
      <ChatWidget siteName={name} welcome={site["chatbot.welcomeMessage"] ?? "Hola, ¿en qué te ayudo?"} whatsappNumber={whatsapp} />
    </>
  );
}
