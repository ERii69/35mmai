import { callSubAgentJson } from "@/lib/pro/agents/anthropic-client";
import { isolateSceneSummaries, memoryContextBlock } from "@/lib/pro/agents/context";
import {
  buildDefaultShootSuggestions,
  createLocationPin,
  defaultMapQueryForLocation,
  newShootSuggestionId,
} from "@/lib/pro/location-research";
import { parseCharactersFromScreenplay } from "@/lib/pro/parse-character-names";
import type {
  AgentProjectMemory,
  LocationPin,
  LocationShootSuggestion,
  SceneRow,
  StagedCharacterSuggestion,
  StagedLocationSuggestion,
} from "@/lib/pro/types";

type ResearchLocationOutput = {
  name: string;
  notes: string;
  confidence: number;
  sceneNumbers?: number[];
  mapQuery?: string;
  pinnedPlace?: { label?: string; mapQuery?: string; lat?: number | null; lng?: number | null };
  shootSuggestions?: Array<{ title?: string; why?: string; mapQuery?: string }>;
  rulesAndLimitations?: string[];
};

type ResearchOutput = {
  researchNotes: string;
  characters: Array<{ name: string; notes: string; confidence: number }>;
  locations: ResearchLocationOutput[];
};

function stagedCharactersFromRows(
  rows: Array<{ name: string; notes: string; confidence: number }>,
  prefix: string
): StagedCharacterSuggestion[] {
  return rows
    .filter((row) => (row.name ?? "").trim().length > 0)
    .map((row, i) => ({
      suggestionId: `${prefix}-${Date.now()}-${i}`,
      status: "pending" as const,
      confidence: Math.min(100, Math.max(0, Math.round(row.confidence ?? 70))),
      name: row.name.trim(),
      notes: row.notes?.trim() || "From script analysis",
    }));
}

function parsePinnedPlace(raw: ResearchLocationOutput["pinnedPlace"], fallbackName: string, mapQuery: string): LocationPin | null {
  if (!raw && !mapQuery) return null;
  if (raw) {
    const label = (raw.label ?? fallbackName).trim();
    const q = (raw.mapQuery ?? mapQuery ?? label).trim();
    if (!label && !q) return null;
    return {
      label: label || q,
      mapQuery: q || label,
      lat: typeof raw.lat === "number" && Number.isFinite(raw.lat) ? raw.lat : null,
      lng: typeof raw.lng === "number" && Number.isFinite(raw.lng) ? raw.lng : null,
    };
  }
  return createLocationPin(fallbackName, mapQuery);
}

function parseShootSuggestions(
  raw: ResearchLocationOutput["shootSuggestions"],
  name: string,
  notes: string,
  mapQuery: string
): LocationShootSuggestion[] {
  const parsed: LocationShootSuggestion[] = [];
  for (const [i, s] of (raw ?? []).entries()) {
    const title = (s.title ?? "").trim();
    const why = (s.why ?? "").trim();
    const sq = (s.mapQuery ?? mapQuery).trim();
    if (!title && !why && !sq) continue;
    parsed.push({
      id: newShootSuggestionId(`sg-shoot-${i}`),
      title: title || `Shoot near ${name}`,
      why: why || notes || "Suggested filming area.",
      mapQuery: sq || mapQuery,
      status: "pending",
    });
  }

  return parsed.length > 0 ? parsed : buildDefaultShootSuggestions(name, notes, mapQuery);
}

function stagedLocationFromOutput(loc: ResearchLocationOutput, index: number): StagedLocationSuggestion {
  const name = (loc.name ?? "").trim();
  const notes = (loc.notes ?? "").trim();
  const mapQuery = (loc.mapQuery ?? "").trim() || defaultMapQueryForLocation(name, notes);
  return {
    suggestionId: `sg-loc-${Date.now()}-${index}`,
    status: "pending",
    confidence: Math.min(100, Math.max(0, Math.round(loc.confidence ?? 70))),
    name,
    notes,
    sceneNumbers: Array.isArray(loc.sceneNumbers)
      ? loc.sceneNumbers.filter((n) => typeof n === "number" && Number.isFinite(n))
      : undefined,
    mapQuery,
    pinnedPlace: parsePinnedPlace(loc.pinnedPlace, name, mapQuery),
    shootSuggestions: parseShootSuggestions(loc.shootSuggestions, name, notes, mapQuery),
    rulesAndLimitations: Array.isArray(loc.rulesAndLimitations)
      ? loc.rulesAndLimitations.filter((r): r is string => typeof r === "string" && r.trim().length > 0)
      : [],
  };
}

export async function runResearchAgent(input: {
  scenes: SceneRow[];
  memory: AgentProjectMemory;
  refineHint?: string;
  screenplayExcerpt?: string;
}): Promise<{
  researchNotes: string;
  characters: StagedCharacterSuggestion[];
  locations: StagedLocationSuggestion[];
}> {
  const scriptText = input.screenplayExcerpt ?? "";
  const parsedLocal = scriptText ? parseCharactersFromScreenplay(scriptText) : [];

  const system = `You are the Research sub-agent for film and documentary pre-production.
Your job is an EXHAUSTIVE cast and location breakdown from the screenplay.

Characters — include EVERY:
- Speaking role (every ALL-CAPS cue with dialogue)
- Character with parenthetical age or modifier, e.g. GUSTAV (49), ANNA (V.O.)
- Interview subjects, narrators, voice-over, off-screen speakers
- Characters only mentioned in action if they are story-relevant
- Do NOT merge different characters into one entry
- Do NOT omit minor roles with one line

Locations — include EVERY distinct filming place (not time-of-day alone).
For each location also provide:
- mapQuery: real-world search string for Google Maps (city/region/country when inferable)
- pinnedPlace: { label, mapQuery } for the primary pin (lat/lng null unless you know coordinates)
- shootSuggestions: 1–3 concrete places to scout (title, why, mapQuery each)
- rulesAndLimitations: permits, access, weather, noise, safety, or budget constraints

Output ONLY valid JSON. researchNotes under 900 words.`;

  const user = [
    memoryContextBlock(input.memory),
    input.refineHint ? `Refine: ${input.refineHint}` : null,
    "Scene list:",
    isolateSceneSummaries(input.scenes),
    parsedLocal.length
      ? `Local script scan found ${parsedLocal.length} character${parsedLocal.length === 1 ? "" : "s"} — verify and expand:\n${parsedLocal.map((c) => `• ${c.name}${c.notes ? ` (${c.notes})` : ""}`).join("\n")}`
      : null,
    scriptText
      ? `Full script excerpt (read entire cast):\n${scriptText.slice(0, 14000)}`
      : null,
    "JSON schema:",
    JSON.stringify({
      researchNotes: "World summary: cast size, locations, tone",
      characters: [
        { name: "Anna", notes: "protagonist, 20s, drives Act 1", confidence: 90 },
        { name: "Gustav", notes: "49, antagonist pressure", confidence: 88 },
      ],
      locations: [
        {
          name: "Wheat fields",
          notes: "exterior harvest",
          confidence: 80,
          sceneNumbers: [1],
          mapQuery: "Skåne wheat fields Sweden",
          pinnedPlace: { label: "Harvest fields", mapQuery: "Skåne wheat fields Sweden", lat: null, lng: null },
          shootSuggestions: [
            {
              title: "Open farmland east of Malmö",
              why: "Flat horizon, golden hour",
              mapQuery: "farmland east Malmö Sweden",
            },
          ],
          rulesAndLimitations: ["Landowner permission required", "No drones without permit"],
        },
      ],
    }),
  ]
    .filter(Boolean)
    .join("\n\n");

  const out = await callSubAgentJson<ResearchOutput>(system, user, 8192);

  const aiCharacters = stagedCharactersFromRows(out.characters ?? [], "sg-char");
  const localCharacters = stagedCharactersFromRows(
    parsedLocal.map((c) => ({
      name: c.name,
      notes: c.notes,
      confidence: Math.min(95, 68 + c.dialogueBlocks * 4),
    })),
    "sg-char-local"
  );

  const characters = mergeCharacterRows(aiCharacters, localCharacters);

  const locations: StagedLocationSuggestion[] = (out.locations ?? [])
    .filter((loc) => {
      const name = (loc.name ?? "").trim();
      return name.length > 0 && !/^(day|night|dawn|dusk)$/i.test(name);
    })
    .map((loc, i) => stagedLocationFromOutput(loc, i));

  const castLine =
    characters.length > 0
      ? `${characters.length} character${characters.length === 1 ? "" : "s"} identified from script.`
      : null;

  const researchNotes = [out.researchNotes?.trim(), castLine].filter(Boolean).join("\n\n");

  return {
    researchNotes,
    characters,
    locations,
  };
}

function mergeCharacterRows(
  primary: StagedCharacterSuggestion[],
  supplemental: StagedCharacterSuggestion[]
): StagedCharacterSuggestion[] {
  const seen = new Set(primary.map((c) => c.name.trim().toLowerCase()).filter(Boolean));
  const merged = [...primary];
  for (const row of supplemental) {
    const key = row.name.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
  }
  return merged.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}
