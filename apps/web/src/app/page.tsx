import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HomeLanding } from "@/components/landing/home-landing";
import { ChatWidget } from "@/components/chat-widget";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";

const fallbackHome = {
  site: {
    "site.name": process.env.NEXT_PUBLIC_SITE_NAME || "Dermaclinic",
    "contact.address": "Av. Libertador 2450, Piso 8, CABA",
    "contact.phone": "+54 11 4821-0000",
    "contact.email": "info@dermaclinic.com",
    "contact.hours": "Lunes a viernes de 09:00 a 20:00",
    "legal.disclaimer":
      "La información es orientativa y no sustituye la evaluación médica presencial. Los resultados pueden variar.",
    "chatbot.welcomeMessage": "Hola, soy el asistente virtual. ¿En qué puedo orientarte?",
  },
  faqs: [] as { id: string; question: string; answer: string }[],
  testimonials: [] as { id: string; quote: string; author: string }[],
};

async function loadSite() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  try {
    const res = await fetch(`${base}/api/public/site`, { next: { revalidate: 60 } });
    if (!res.ok) return fallbackHome;
    return (await res.json()) as typeof fallbackHome & {
      site: Record<string, string>;
      faqs: { id: string; question: string; answer: string }[];
      testimonials: { id: string; quote: string; author: string }[];
    };
  } catch {
    return fallbackHome;
  }
}

export default async function Page() {
  const data = await loadSite();
  const site = data.site;
  const name = site["site.name"] ?? "Dermaclinic";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5491112345678";

  return (
    <>
      <SiteHeader siteName={name} />
      <HomeLanding site={site} faqs={data.faqs} testimonials={data.testimonials} />
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
