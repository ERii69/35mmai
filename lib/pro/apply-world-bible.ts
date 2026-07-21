import { parseCharacterNamesFromScreenplay } from "@/lib/pro/parse-character-names";
import { parseLocationsFromScreenplayText } from "@/lib/pro/parse-locations-from-screenplay";
import {
  locationsFromSceneRows,
  mergeLocationLists,
} from "@/lib/pro/locations-from-scenes";
import type { ProjectStatePayload, WorldBibleState } from "@/lib/pro/types";

function mergeCharacterLists(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing.map((c) => c.toLowerCase()));
  const merged = [...existing];
  for (const name of incoming) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(name);
  }
  return merged;
}

function buildLocalNotes(
  state: ProjectStatePayload,
  scenes: ProjectStatePayload["directorPrep"]["scenes"]
): string {
  const parts: string[] = [];
  const summary = state.directorPrep.agentMeta.executiveSummary.trim();
  if (summary) parts.push(summary);

  const oneLines = scenes
    .map((s) => s.oneLine.trim())
    .filter(Boolean)
    .slice(0, 12);
  if (oneLines.length > 0) {
    parts.push(`Scene spine:\n${oneLines.map((l) => `- ${l}`).join("\n")}`);
  }

  const mood = state.directorPrep.agentMeta.visualMood.trim();
  if (mood) parts.push(`Visual mood: ${mood}`);

  return parts.join("\n\n").trim();
}

/** Rule-based world bible from screenplay + prep scenes (no API key). */
export function generateWorldFromScript(state: ProjectStatePayload): WorldBibleState {
  const dp = state.directorPrep;
  const raw = dp.screenplay.rawText.trim();
  const scenesForNotes =
    dp.scenes.filter((s) => s.status === "approved").length > 0
      ? dp.scenes.filter((s) => s.status === "approved")
      : dp.scenes;

  let characters: string[] = [];
  let locations: string[] = [];

  if (raw) {
    characters = parseCharacterNamesFromScreenplay(raw);
    locations = parseLocationsFromScreenplayText(raw);
  }

  if (dp.scenes.length > 0) {
    const fromPrepLocs = locationsFromSceneRows(dp.scenes).map((l) => l.name);
    locations = mergeLocationLists(locations, fromPrepLocs);
  }

  if (characters.length === 0 && dp.scenes.length > 0) {
    const fromOneLines = dp.scenes
      .map((s) => s.oneLine.trim())
      .filter((line) => /^[A-Z][a-z]+(?: [A-Z][a-z]+){0,3}$/.test(line));
    characters = mergeCharacterLists(characters, fromOneLines);
  }

  return {
    notes: buildLocalNotes(state, scenesForNotes),
    characters,
    locations,
  };
}

export function applyWorldBibleToState(
  state: ProjectStatePayload,
  generated: WorldBibleState,
  mode: "replace" | "merge" = "replace"
): ProjectStatePayload {
  const prev = state.worldBible;
  return {
    ...state,
    worldBible: {
      notes: generated.notes.trim() || prev.notes,
      characters:
        mode === "merge"
          ? mergeCharacterLists(prev.characters, generated.characters)
          : generated.characters,
      locations:
        mode === "merge"
          ? mergeLocationLists(prev.locations, generated.locations)
          : generated.locations,
    },
  };
}

export function worldBibleHasUserContent(state: ProjectStatePayload): boolean {
  const w = state.worldBible;
  return Boolean(w.notes.trim() || w.characters.length > 0 || w.locations.length > 0);
}
