/** Marca final que el modelo agrega; el API la quita antes de guardar y devuelve highlightMisDatos. */
export const CHAT_MIS_DATOS_MARKER = "<<<MIS_DATOS>>>";

export function stripMisDatosMarker(reply: string): { text: string; highlightMisDatos: boolean } {
  const trimmed = reply.trim();
  const hasMarker = trimmed.toUpperCase().includes(CHAT_MIS_DATOS_MARKER);
  const text = hasMarker
    ? trimmed.replace(new RegExp(`\\s*${CHAT_MIS_DATOS_MARKER}\\s*`, "gi"), "").trim()
    : trimmed;

  const heuristic =
    /mis\s+datos/i.test(text) &&
    /(botón|boton|tocá|toca|tocar|completá|completa|formulario|envi(á|a)|cargar|dej(a|á)\s+(?:tus\s+)?datos|acá\s+abajo|abajo)/i.test(
      text,
    );

  return { text, highlightMisDatos: hasMarker || heuristic };
}
