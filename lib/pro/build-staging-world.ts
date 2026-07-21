import { parseCharactersFromScreenplay } from "@/lib/pro/parse-character-names";
import { parseLocationsFromScreenplayText } from "@/lib/pro/parse-locations-from-screenplay";
import {
  formatLocationStagingNotes,
  locationsFromSceneRows,
} from "@/lib/pro/locations-from-scenes";
import {
  buildDefaultShootSuggestions,
  defaultMapQueryForLocation,
} from "@/lib/pro/location-research";
import type { SceneRow, StagedCharacterSuggestion, StagedLocationSuggestion } from "@/lib/pro/types";

export type BuildStagingLocationsOptions = {
  promptPack?: boolean;
};

function mergeByName<T extends { name: string; suggestionId: string; status: "pending" | "approved" | "rejected" }>(
  primary: T[],
  supplemental: T[]
): T[] {
  const seen = new Set(primary.map((row) => row.name.trim().toLowerCase()).filter(Boolean));
  const merged = [...primary];
  for (const row of supplemental) {
    const key = row.name.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
  }
  return merged;
}

function oneLineForScenes(scenes: SceneRow[], sceneNumbers: number[]): string {
  for (const n of sceneNumbers) {
    const line = scenes.find((s) => s.number === n)?.oneLine?.trim();
    if (line) return line;
  }
  return "";
}

function buildStagedLocation(
  name: string,
  notes: string,
  scenes: SceneRow[],
  prefix: string,
  index: number,
  options: BuildStagingLocationsOptions,
  sceneNumbers?: number[],
  sourceHeading?: string
): StagedLocationSuggestion {
  const oneLine = sceneNumbers?.length ? oneLineForScenes(scenes, sceneNumbers) : "";
  const mapQuery = options.promptPack ? "" : defaultMapQueryForLocation(name, notes);
  return {
    suggestionId: `${prefix}-${index}`,
    status: "pending",
    confidence: sceneNumbers?.length ? 72 : 65,
    name,
    notes,
    sceneNumbers,
    mapQuery: mapQuery || undefined,
    shootSuggestions: buildDefaultShootSuggestions(name, notes, mapQuery, {
      promptPack: options.promptPack,
      sceneNumbers,
      sourceHeading,
      oneLine,
    }),
    rulesAndLimitations: [],
  };
}

export function mergeStagingCharacters(
  agentRows: StagedCharacterSuggestion[],
  supplemental: StagedCharacterSuggestion[]
): StagedCharacterSuggestion[] {
  return mergeByName(agentRows, supplemental);
}

export function mergeStagingLocations(
  agentRows: StagedLocationSuggestion[],
  supplemental: StagedLocationSuggestion[]
): StagedLocationSuggestion[] {
  return mergeByName(agentRows, supplemental);
}

export function buildStagingCharactersFromScript(
  screenplayRaw: string,
  prefix = "local-char"
): StagedCharacterSuggestion[] {
  return parseCharactersFromScreenplay(screenplayRaw).map((character, i) => ({
    suggestionId: `${prefix}-${i}`,
    status: "pending" as const,
    confidence: Math.min(95, 62 + Math.min(character.dialogueBlocks, 6) * 5),
    name: character.name,
    notes: character.notes,
  }));
}

export function buildStagingLocationsFromScript(
  screenplayRaw: string,
  scenes: SceneRow[],
  prefix = "local-loc",
  options: BuildStagingLocationsOptions = {}
): StagedLocationSuggestion[] {
  const names = new Set<string>();
  const rows: StagedLocationSuggestion[] = [];

  for (const loc of locationsFromSceneRows(scenes)) {
    const key = loc.name.toLowerCase();
    if (names.has(key)) continue;
    names.add(key);
    const notes = formatLocationStagingNotes(loc, scenes);
    rows.push(
      buildStagedLocation(
        loc.name,
        notes,
        scenes,
        prefix,
        rows.length,
        options,
        loc.sceneNumbers,
        loc.sourceHeading
      )
    );
  }

  for (const name of parseLocationsFromScreenplayText(screenplayRaw)) {
    const key = name.toLowerCase();
    if (names.has(key)) continue;
    names.add(key);
    const notes = "Found in script scan (no linked scene yet).";
    rows.push(buildStagedLocation(name, notes, scenes, prefix, rows.length, options));
  }

  return rows;
}
