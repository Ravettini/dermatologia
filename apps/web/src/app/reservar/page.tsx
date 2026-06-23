import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OnlineTurnosSection } from "@/components/landing/online-turnos-section";
import { ChatWidget } from "@/components/chat-widget";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";

async function loadSite() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const fallback = {
    site: {
      "site.name": process.env.NEXT_PUBLIC_SITE_NAME || "DERMATOLOGÍA TOD",
      "contact.address": "",
      "contact.email": "",
      "contact.phone": "",
      "chatbot.welcomeMessage": "Hola, ¿querés ayuda para reservar?",
    },
  };
  try {
    const res = await fetch(`${base}/api/public/site`, { next: { revalidate: 60 } });
    if (!res.ok) return fallback;
    return (await res.json()) as { site: Record<string, string> };
  } catch {
    return fallback;
  }
}

export default async function ReservarPage() {
  const data = await loadSite();
  const site = data.site;
  const name = site["site.name"] ?? "DERMATOLOGÍA TOD";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5491112345678";
  const phone = site["contact.phone"] ?? "+54 9 11 2699-2405";

  return (
    <>
      <SiteHeader siteName={name} />
      <div className="pt-28">
        <div className="px-6 pb-8 md:px-12">
          <Link href="/" className="text-sm text-secondary underline underline-offset-4">
            Volver al inicio
          </Link>
        </div>
        <OnlineTurnosSection anchor={false} phone={phone} />
      </div>
      <SiteFooter
        siteName={name}
        address={site["contact.address"] ?? ""}
        email={site["contact.email"] ?? ""}
        phone={site["contact.phone"] ?? ""}
      />
      <FloatingWhatsApp number={whatsapp} />
      <ChatWidget
        siteName={name}
        welcome={site["chatbot.welcomeMessage"] ?? "Hola, ¿querés ayuda para reservar?"}
        whatsappNumber={whatsapp}
        disclaimer={"legal.disclaimer" in site ? site["legal.disclaimer"] : undefined}
      />
    </>
  );
}
