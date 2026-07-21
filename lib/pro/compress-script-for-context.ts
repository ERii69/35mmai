import { SCREENPLAY_RAW_TEXT_MAX_CHARS } from "@/lib/pro/types";

/** Compress long scripts for agent context (head + tail). Safe for client bundles. */
export function compressScriptForContext(raw: string, maxChars = 24_000): string {
  const text = raw.slice(0, SCREENPLAY_RAW_TEXT_MAX_CHARS);
  if (text.length <= maxChars) return text;
  const head = text.slice(0, Math.floor(maxChars * 0.45));
  const tail = text.slice(-Math.floor(maxChars * 0.35));
  return `${head}\n\n[... ${(text.length - head.length - tail.length).toLocaleString()} characters omitted for context ...]\n\n${tail}`;
}
