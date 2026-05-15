import { prisma } from "./prisma";

const CACHE_TTL_MS = 60_000;
let cache: { at: number; map: Map<string, string> } | null = null;

export async function getSetting(key: string): Promise<string | null> {
  const map = await getAllSettingsMap();
  return map.get(key) ?? null;
}

export async function getAllSettingsMap(): Promise<Map<string, string>> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.map;
  }
  const rows = await prisma.siteSetting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  cache = { at: Date.now(), map };
  return map;
}

export function invalidateSettingsCache(): void {
  cache = null;
}

export async function getChatbotConfig(): Promise<{
  systemPrompt: string;
  welcomeMessage: string;
  tone: string;
  humanHandoffHint: string;
  fallbackMessage: string;
  /** URL pública de agenda (Bekandu u otra). Se inyecta en instrucciones del modelo. */
  turnosOnlineUrl: string;
}> {
  const m = await getAllSettingsMap();
  const turnosOnlineUrl =
    (m.get("contact.turnosOnlineUrl") ?? "").trim() ||
    (process.env.TURNOS_ONLINE_URL ?? "").trim() ||
    "https://tod.bekandu.com/turnos_online";

  return {
    systemPrompt:
      m.get("chatbot.systemPrompt") ??
      [
        "Sos el asistente virtual de un centro de dermatología.",
        "Tono profesional y cercano. No diagnósticos ni medicación; ante dudas clínicas, consulta presencial.",
        "Orientá sobre servicios, ubicación, horarios y turnos.",
        "Para reservar orientá siempre la agenda en línea (Bekandu); la URL exacta llega aparte en las instrucciones. No pidas en el chat listas obligatorias de datos personales ni menciones botones internos.",
        "Respondé solo a lo que pregunte el usuario, sin párrafos largos de bienvenida.",
      ].join(" "),
    welcomeMessage:
      m.get("chatbot.welcomeMessage") ??
      "Hola, soy el asistente virtual del centro. ¿En qué puedo orientarte?",
    tone: m.get("chatbot.tone") ?? "profesional y cercano",
    humanHandoffHint:
      m.get("chatbot.humanHandoffHint") ??
      "Si preferís que responda el equipo humano: WhatsApp o la sección de contacto del sitio.",
    fallbackMessage:
      m.get("chatbot.fallbackMessage") ??
      "En este momento no puedo responderte bien. Probá más tarde o gestioná el turno por la agenda online del centro o WhatsApp.",
    turnosOnlineUrl,
  };
}
