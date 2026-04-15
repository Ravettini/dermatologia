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
}> {
  const m = await getAllSettingsMap();
  return {
    systemPrompt:
      m.get("chatbot.systemPrompt") ??
      "Sos el asistente virtual de un centro de dermatología. Tono profesional y cercano. No diagnósticos ni medicación; ante dudas clínicas, consulta presencial. Respondé solo a lo que pregunte el usuario, sin párrafos de bienvenida innecesarios.",
    welcomeMessage:
      m.get("chatbot.welcomeMessage") ??
      "Hola, soy el asistente virtual del centro. ¿En qué puedo orientarte?",
    tone: m.get("chatbot.tone") ?? "profesional y cercano",
    humanHandoffHint:
      m.get("chatbot.humanHandoffHint") ??
      "Si preferís hablar con el equipo, podés escribirnos por WhatsApp.",
    fallbackMessage:
      m.get("chatbot.fallbackMessage") ??
      "En este momento no puedo completar la respuesta. Te recomiendo contactar al centro o reservar una consulta.",
  };
}
