/** Normaliza el texto del usuario para detectar intenciones sin depender de la IA. */
export function normalizeMessageForIntent(message: string): string {
  return message
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Frases compuestas (se buscan tal cual en el texto normalizado). */
const TURNO_BOOKING_PHRASES = [
  "primera consulta",
  "turnos online",
  "turno online",
  "turnos en linea",
  "turno en linea",
  "sacar turno",
  "sacarme turno",
  "pedir turno",
  "pedirme turno",
  "solicitar turno",
  "solicito turno",
  "reservar turno",
  "reservo turno",
  "agendar turno",
  "agendo turno",
  "quiero turno",
  "necesito turno",
  "busco turno",
  "coordinar turno",
  "como saco turno",
  "como pido turno",
  "como reservo",
  "como agendo",
  "donde saco turno",
  "donde pido turno",
  "donde reservo",
  "donde agendo",
  "para sacar turno",
  "para pedir turno",
  "para reservar",
];

/**
 * Palabras sueltas: si aparecen en el mensaje (como palabra completa), es intención de turno.
 * Ej.: "turno", "TURNO", "hola necesito un turno", "tienen turnos?", "reservar", "cita".
 */
const TURNO_BOOKING_WORDS = [
  "turno",
  "turnos",
  "reservar",
  "reserva",
  "reservo",
  "reservas",
  "cita",
  "citas",
  "agendar",
  "agenda",
  "agendo",
  "bekandu",
];

function containsWholeWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

export function isTurnoBookingIntent(message: string): boolean {
  const text = normalizeMessageForIntent(message);
  if (!text) return false;

  if (TURNO_BOOKING_PHRASES.some((phrase) => text.includes(phrase))) {
    return true;
  }

  if (TURNO_BOOKING_WORDS.some((word) => containsWholeWord(text, word))) {
    return true;
  }

  return false;
}

export function buildTurnoBookingReply(turnosOnlineUrl: string): string {
  return `Podés solicitar tu turno a través de nuestra agenda en línea: ${turnosOnlineUrl}`;
}

/** Saludo suelto, sin pedido concreto: respuesta mínima sin “ofrecer” nada ni segunda pregunta. */
export function bareGreetingReply(userMessage: string): string | null {
  const t = normalizeMessageForIntent(userMessage).replace(/[!?.]+$/g, "").trim();
  if (t.length === 0 || t.length > 40) return null;
  if (/^(hola|hey|buen[oa]s|buenos dias|buenas tardes|buenas noches)$/.test(t)) {
    return "Hola.";
  }
  return null;
}
