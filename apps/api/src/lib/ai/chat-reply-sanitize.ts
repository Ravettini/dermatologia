/**
 * Algunos modelos devuelven razonamiento visible (* User says *, Draft 1, checklist en inglés…)
 * o repiten el mismo párrafo con una comilla suelta ("Hola…"Hola…). Esto deja solo lo que debe ver el paciente.
 */

const META_LINE_START =
  /^(user says|persona|tone|goal|context|constraint|language|action\s*:|draft\s*\d|option\s*\d+)/i;

/** Encabezado típico de “nota interna” al inicio de un trozo */
function chunkLooksMeta(head: string): boolean {
  const h = head.slice(0, 200).toLowerCase();
  if (META_LINE_START.test(head.trim())) return true;
  if (
    /\b(user says|persona:|context:|tone:|goal:|draft\s*\d|virtual assistant for|action:|rioplatense\?|professional|brief\?|no\s+diagnosis|no\s+welcome)\b/i.test(
      h,
    )
  ) {
    return true;
  }
  return false;
}

/** Trozo que probablemente es lo que lee el paciente (español, sin rubric en inglés al inicio) */
function chunkLooksPatientFacing(text: string): boolean {
  const t = text.trim();
  if (t.length < 18) return false;
  if (chunkLooksMeta(t)) return false;
  return true;
}

/** Quita checklist en inglés al inicio: "Brief? Yes.Disculpame…", "Rioplatense? Yes. …" */
function stripLeadingEnglishChecklist(s: string): string {
  let t = s.trim();
  let prev = "";
  // Palabras hasta ?, luego Yes/No/Sí + punto (con o sin espacio antes del texto útil)
  const chunk = /^([\w\s/,'-]+?)\?\s*(?:Yes|No|Si|Sí)\.\s*/i;
  /** p.ej. Rioplatense? Yes ("Disculpame"). — sin punto inmediato después de Yes */
  const chunkLoose =
    /^(?:Rioplatense|Brief|Professional|Tone|Goal|Context)\s*\?\s*(?:Yes|No|Si|Sí)\s*(?:\([^)]*\)(?:\s*,\s*\([^)]*\))*\s*)?\.?\s*/i;
  while (prev !== t) {
    prev = t;
    t = t.replace(chunk, "").trim();
    t = t.replace(chunkLoose, "").trim();
    t = t.replace(/^\*+\s*/, "").trim();
  }
  return t;
}

/** Líneas sueltas de “verificación de tono” que filtran modelos */
function stripInternalToneChecklistLines(s: string): string {
  const lines = s.split("\n");
  const kept = lines.filter((line) => {
    const L = line.trim();
    if (/^Rioplatense\?\s*(Yes|No|Si|Sí)\b/i.test(L)) return false;
    if (/^Brief\?\s*(Yes|No|Si|Sí)\b/i.test(L)) return false;
    if (/^Professional\/?\s*\w*\s*\?\s*(Yes|No|Si|Sí)\b/i.test(L)) return false;
    return true;
  });
  return kept.join("\n").trim();
}

const norm = (x: string) => x.replace(/\s+/g, " ").trim();

/** Gemini a veces usa “ ” en lugar de " — sin esto no detectamos duplicados pegados con comilla */
function normalizeAiQuotes(s: string): string {
  return s
    .replace(/\uFEFF/g, "")
    .replace(/[\u201c\u201d\u201e\u00ab\u00bb\u201a\u2039\u203a\u2018\u2019]/g, '"');
}

/**
 * Mismo párrafo pegado dos veces sin comilla (o con longitudes casi iguales)
 */
function stripExactAdjacentDuplicate(s: string): string {
  const t = s.trim();
  if (t.length < 50) return s;
  const mid = Math.floor(t.length / 2);
  for (let d = 0; d <= 160; d++) {
    for (const i of [mid + d, mid - d]) {
      if (i < 20 || i > t.length - 20) continue;
      const L = norm(t.slice(0, i));
      const R = norm(t.slice(i));
      if (L.length < 18 || R.length < 18) continue;
      if (L === R) return t.slice(0, i).trimEnd();
    }
  }
  return s;
}

function dedupeStrayQuotesAndRepeat(s: string): string {
  return stripExactAdjacentDuplicate(stripDuplicateAfterStrayQuote(s));
}

/**
 * Modelos tipo: Alternative: "Para sacar un turno…"Para sacar un turno… (texto duplicado)
 */
function stripAlternativeQuotedDuplicate(s: string): string {
  const pos = s.search(/Alternative:\s*"/i);
  if (pos < 0) return s;
  const sub = s.slice(pos);
  const open = sub.indexOf('"');
  const close = sub.indexOf('"', open + 1);
  if (open < 0 || close < 0) return s;
  const inner = sub.slice(open + 1, close);
  const rest = sub.slice(close + 1).trim();
  const nIn = norm(inner);
  const nRest = norm(rest);
  if (nIn.length < 12) return s;
  let out: string;
  if (!rest) out = inner.trim();
  else if (nIn === nRest || nRest.startsWith(nIn.slice(0, Math.min(80, nIn.length)))) out = rest;
  else out = inner.trim();
  const prefix = s.slice(0, pos).trimEnd();
  return prefix ? `${prefix}\n${out}`.trim() : out;
}

/**
 * "…coordinarlo."Hola. Podés…" (mismo párrafo dos veces) → una sola vez, sin comilla suelta.
 */
function stripDuplicateAfterStrayQuote(s: string): string {
  const firstHola = s.indexOf("Hola.");
  let idx = 0;
  while ((idx = s.indexOf('"', idx)) >= 0) {
    const before = s.slice(0, idx).trimEnd();
    const after = s.slice(idx + 1).trim();
    if (after.length < 20) {
      idx++;
      continue;
    }

    const nb = norm(before);
    const na = norm(after);
    if (nb.length > 12 && na.length > 12 && nb === na) {
      return before.trimEnd();
    }

    const holaBefore = before.indexOf("Hola.");
    if (holaBefore >= 0 && after.startsWith("Hola.")) {
      const p1 = norm(before.slice(holaBefore));
      const p2 = norm(after);
      if (p1 === p2 || (p2.length > 35 && p1.slice(0, 90) === p2.slice(0, 90))) {
        return before.replace(/["'\s]+$/g, "").trim();
      }
    }

    // Sin "Hola" al inicio del segundo trozo (raro)
    if (holaBefore >= 0 && after.length > 40) {
      const p1 = norm(before.slice(holaBefore));
      const p2 = norm(after);
      if (p1 === p2 || (p2.length > 35 && p1.includes(p2.slice(0, Math.min(70, p2.length))))) {
        return before.replace(/["'\s]+$/g, "").trim();
      }
    }

    idx++;
  }

  // Mismo patrón sin comilla: "...texto.Hola. ..." pegado dos veces (doble "Hola.")
  if (firstHola >= 0) {
    const second = s.indexOf("Hola.", firstHola + 5);
    if (second > firstHola) {
      const a = norm(s.slice(firstHola, second));
      const b = norm(s.slice(second));
      if (a === b && a.length > 40) return s.slice(firstHola, second).trim();
    }
  }

  return s;
}

/** Casos como "* … Yes.Hola. Podés…" sin salto de línea */
function extractAfterYesHolaGlue(s: string): string | null {
  const m = s.match(/(?:Yes|Si|Sí)\s*\.(Hola\.\s+[\s\S]+)$/i);
  if (m && m[1].trim().length >= 20) return m[1].trim();
  return null;
}

/** Tras separar por *, quedan fragmentos " Hola. Podés…" o basura; nos quedamos con los buenos. */
function extractFromAsteriskFragments(s: string): string | null {
  const parts = s.split(/\*/).map((p) => p.trim()).filter(Boolean);
  const candidates: string[] = [];

  for (const p of parts) {
    let chunk = p;

    const draftTail = p.match(
      /(?:\bdraft\s*\d[^:]*|more\s+professional[^:]*):\s*\*?\s*(Hola\.\s+.+)$/is,
    );
    if (draftTail) chunk = draftTail[1].trim();

    const holaOnly = p.match(/\b(Hola\.\s+.{15,})$/is);
    if (holaOnly && chunkLooksPatientFacing(holaOnly[1])) chunk = holaOnly[1].trim();

    if (chunkLooksPatientFacing(chunk)) candidates.push(chunk.trim());
  }

  if (!candidates.length) return null;
  return candidates[candidates.length - 1];
}

/** "Hola." dentro de User says: "…" es el mensaje del paciente, no la respuesta del bot */
function isHolaInsideUserSaysQuote(s: string, holaIndex: number): boolean {
  const lower = s.toLowerCase();
  const u = lower.indexOf("user says");
  if (u < 0) return false;
  const q1 = s.indexOf('"', u);
  if (q1 < 0 || holaIndex <= q1) return false;
  const q2 = s.indexOf('"', q1 + 1);
  if (q2 < 0) return holaIndex > q1 && holaIndex < q1 + 800;
  return holaIndex > q1 && holaIndex < q2;
}

/** Última aparición de "Hola." que parece respuesta del asistente (no la cita "User says") */
function extractLastAssistantHola(s: string): string | null {
  const re = /\bHola\.\s+/g;
  let m: RegExpExecArray | null;
  let best: string | null = null;

  while ((m = re.exec(s)) !== null) {
    const from = m.index;
    const tail = s.slice(from);
    if (tail.length < 25) continue;
    if (isHolaInsideUserSaysQuote(s, from)) continue;

    if (chunkLooksPatientFacing(tail)) best = tail.trim();
  }

  return best;
}

function normalizeOut(s: string): string {
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

/** Limpieza final: comillas sueltas, espacios raros */
function stripTrailingStrayQuotes(s: string): string {
  return s.replace(/["']+$/g, "").replace(/^["']+/g, "").trim();
}

export function sanitizeChatModelOutput(raw: string): string {
  let s = normalizeAiQuotes(raw.replace(/\r\n/g, "\n").trim());
  if (!s) return s;

  s = stripAlternativeQuotedDuplicate(s);
  s = stripLeadingEnglishChecklist(s);
  s = stripInternalToneChecklistLines(s);

  const contaminated =
    /\*|user\s+says|persona:|draft\s*\d|context:|tone:|goal:|action:|alternative:/i.test(s) ||
    /rioplatense\?/i.test(s);

  if (contaminated) {
    const glued = extractAfterYesHolaGlue(s);
    if (glued) {
      s = normalizeOut(stripLeadingEnglishChecklist(dedupeStrayQuotesAndRepeat(glued)));
      return stripTrailingStrayQuotes(s);
    }

    const fromStars = extractFromAsteriskFragments(s);
    if (fromStars) {
      s = normalizeOut(stripLeadingEnglishChecklist(dedupeStrayQuotesAndRepeat(fromStars)));
      return stripTrailingStrayQuotes(s);
    }

    const lastHola = extractLastAssistantHola(s);
    if (lastHola) {
      s = normalizeOut(stripLeadingEnglishChecklist(dedupeStrayQuotesAndRepeat(lastHola)));
      return stripTrailingStrayQuotes(s);
    }
  }

  s = dedupeStrayQuotesAndRepeat(s);
  s = stripLeadingEnglishChecklist(s);

  // Líneas: quitar metadatos; en líneas con * intentar rescatar "Hola. …" al final
  const lines = s.split("\n");
  const kept: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (t.length === 0) continue;

    if (t.startsWith("*")) {
      const rescued = t.match(/\b(Hola\.\s+.+)$/is);
      if (rescued && chunkLooksPatientFacing(rescued[1])) {
        kept.push(rescued[1].trim());
      }
      continue;
    }

    if (META_LINE_START.test(t)) continue;
    kept.push(line);
  }
  s = kept.join("\n").trim();

  // Una sola línea con restos de CoT separados por *
  if (/user says|persona:|draft\s*\d|virtual assistant|option\s*\d|constraint check/i.test(s)) {
    const parts = raw.split(/\*/);
    const good: string[] = [];
    for (const part of parts) {
      const t = part.trim();
      if (!t) continue;
      const probe = t.slice(0, 140).toLowerCase();
      if (
        /^user\s+says\s*:/i.test(t) ||
        /^persona\s*:/i.test(t) ||
        /^tone\s*:/i.test(t) ||
        /^goal\s*:/i.test(t) ||
        /^context\s*:/i.test(t) ||
        /^constraint/i.test(t) ||
        /^language\s*:/i.test(t) ||
        /^draft\s*\d/i.test(t) ||
        /^option\s*\d/i.test(t) ||
        /^professional\?/i.test(t) ||
        /virtual assistant/i.test(probe)
      ) {
        continue;
      }
      good.push(t);
    }
    const joined = good.join(" ").replace(/\s+/g, " ").trim();
    if (joined.length >= 12) s = joined;
  }

  if (/user says|persona:/i.test(s)) {
    const paras = s
      .split(/\n\s*\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const plain = paras.filter((p) => !/user says|persona:|^\*/i.test(p));
    if (plain.length) s = plain[plain.length - 1];
  }

  s = stripAlternativeQuotedDuplicate(s);
  s = stripInternalToneChecklistLines(stripLeadingEnglishChecklist(dedupeStrayQuotesAndRepeat(normalizeOut(s))));
  s = stripTrailingStrayQuotes(s);

  if (s.length < 2) return raw.trim();
  return s;
}
