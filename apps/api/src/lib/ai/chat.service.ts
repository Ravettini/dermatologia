import { generateWithGoogleGenAI } from "./provider";
import { sanitizeChatModelOutput } from "./chat-reply-sanitize";
import { getChatbotConfig } from "../settings";
import { prisma } from "../prisma";

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
}): Promise<string> {
  const cfg = await getChatbotConfig();
  const provider = process.env.AI_PROVIDER || "google";

  const staticGreeting = bareGreetingReply(params.userMessage);
  if (staticGreeting && (provider === "google" || provider === "gemini")) {
    return staticGreeting;
  }

  const faqBlock = await faqKnowledgeForPrompt();

  const systemInstruction = [
    cfg.systemPrompt,
    faqBlock,
    "",
    `Tono: ${cfg.tone}.`,
    "Respondé en español rioplatense.",
    "Reglas: no diagnosticar ni prescribir medicación; ante temas clínicos sensibles, sugerí consulta presencial.",
    "Respondé solo a lo que el usuario escribió. No listes servicios ni des la bienvenida institucional: eso ya aparece al abrir el chat.",
    "Si el mensaje tiene una pregunta o un pedido, respondé a eso. Si reclama o se molesta, una o dos frases máximo, sin monólogo ni repetir quién sos.",
    "Mensajes breves; más detalle solo si el usuario lo pide.",
    "Si necesitás pedir datos para contacto o turno, pedí: motivo o tratamiento, nombre y apellido, DNI o documento, mail y teléfono. Si el usuario los escribe en el chat, agradecé y explicá que **para que el centro los reciba en el sistema** tiene que tocar el botón «Mis datos» en este chat, completar el formulario (DNI obligatorio) y Enviar; o usar reservas/contacto del sitio o WhatsApp.",
    "PROHIBIDO decir que sus datos «ya quedaron guardados», «ya los tenemos», «el equipo los recibió» o similares solo porque escribió en el chat. Eso no registra nada: el registro en el centro es solo con el formulario «Mis datos», o formulario web, o reserva, o WhatsApp. En el chat podés ser amable y orientar a esos canales, sin afirmar un alta en la base de datos.",
    "FORMATO DE SALIDA: solo el texto que lee el paciente. PROHIBIDO incluir notas, listas de opciones internas, líneas con asterisco, etiquetas tipo User says o Persona, borradores en inglés, o metaexplicaciones.",
    "PROHIBIDO escribir al inicio (o en ninguna parte) etiquetas como \"Draft:\", \"Draft 1:\", \"Borrador:\" o similares: empezá directo con la respuesta al usuario.",
    "No repitas la misma respuesta dos veces. No uses comillas dobles alrededor del mensaje ni pegues dos copias del mismo párrafo.",
    "Una sola variante de respuesta: no repitas el mismo párrafo ni lo vuelvas a pegar entre comillas.",
    "PROHIBIDO: checklist en inglés (Brief? Yes., Rioplatense? Yes., etc.), verificación interna, o cualquier línea de pensamiento antes de responder.",
    "PROHIBIDO escribir \"Alternative:\", \"Option A/B\", ni variantes entre comillas antes de la respuesta.",
    "Nunca escribas verificaciones internas (Rioplatense?, Brief?, Yes/No, paréntesis con \"disculpame\"): eso no lo ve el paciente y está prohibido.",
    "Si el pedido no tiene relación con dermatología, salud de la piel, turnos o el centro (recetas de cocina, temas generales, otros rubros), respondé en una o dos frases que no podés ayudar con eso y ofrecé orientación sobre turnos o contacto con el centro. No des recetas ni contenido fuera de alcance.",
    `Contacto humano si hace falta: ${cfg.humanHandoffHint}`,
  ].join("\n");

  const OFF_TOPIC_FALLBACK =
    "Disculpá, no puedo ayudarte con ese tema. Este asistente es solo para consultas sobre dermatología y turnos del centro. Si querés coordinar una consulta o tenés una duda sobre el centro, decime y te oriento.";

  const temperature = Number(process.env.AI_TEMPERATURE ?? "0.4");

  if (provider === "google" || provider === "gemini") {
    const reply = await generateWithGoogleGenAI({
      systemInstruction,
      history: params.history,
      userMessage: params.userMessage,
      temperature: Number.isFinite(temperature) ? temperature : 0.4,
    });
    let out = sanitizeChatModelOutput(reply).trim();
    if (!out || /^rioplatense\?/i.test(out) || /^brief\?/i.test(out)) {
      out = OFF_TOPIC_FALLBACK;
    }
    return out;
  }

  throw new Error(`Proveedor AI no soportado: ${provider}`);
}
