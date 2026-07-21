/** User-facing headings: use middle dots, not em dashes. */
export function formatDisplayHeading(raw: string): string {
  return raw
    .replace(/\s*[—–]\s*/g, " · ")
    .replace(/\s+-\s+/g, " · ")
    .replace(/\s+/g, " ")
    .trim();
}
