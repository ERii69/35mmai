import { callSubAgentJson } from "@/lib/pro/agents/anthropic-client";
import {
  buildDirectorVisionBlock,
  buildExistingVisualBibleBlock,
  VISUAL_BIBLE_SYSTEM_PROMPT,
} from "@/lib/pro/agents/prompts/visual-bible-prompts";
import { isolateSceneSummaries, memoryContextBlock } from "@/lib/pro/agents/context";
import {
  buildLocalLookReferenceSuggestions,
  type LookReferenceSuggestion,
} from "@/lib/pro/suggest-look-references";
import type { AgentProjectMemory, DirectorRulesState, ProjectStatePayload, SceneRow } from "@/lib/pro/types";

type FindRefsOutput = {
  references?: Array<{
    label?: string;
    why?: string;
    category?: string;
  }>;
};

function normalizeCategory(raw: string | undefined): LookReferenceSuggestion["category"] {
  const c = (raw ?? "film").toLowerCase();
  if (c.includes("photo") || c.includes("artist")) return "artist";
  if (c.includes("search")) return "search";
  if (c.includes("dp") || c.includes("cinematographer")) return "photographer";
  return "film";
}

export async function runLookReferenceAgent(input: {
  rules: DirectorRulesState;
  scenes: SceneRow[];
  memory: AgentProjectMemory;
  state: Pick<ProjectStatePayload, "visualBible" | "directorPrep">;
}): Promise<LookReferenceSuggestion[]> {
  const user = [
    memoryContextBlock(input.memory),
    buildDirectorVisionBlock(input.rules),
    buildExistingVisualBibleBlock(input.state),
    `## Task: Suggest look references

Find 6–8 concrete cinematic look references for this project — real films, DPs, photographers, or art-direction search phrases.

Rules:
- Return film titles (with year when helpful), cinematographers, or photographers — NOT generic tone sentences
- Do NOT invent https URLs or Pinterest links
- Each entry must be searchable (e.g. "Past Lives (2023)", "Roger Deakins — natural window light")
- Match the director's genre, style notes, and tone from Prep
- Skip references already in the locked list above

Scenes for context:
${isolateSceneSummaries(input.scenes)}

JSON schema:
${JSON.stringify(
  {
    references: [
      {
        label: "Aftersun (2022)",
        why: "Handheld intimacy and motivated natural light for festival drama",
        category: "film",
      },
    ],
  },
  null,
  2
)}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const out = await callSubAgentJson<FindRefsOutput>(VISUAL_BIBLE_SYSTEM_PROMPT, user, 2048);

  const suggestions: LookReferenceSuggestion[] = (out.references ?? [])
    .filter((r) => (r.label ?? "").trim().length > 2)
    .map((r, i) => ({
      id: `agent-${Date.now()}-${i}`,
      label: (r.label ?? "").trim(),
      why: (r.why ?? "Suggested for your look bible").trim(),
      category: normalizeCategory(r.category),
    }))
    .slice(0, 8);

  return suggestions.length > 0 ? suggestions : buildLocalLookReferenceSuggestions(input.state as ProjectStatePayload);
}
