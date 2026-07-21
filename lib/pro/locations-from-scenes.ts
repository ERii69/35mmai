import type { SceneRow } from "@/lib/pro/types";
import { formatSceneSlugline, locationFromSlugline } from "@/lib/pro/scene-heading-format";
import { prepareLineForHeadingCheck } from "@/lib/pro/parse-scene-headings";

const TIME_WORD =
  /^(DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER|SAME|SUNSET|SUNRISE)$/i;

const SLUG_PREFIX =
  /^(?:INT\/EXT|I\/E|INTERIOR\/EXTERIOR|INTERIOR|EXTERIOR|EST\.|INT|EXT)(?:[.:\s\-–—\/]+|\s)/i;

function titleCaseLocation(raw: string): string {
  return raw
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (TIME_WORD.test(word)) return word.charAt(0) + word.slice(1).toLowerCase();
      if (word.length <= 3 && word.endsWith(".")) return word;
      return word.charAt(0) + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function stripTrailingTime(raw: string): string {
  return raw
    .replace(/\s+[-–—]\s+(?:DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER|SAME|SUNSET|SUNRISE)(?:\b.*)?$/i, "")
    .trim();
}

function stripLeadingTime(raw: string): string {
  return raw.replace(/^(?:DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON)\s+[-–—]\s+/i, "").trim();
}

function normalizeLocationCandidate(raw: string): string | null {
  let loc = prepareLineForHeadingCheck(raw);
  if (!loc) return null;

  loc = stripLeadingTime(loc);
  loc = stripTrailingTime(loc);
  loc = loc.replace(/^@/, "").trim();

  if (!loc || TIME_WORD.test(loc)) return null;
  if (/^(INT|EXT|INTERIOR|EXTERIOR)\b/i.test(loc)) return null;

  const formatted = titleCaseLocation(loc);
  if (!isValidLocationName(formatted)) return null;
  return formatted;
}

/** Documentary sluglines, e.g. `DAY - FIELDS`, `HOUSE - DAY`. */
export function parseDocumentaryLocationFromHeading(heading: string): string | null {
  const h = prepareLineForHeadingCheck(heading);
  if (!h || h.length < 3 || h.length > 90) return null;

  const timeFirst = h.match(
    /^(DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON)\s+[-–—]\s+(.+)$/i
  );
  if (timeFirst?.[2]) {
    return normalizeLocationCandidate(timeFirst[2]);
  }

  const timeLast = h.match(
    /^(.+?)\s+[-–—]\s+(DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER|SAME|SUNSET|SUNRISE)$/i
  );
  if (timeLast?.[1] && !SLUG_PREFIX.test(timeLast[1])) {
    return normalizeLocationCandidate(timeLast[1]);
  }

  return null;
}

/** Parse location name from standard or documentary scene headings. */
export function parseLocationFromHeading(heading: string): string | null {
  const fromSlug = locationFromSlugline(heading);
  if (fromSlug) {
    let loc = stripLeadingTime(fromSlug);
    loc = stripTrailingTime(loc);
    const formatted = titleCaseLocation(loc);
    if (isValidLocationName(formatted)) return formatted;
  }

  return parseDocumentaryLocationFromHeading(heading);
}

/** Reject action text and garbage accidentally parsed as locations. */
export function isValidLocationName(name: string): boolean {
  const s = name.trim();
  if (s.length < 2 || s.length > 56) return false;
  if (/[.!?]/.test(s)) return false;
  if (/^(and|or|the|she|he|they|it|we|you|est)\b/i.test(s)) return false;
  if (/\b(closes|opens|runs|walks|looks|heaving|hands|eyes|fists)\b/i.test(s)) return false;
  if (/^(day|night|dawn|dusk|morning|evening)\s+[-–—]/i.test(s)) return false;
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length > 8) return false;
  if (words.length === 1) {
    const w = words[0]!.toLowerCase();
    const fragmentOnly = new Set([
      "coffee",
      "fire",
      "narrow",
      "safe",
      "downtown",
      "street",
      "shop",
      "ext",
      "int",
      "day",
      "night",
    ]);
    if (fragmentOnly.has(w)) return false;
  }
  return true;
}

export type ParsedLocationFromScenes = {
  name: string;
  sceneNumbers: number[];
  sourceHeading: string;
};

/** Unique locations with scene links (for staging / review). */
export function locationsFromSceneRows(scenes: SceneRow[]): ParsedLocationFromScenes[] {
  const byKey = new Map<string, ParsedLocationFromScenes>();

  for (const scene of scenes) {
    const name = parseLocationFromHeading(scene.heading);
    if (!name) continue;
    const key = name.toLowerCase();
    const existing = byKey.get(key);
    if (existing) {
      if (!existing.sceneNumbers.includes(scene.number)) {
        existing.sceneNumbers.push(scene.number);
      }
      continue;
    }
    byKey.set(key, {
      name,
      sceneNumbers: [scene.number],
      sourceHeading: formatSceneSlugline(scene.heading),
    });
  }

  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

/** Human-readable notes for staging / review cards. */
export function formatLocationStagingNotes(
  loc: ParsedLocationFromScenes,
  scenes: SceneRow[]
): string {
  const oneLines = loc.sceneNumbers
    .map((n) => scenes.find((s) => s.number === n)?.oneLine?.trim())
    .filter(Boolean);
  const parts = [
    `Scenes ${loc.sceneNumbers.join(", ")}`,
    loc.sourceHeading,
    oneLines[0],
  ].filter(Boolean);
  return parts.join(" · ");
}

/** Unique location names from approved scene headings (sorted). */
export function locationsFromApprovedScenes(scenes: SceneRow[]): string[] {
  return locationsFromSceneRows(scenes.filter((s) => s.status === "approved")).map((l) => l.name);
}

/** Merge parsed locations into an existing list; preserves order and avoids duplicates. */
export function mergeLocationLists(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing.map((l) => l.toLowerCase()));
  const merged = [...existing];
  for (const loc of incoming) {
    const key = loc.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(loc);
  }
  return merged;
}

/** Scene numbers tied to a location name in staging. */
export function sceneNumbersForLocationName(
  staging: { locations: { name: string; sceneNumbers?: number[] }[] },
  locationName: string
): number[] {
  const loc = staging.locations.find((l) => l.name.toLowerCase() === locationName.toLowerCase());
  return loc?.sceneNumbers ?? [];
}
