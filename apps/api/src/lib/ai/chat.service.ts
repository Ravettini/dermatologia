import { generateWithGoogleGenAI } from "./provider";
import { sanitizeChatModelOutput } from "./chat-reply-sanitize";
import { getChatbotConfig } from "../settings";
import { prisma } from "../prisma";
import { stripMisDatosMarker } from "../chat-mis-datos-marker";

async function faqKnowledgeForPrompt(): Promise<string> {
  const items = await prisma.fAQItem.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { question: true, answer: true },
  });
  if (items.length === 0) return "";
  const block = items.map((i) => `P: ${i.question}\nR: ${i.answer}`).join("\n\n");
  return [
    "",
    "Base de conocimiento — preguntas frecuentes del centro:",
    "Cuando la consulta del usuario encaje con alguna de estas preguntas, respondé de forma alineada con la respuesta indicada (podés parafrasear en tono conversacional).",
    "No inventes datos clínicos ni contradicciones respecto de este texto. Si no hay una respuesta clara aquí, no inventes: ofrecé consulta presencial o contacto con el equipo.",
    "",
    block,
  ].join("\n");
}

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
}): Promise<{ reply: string; highlightMisDatos: boolean }> {
  const cfg = await getChatbotConfig();
  const provider = process.env.AI_PROVIDER || "google";

  const staticGreeting = bareGreetingReply(params.userMessage);
  if (staticGreeting && (provider === "google" || provider === "gemini")) {
    return { reply: staticGreeting, highlightMisDatos: false };
  }

  const faqBlock = await faqKnowledgeForPrompt();

  const agendaLine = [
    `Agenda en línea (plataforma Bekandu): ${cfg.turnosOnlineUrl}.`,
    "Si preguntan por turnos, reservas, citas, primera consulta u horarios, orientá ese flujo usando esa URL tal cual en texto plano.",
    "No inventes enlaces.",
  ].join(" ");

  const systemInstruction = [
    cfg.systemPrompt,
    agendaLine,
    faqBlock,
    "",
    `Tono: ${cfg.tone}.`,
    "Respondé en español rioplatense.",
    "Reglas: no diagnosticar ni prescribir medicación; ante temas clínicos sensibles, sugerí consulta presencial.",
    "Respondé solo a lo que el usuario escribió. No listes servicios ni des la bienvenida institucional: eso ya aparece al abrir el chat.",
    "Si el mensaje tiene una pregunta o un pedido, respondé a eso. Si reclama o se molesta, una o dos frases máximo, sin monólogo ni repetir quién sos.",
    "Mensajes breves; más detalle solo si el usuario lo pide.",
    "No pidas en el chat un paquete de datos personales (motivo detallado, nombre, apellido, mail, teléfono, DNI) como condición para «registrar» un turno. El alta de turno corre por la página de agenda o WhatsApp/contacto si no pueden usar la web.",
    "PROHIBIDO mencionar botones rojos, el formulario «Mis datos», marcas tipo <<<…>>> ni flujos internos del chat.",
    "PROHIBIDO decir que sus datos «ya quedaron guardados», «ya los tenemos», «el equipo los recibió» o similares solo porque escribió acá.",
    "FORMATO DE SALIDA: solo el texto que lee el usuario. PROHIBIDO incluir notas, listas de opciones internas, líneas con asterisco, etiquetas tipo User says o Persona, borradores en inglés, o metaexplicaciones.",
    "PROHIBIDO escribir al inicio (o en ninguna parte) etiquetas como \"Draft:\", \"Draft 1:\", \"Borrador:\" o similares: empezá directo con la respuesta al usuario.",
    "No repitas la misma respuesta dos veces. No uses comillas dobles alrededor del mensaje ni pegues dos copias del mismo párrafo.",
    "Una sola variante de respuesta: no repitas el mismo párrafo ni lo vuelvas a pegar entre comillas.",
    "PROHIBIDO: checklist en inglés (Brief? Yes., Rioplatense? Yes., etc.), verificación interna, o cualquier línea de pensamiento antes de responder.",
    "PROHIBIDO escribir \"Alternative:\", \"Option A/B\", ni variantes entre comillas antes de la respuesta.",
    "Nunca escribas verificaciones internas (Rioplatense?, Brief?, Yes/No, paréntesis con \"disculpame\"): eso no lo ve el paciente y está prohibido.",
    "Si el pedido no tiene relación con dermatología, salud de la piel, turnos o el centro (recetas de cocina, temas generales, otros rubros), respondé en una o dos frases que no podés ayudar con eso y ofrecé orientación sobre turnos o contacto con el centro. No des recetas ni contenido fuera de alcance.",
    `Derivación si hace falta: ${cfg.humanHandoffHint}`,
  ].join("\n");

  const OFF_TOPIC_FALLBACK =
    "Disculpá, no puedo ayudarte con ese tema. Este asistente es solo para consultas sobre dermatología y turnos del centro. Si querés coordinar una consulta o tenés una duda sobre el centro, decime y te oriento.";

  const temperature = Number(process.env.AI_TEMPERATURE ?? "0.4");

  if (provider === "google" || provider === "gemini") {
    const raw = await generateWithGoogleGenAI({
      systemInstruction,
      history: params.history,
      userMessage: params.userMessage,
      temperature: Number.isFinite(temperature) ? temperature : 0.4,
    });
    const { text: withoutMarker, highlightMisDatos } = stripMisDatosMarker(raw);
    let out = sanitizeChatModelOutput(withoutMarker).trim();
    let highlight = highlightMisDatos;
    if (!out || /^rioplatense\?/i.test(out) || /^brief\?/i.test(out)) {
      out = OFF_TOPIC_FALLBACK;
      highlight = false;
    }
    return { reply: out, highlightMisDatos: highlight };
  }

  throw new Error(`Proveedor AI no soportado: ${provider}`);
}
