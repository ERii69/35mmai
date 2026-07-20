import {
  isSceneHeadingLine,
  normalizeScreenplayText,
  parseScenesFromScreenplayText,
} from "@/lib/pro/parse-scene-headings";
import {
  locationsFromSceneRows,
  mergeLocationLists,
  parseDocumentaryLocationFromHeading,
  parseLocationFromHeading,
} from "@/lib/pro/locations-from-scenes";

/** Scan screenplay lines for sluglines and location cues. */
export function parseLocationsFromScreenplayText(text: string): string[] {
  const normalized = normalizeScreenplayText(text);
  const lines = normalized.split("\n");
  const found: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isSceneHeadingLine(trimmed)) {
      const loc = parseLocationFromHeading(trimmed);
      if (loc) found.push(loc);
      continue;
    }

    const doc = parseDocumentaryLocationFromHeading(trimmed);
    if (doc) found.push(doc);
  }

  const scenes = parseScenesFromScreenplayText(normalized);
  const fromScenes = locationsFromSceneRows(scenes).map((l) => l.name);

  return mergeLocationLists([], [...found, ...fromScenes]);
}
