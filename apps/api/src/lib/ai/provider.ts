import { GoogleGenerativeAI } from "@google/generative-ai";

export type ChatTurn = { role: "user" | "model"; text: string };

export type GenerateReplyParams = {
  systemInstruction: string;
  history: ChatTurn[];
  userMessage: string;
  temperature: number;
};

const DEFAULT_MODEL = "gemma-3n-e2b-it";

/**
 * Ids oficiales en minúsculas, p. ej. `gemini-2.0-flash`, `gemma-3n-e2b-it`, `gemma-3-27b-it`.
 * Si ponés "Gemma 3n E2B" a mano falla: tiene que ser exactamente el id de la API (minúsculas, guiones).
 * @see https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api
 */
function resolveGoogleGenAIModelId(raw: string | undefined): string {
  const name = (raw || DEFAULT_MODEL).trim().toLowerCase();
  if (!/^(gemini|gemma)-[a-z0-9][a-z0-9.-]*$/.test(name)) {
    console.warn(
      `[ai] GOOGLE_GENAI_MODEL="${raw ?? ""}" no coincide con un id tipo gemini-… o gemma-…; usando ${DEFAULT_MODEL}. ` +
        "Ej. Gemma 3n E2B IT → gemma-3n-e2b-it"
    );
    return DEFAULT_MODEL;
  }
  return name;
}

export async function generateWithGoogleGenAI(params: GenerateReplyParams): Promise<string> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  const modelName = resolveGoogleGenAIModelId(process.env.GOOGLE_GENAI_MODEL);

  if (!apiKey) {
    throw new Error("GOOGLE_GENAI_API_KEY no configurada");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: params.systemInstruction,
    generationConfig: {
      temperature: params.temperature,
      maxOutputTokens: 512,
    },
  });

  const chat = model.startChat({
    history: params.history.map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    })),
  });

  const result = await chat.sendMessage(params.userMessage);
  const text = result.response.text();
  if (!text?.trim()) {
    throw new Error("Respuesta vacía del modelo");
  }
  return text.trim();
}
