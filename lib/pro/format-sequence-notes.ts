/** Parse staged / prep shot-list notes into display lines. */
export function parseSequenceNoteLines(notes: string): string[] {
  return notes
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0 && !/^director note:/i.test(line));
}

export function isPromptStyleSequenceNotes(notes: string): boolean {
  const t = notes.trim();
  if (!t) return false;
  if (/\[(establishing|wide|medium|close_up|dolly)\]/i.test(t)) return true;
  return t.length > 120 && /cinematic|film still|2\.39|modular ai generation/i.test(t);
}
