import { parseCharactersFromScreenplay } from "@/lib/pro/parse-character-names";
import { parseLocationFromHeading } from "@/lib/pro/locations-from-scenes";
import type {
  CharacterLock,
  PlaceLock,
  PlannedShot,
  ProjectStatePayload,
  PromptLocksState,
  SceneRow,
  ShotType,
} from "@/lib/pro/types";

export const PROMPT_REWRITE_CAP = 12;

const MOTION_TYPES = new Set<ShotType>(["dolly", "pan", "tilt", "handheld", "aerial"]);

export function emptyPromptLocks(): PromptLocksState {
  return { characters: [], places: [], builtFingerprints: {}, rewriteCount: 0 };
}

export function normalizePromptLocks(raw: unknown): PromptLocksState {
  const base = emptyPromptLocks();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Record<string, unknown>;
  const characters = Array.isArray(row.characters)
    ? row.characters
        .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
        .map((item, index) => ({
          id: typeof item.id === "string" ? item.id : `char-${index}`,
          name: typeof item.name === "string" ? item.name : "",
          look: typeof item.look === "string" ? item.look : "",
          keptStillPrompt:
            typeof item.keptStillPrompt === "string" ? item.keptStillPrompt : undefined,
        }))
        .filter((item) => item.name.trim())
    : [];
  const places = Array.isArray(row.places)
    ? row.places
        .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
        .map((item, index) => ({
          id: typeof item.id === "string" ? item.id : `place-${index}`,
          name: typeof item.name === "string" ? item.name : "",
          look: typeof item.look === "string" ? item.look : "",
          sceneNumbers: Array.isArray(item.sceneNumbers)
            ? item.sceneNumbers.filter((n): n is number => typeof n === "number")
            : [],
        }))
        .filter((item) => item.name.trim())
    : [];
  const builtFingerprints: Record<string, string> = {};
  if (row.builtFingerprints && typeof row.builtFingerprints === "object") {
    for (const [key, value] of Object.entries(row.builtFingerprints as Record<string, unknown>)) {
      if (typeof value === "string") builtFingerprints[key] = value;
    }
  }
  const rewriteCount =
    typeof row.rewriteCount === "number" && row.rewriteCount >= 0
      ? Math.floor(row.rewriteCount)
      : 0;
  const toolShapes: PromptLocksState["toolShapes"] = {};
  if (row.toolShapes && typeof row.toolShapes === "object") {
    for (const [key, value] of Object.entries(row.toolShapes as Record<string, unknown>)) {
      if (value === "still" || value === "edit" || value === "move" || value === "scene" || value === "grade") {
        toolShapes[key] = value;
      }
    }
  }
  return { characters, places, builtFingerprints, rewriteCount, toolShapes };
}

export function sceneFingerprint(scene: SceneRow): string {
  return `${scene.heading.trim()}\n${scene.oneLine.trim()}`;
}

function titleName(name: string): string {
  const cleaned = name.replace(/\s+/g, " ").trim();
  if (!cleaned) return cleaned;
  return cleaned
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function scenesMentioning(scenes: SceneRow[], name: string): SceneRow[] {
  const token = name.toLowerCase();
  return scenes.filter((scene) => scene.oneLine.toLowerCase().includes(token));
}

function inferCharacterLook(name: string, scenes: SceneRow[], rawText: string): string {
  const mentioned = scenesMentioning(scenes, name);
  const local = mentioned.map((scene) => scene.oneLine).join(" ");
  const bits: string[] = [];
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const age = rawText.match(new RegExp(escaped + "\\s*\\((\\d+s)\\)", "i"));
  if (age?.[1]) bits.push(age[1].toLowerCase());
  if (/\bcoat\b/i.test(local)) bits.push("dark coat");
  if (/\bletter\b/i.test(local)) bits.push("folded letter");
  if (bits.length === 0) bits.push("same face and wardrobe in every shot");
  return bits.join(", ");
}

function inferPlaceLook(scene: SceneRow): string {
  const time = scene.dayNight ? scene.dayNight.toLowerCase() : "";
  const line = scene.oneLine;
  const bits: string[] = [];
  if (time) bits.push(time);
  const rain = line.match(/\brain on [a-z]+/i);
  if (rain) bits.push(rain[0].toLowerCase());
  if (/\bwet brick\b/i.test(line)) bits.push("wet brick");
  if (/\bneon\b/i.test(line)) bits.push("distant neon");
  if (/\bcoffee\b/i.test(line)) bits.push("untouched coffee");
  if (bits.length === 1 && /\bwindow\b/i.test(line)) bits.push("window");
  return bits.join(", ") || "the same place in every shot";
}

export function derivePromptLocks(state: ProjectStatePayload): PromptLocksState {
  const scenes = state.directorPrep.scenes;
  const raw = state.directorPrep.screenplay.rawText;
  const characters: CharacterLock[] = parseCharactersFromScreenplay(raw).map((row) => {
    const name = titleName(row.name);
    return {
      id: `char-${name.toLowerCase()}`,
      name,
      look: inferCharacterLook(row.name, scenes, raw),
    };
  });

  const places: PlaceLock[] = [];
  const seen = new Set<string>();
  for (const scene of scenes) {
    const name = parseLocationFromHeading(scene.heading) ?? scene.heading.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    const look = inferPlaceLook(scene);
    const existing = places.find((place) => place.name.toLowerCase() === key);
    if (existing) {
      existing.sceneNumbers.push(scene.number);
      if (!existing.look && look) existing.look = look;
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    places.push({
      id: `place-${key.replace(/[^a-z0-9]+/g, "-")}`,
      name,
      look: look || "the same place in every shot",
      sceneNumbers: [scene.number],
    });
  }

  return {
    characters,
    places,
    builtFingerprints: {},
    rewriteCount: state.directorPrep.promptLocks?.rewriteCount ?? 0,
  };
}

function mergeByName<T extends { name: string; look: string }>(saved: T[], derived: T[]): T[] {
  const savedByName = new Map(saved.map((row) => [row.name.toLowerCase(), row]));
  return derived.map((row) => {
    const previous = savedByName.get(row.name.toLowerCase());
    if (previous?.look.trim()) return { ...row, look: previous.look.trim() };
    return row;
  });
}

/** Keep a filmmaker's edited sentences. Fill anything they have not written yet. */
export function stampPromptLocks(state: ProjectStatePayload): ProjectStatePayload {
  const saved = state.directorPrep.promptLocks ?? emptyPromptLocks();
  const derived = derivePromptLocks(state);
  const characters = mergeByName(saved.characters, derived.characters).map((row) => {
    const previous = saved.characters.find(
      (character) => character.name.toLowerCase() === row.name.toLowerCase()
    );
    return previous?.keptStillPrompt?.trim()
      ? { ...row, keptStillPrompt: previous.keptStillPrompt.trim() }
      : row;
  });
  const places = derived.places.map((place) => {
    const previous = saved.places.find((row) => row.name.toLowerCase() === place.name.toLowerCase());
    return previous?.look.trim() ? { ...place, look: previous.look.trim() } : place;
  });
  const builtFingerprints: Record<string, string> = {};
  for (const scene of state.directorPrep.scenes) {
    builtFingerprints[String(scene.number)] = sceneFingerprint(scene);
  }
  return {
    ...state,
    directorPrep: {
      ...state.directorPrep,
      promptLocks: {
        characters,
        places,
        builtFingerprints,
        rewriteCount: saved.rewriteCount ?? 0,
        toolShapes: saved.toolShapes ?? {},
      },
    },
  };
}

export function referenceStillPrompt(character: CharacterLock): string {
  return [
    `character reference still of ${character.name}, ${character.look}`,
    "face and wardrobe only, plain background, no scene, no action",
    "--ar 2:3 --style raw --no text, watermark, logo",
  ].join(", ");
}

export function charactersInScene(state: ProjectStatePayload, scene: SceneRow | undefined): CharacterLock[] {
  if (!scene) return [];
  const locks = state.directorPrep.promptLocks?.characters ?? [];
  const line = scene.oneLine.toLowerCase();
  return locks.filter((character) => line.includes(character.name.toLowerCase()));
}

export function placeForScene(state: ProjectStatePayload, scene: SceneRow | undefined): PlaceLock | null {
  if (!scene) return null;
  const places = state.directorPrep.promptLocks?.places ?? [];
  return (
    places.find((place) => place.sceneNumbers.includes(scene.number)) ??
    places.find((place) => scene.heading.toLowerCase().includes(place.name.toLowerCase())) ??
    null
  );
}

/** Sentence appended to a beat so the same person and place survive every tool. */
export function lockClauseForShot(
  state: ProjectStatePayload,
  scene: SceneRow | undefined,
  shotType: ShotType
): string {
  const people = charactersInScene(state, scene);
  const place = placeForScene(state, scene);
  const parts: string[] = [];
  if (shotType === "wide" || shotType === "establishing") {
    if (place?.look.trim()) parts.push(place.look.trim());
  } else if (people.length > 0) {
    parts.push(people.map((person) => `${person.name}, ${person.look}`).join("; "));
  }
  if (MOTION_TYPES.has(shotType) && people[0]) {
    parts.push(`Start from the Midjourney reference still of ${people[0].name}`);
  }
  return parts.join(". ");
}

export function staleSceneNumbers(state: ProjectStatePayload): number[] {
  const saved = state.directorPrep.promptLocks?.builtFingerprints ?? {};
  const stale: number[] = [];
  for (const scene of state.directorPrep.scenes) {
    const previous = saved[String(scene.number)];
    if (!previous) continue;
    if (previous !== sceneFingerprint(scene)) stale.push(scene.number);
  }
  return stale;
}

function distinctiveToken(look: string): string | null {
  const words = look
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(
      (word) =>
        word.length > 3 &&
        !["same", "face", "wardrobe", "every", "shot", "dark", "folded"].includes(word)
    );
  return words[0] ?? null;
}

function promptsForScene(state: ProjectStatePayload, sceneNumber: number): string[] {
  const seq = state.shotPlan.sequences.find((row) => row.sceneNumber === sceneNumber);
  if (!seq) return [];
  return seq.shots
    .map((shot) => `${shot.frameSentence ?? ""} ${shot.aiGenerationPrompt ?? ""}`)
    .filter((text) => text.trim());
}

export function continuityWarnings(state: ProjectStatePayload): string[] {
  const characters = state.directorPrep.promptLocks?.characters ?? [];
  const warnings: string[] = [];
  for (const character of characters) {
    const token = distinctiveToken(character.look);
    if (!token) continue;
    const present: number[] = [];
    const missing: number[] = [];
    for (const scene of state.directorPrep.scenes) {
      if (!scene.oneLine.toLowerCase().includes(character.name.toLowerCase())) continue;
      const prompts = promptsForScene(state, scene.number);
      if (prompts.length === 0) continue;
      const blob = prompts.join(" ").toLowerCase();
      if (blob.includes(token)) present.push(scene.number);
      else missing.push(scene.number);
    }
    if (missing.length === 0) continue;
    const label = `${character.name}'s ${token} is in the sentences for`;
    const sceneList = (numbers: number[]) =>
      numbers.length === 1 ? `scene ${numbers[0]}` : `scenes ${numbers.join(" and ")}`;
    if (present.length > 0) {
      warnings.push(`${label} ${sceneList(present)} and missing in ${sceneList(missing)}.`);
    } else {
      warnings.push(`${character.name}'s ${token} is missing from the sentences.`);
    }
  }
  return warnings;
}

export function frameLineForShot(shot: PlannedShot): string {
  return shot.label.replace(/\s+/g, " ").trim().slice(0, 140);
}
