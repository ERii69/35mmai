import { prepareLineForHeadingCheck } from "@/lib/pro/parse-scene-headings";

const SLUG_PREFIX =
  /^(?:INT\/EXT|I\/E|INTERIOR\/EXTERIOR|INTERIOR|EXTERIOR|EST\.|INT|EXT)(?:[.:\s\-–—\/]+|\s)/i;

const TIME_OF_DAY =
  /^(?:DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER|SAME|SUNSET|SUNRISE)$/i;

/** Full slugline for storage, e.g. `INT. COFFEE SHOP - DAY` (not `INT. COFFEE`). */
export function formatSceneSlugline(raw: string): string {
  const h = prepareLineForHeadingCheck(raw);
  const prefixMatch = h.match(SLUG_PREFIX);
  if (!prefixMatch) return h.slice(0, 120);

  const prefix = h.slice(0, prefixMatch[0].length).trimEnd();
  let rest = h.slice(prefixMatch[0].length).trim();
  rest = rest.replace(/\s+(and|then|as|where)\b.*$/i, "").trim();

  const dashParts = rest.split(/\s+[-–—]\s+/);
  if (dashParts.length >= 2 && TIME_OF_DAY.test(dashParts[dashParts.length - 1].trim().split(/\s/)[0] ?? "")) {
    const timeWord = dashParts[dashParts.length - 1].trim().split(/\s/)[0] ?? "";
    const location = dashParts.slice(0, -1).join(" - ").trim();
    if (location && timeWord) {
      return `${prefix} ${location} - ${timeWord}`.replace(/\s+/g, " ").trim();
    }
  }

  return `${prefix} ${rest}`.replace(/\s+/g, " ").trim().slice(0, 120);
}

/** Location name only, e.g. `COFFEE SHOP` from `INT. COFFEE SHOP - DAY`. */
export function locationFromSlugline(heading: string): string | null {
  const slug = formatSceneSlugline(heading);
  const prefixMatch = slug.match(SLUG_PREFIX);
  if (!prefixMatch) return null;

  let rest = slug.slice(prefixMatch[0].length).trim();
  rest = rest.replace(/\s+[-–—]\s+(?:DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER|SAME|SUNSET|SUNRISE)(?:\b.*)?$/i, "").trim();
  return rest || null;
}
