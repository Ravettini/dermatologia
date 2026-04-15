import { generateWithGoogleGenAI } from "./provider";
import { sanitizeChatModelOutput } from "./chat-reply-sanitize";
import { getChatbotConfig } from "../settings";

/** Saludo suelto, sin pedido concreto: respuesta mínima sin “ofrecer” nada ni segunda pregunta. */
function bareGreetingReply(userMessage: string): string | null {
  const t = userMessage
    .trim()
    .toLowerCase()
    .replace(/[!?.¿¡,;:]+$/g, "")
    .trim();
  if (t.length === 0 || t.length > 40) return null;
  if (/^(hola|hey|buen[oa]s|buenos días|buenas tardes|buenas noches)$/.test(t)) {
    return "Hola.";
  }
  return null;
}

export async function runChatCompletion(params: {
  history: { role: "user" | "model"; text: string }[];
  userMessage: string;
}): Promise<string> {
  const cfg = await getChatbotConfig();
  const provider = process.env.AI_PROVIDER || "google";

  const staticGreeting = bareGreetingReply(params.userMessage);
  if (staticGreeting && (provider === "google" || provider === "gemini")) {
    return staticGreeting;
  }

  const systemInstruction = [
    cfg.systemPrompt,
    "",
    `Tono: ${cfg.tone}.`,
    "Respondé en español rioplatense.",
    "Reglas: no diagnosticar ni prescribir medicación; ante temas clínicos sensibles, sugerí consulta presencial.",
    "Respondé solo a lo que el usuario escribió. No listes servicios ni des la bienvenida institucional: eso ya aparece al abrir el chat.",
    "Si el mensaje tiene una pregunta o un pedido, respondé a eso. Si reclama o se molesta, una o dos frases máximo, sin monólogo ni repetir quién sos.",
    "Mensajes breves; más detalle solo si el usuario lo pide.",
    "FORMATO DE SALIDA: solo el texto que lee el paciente. PROHIBIDO incluir notas, listas de opciones internas, líneas con asterisco, etiquetas tipo User says o Persona, borradores en inglés, o metaexplicaciones.",
    "No repitas la misma respuesta dos veces. No uses comillas dobles alrededor del mensaje ni pegues dos copias del mismo párrafo.",
    "PROHIBIDO: checklist en inglés (Brief? Yes., Rioplatense? Yes., etc.), verificación interna, o cualquier línea de pensamiento antes de responder.",
    `Contacto humano si hace falta: ${cfg.humanHandoffHint}`,
  ].join("\n");

  const temperature = Number(process.env.AI_TEMPERATURE ?? "0.4");

  if (provider === "google" || provider === "gemini") {
    const reply = await generateWithGoogleGenAI({
      systemInstruction,
      history: params.history,
      userMessage: params.userMessage,
      temperature: Number.isFinite(temperature) ? temperature : 0.4,
    });
    return sanitizeChatModelOutput(reply);
  }

  throw new Error(`Proveedor AI no soportado: ${provider}`);
}
