import { callSubAgentJson } from "@/lib/pro/agents/anthropic-client";
import { memoryContextBlock, rulesBlock, isolateSceneSummaries } from "@/lib/pro/agents/context";
import type {
  AgentProjectMemory,
  DirectorRulesState,
  SceneRow,
  WorldBibleState,
} from "@/lib/pro/types";

type WorldBibleAgentOutput = {
  notes: string;
  characters: string[];
  locations: string[];
};

export async function runWorldBibleAgent(input: {
  rules: DirectorRulesState;
  screenplayRaw: string;
  title: string;
  scenes: SceneRow[];
  memory: AgentProjectMemory;
  existing?: WorldBibleState;
}): Promise<WorldBibleState> {
  const system = `You are the World Bible sub-agent for film and documentary pre-production.
Read the full screenplay and extract EVERY distinct character and filming location.
Include interview subjects, narrators, speaking roles, and named people referenced on screen.
Include standard INT./EXT. sets, documentary field locations, homes, workplaces, and recurring places.
Do not use time-of-day alone as a location (never "Day" or "Night" as the place name).
Output ONLY valid JSON. Be exhaustive — missing a character or location hurts production.`;

  const user = [
    memoryContextBlock(input.memory),
    `Director rules:\n${rulesBlock(input.rules)}`,
    input.title ? `Title: ${input.title}` : null,
    input.existing?.notes.trim()
      ? `Existing world notes (refine and expand):\n${input.existing.notes.trim()}`
      : null,
    "Scene summaries (cross-check against the script):",
    isolateSceneSummaries(input.scenes),
    "Requirements:",
    "- List ALL speaking characters, interview subjects, and key named people.",
    "- List ALL distinct filming locations / sets / recurring places.",
    "- Character entries: `Name — role or relationship` (one per line in JSON array).",
    "- Location entries: `Place name — brief note` (place name first, not time of day).",
    "- Notes: setting, tone, period, relationships, documentary vérité rules if relevant.",
    "JSON schema:",
    JSON.stringify({
      notes: "2-4 short paragraphs of world rules and story truth",
      characters: ["Maria Lopez — farmer, interview subject", "James — son"],
      locations: ["Family house — main interview space", "Wheat fields — exterior B-roll"],
    }),
    "Screenplay:",
    input.screenplayRaw,
  ]
    .filter(Boolean)
    .join("\n\n");

  const out = await callSubAgentJson<WorldBibleAgentOutput>(system, user, 8192);

  return {
    notes: (out.notes ?? "").trim(),
    characters: normalizeLines(out.characters),
    locations: normalizeLocationLines(out.locations),
  };
}

function normalizeLines(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((s) => s.trim());
}

function normalizeLocationLines(values: unknown): string[] {
  return normalizeLines(values).filter((line) => {
    const name = line.split(/\s+[-–—]\s+/)[0]?.trim() ?? line;
    return !/^(day|night|dawn|dusk|morning|evening)$/i.test(name);
  });
}
