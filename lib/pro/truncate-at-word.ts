/** Cut at a sentence or word boundary so generation prompts never end mid-word. */
export function truncateAtWord(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const sentenceEnd = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? ")
  );
  if (sentenceEnd >= Math.floor(max * 0.45)) {
    return slice.slice(0, sentenceEnd + 1).trim();
  }
  const atSpace = slice.lastIndexOf(" ");
  if (atSpace >= Math.floor(max * 0.35)) {
    return slice.slice(0, atSpace).replace(/[.,;:]+$/, "").trim();
  }
  return slice.trim();
}
