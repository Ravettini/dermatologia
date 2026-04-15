export function sanitizeText(input: string, maxLen: number): string {
  const trimmed = input.trim().slice(0, maxLen);
  return trimmed.replace(/<[^>]*>/g, "").replace(/\0/g, "");
}
