import { callSubAgentJson } from "@/lib/pro/agents/anthropic-client";
import {
  buildConsistencyUserPrompt,
  buildFullVisualBibleUserPrompt,
  buildMoodBoardUserPrompt,
  CONSISTENCY_JSON_EXAMPLE,
  MOOD_BOARD_JSON_EXAMPLE,
  VISUAL_BIBLE_SYSTEM_PROMPT,
} from "@/lib/pro/agents/prompts/visual-bible-prompts";
import type {
  AgentProjectMemory,
  DirectorRulesState,
  MoodBoardReference,
  ProjectStatePayload,
  SceneRow,
  StagedVisualSuggestion,
  VisualConsistencySeverity,
} from "@/lib/pro/types";

type MoodBoardReferenceRaw = {
  title?: string;
  description?: string;
  technicalNotes?: string;
  whyItFits?: string;
  filmReference?: string;
};

type VisualOutput = {
  mood?: string;
  palette?: string[];
  designNotes?: string;
  lensAndFraming?: string;
  grainAndTexture?: string;
  lightingApproach?: string;
  referenceUrls?: string[];
  moodBoardReferences?: MoodBoardReferenceRaw[];
  confidence?: number;
};

type ConsistencyOutput = {
  summary?: string;
  conflicts?: Array<{
    sceneNumber?: number;
    description?: string;
    severity?: string;
    recommendedFix?: string;
  }>;
};

export type VisualConsistencyAgentResult = {
  summary: string;
  conflicts: Array<{
    sceneNumber: number | null;
    heading: string;
    message: string;
    severity: VisualConsistencySeverity;
    recommendedFix: string;
  }>;
};

function normalizeReferences(raw: MoodBoardReferenceRaw[] | undefined): MoodBoardReference[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r) => r && (r.title || r.description))
    .map((r, i) => ({
      id: `mbr-${Date.now()}-${i}`,
      title: (r.title ?? `Reference ${i + 1}`).trim(),
      description: (r.description ?? "").trim(),
      technicalNotes: (r.technicalNotes ?? "").trim(),
      whyItFits: (r.whyItFits ?? "").trim(),
      filmReference: (r.filmReference ?? "").trim(),
    }))
    .slice(0, 6);
}

function normalizeSeverity(raw: string | undefined): VisualConsistencySeverity {
  const s = (raw ?? "medium").toLowerCase();
  if (s === "low" || s === "info") return "low";
  if (s === "high" || s === "critical") return "high";
  return "medium";
}

function toStagedVisual(out: VisualOutput): StagedVisualSuggestion {
  const refs = normalizeReferences(out.moodBoardReferences);
  const refUrls = Array.isArray(out.referenceUrls)
    ? out.referenceUrls.filter((x) => typeof x === "string")
    : [];
  for (const r of refs) {
    if (r.filmReference && !refUrls.includes(r.filmReference)) refUrls.push(r.filmReference);
  }

  const designParts = [out.designNotes?.trim() ?? ""];
  if (out.lightingApproach?.trim()) {
    designParts.push(`## Lighting approach\n${out.lightingApproach.trim()}`);
  }
  if (refs.length > 0) {
    designParts.push(
      "## Mood board references\n" +
        refs
          .map(
            (r) =>
              `### ${r.title}\n${r.description}\n**Technical:** ${r.technicalNotes}\n**Why it fits:** ${r.whyItFits}${r.filmReference ? `\n**Ref:** ${r.filmReference}` : ""}`
          )
          .join("\n\n")
    );
  }

  return {
    suggestionId: `sg-visual-${Date.now()}`,
    status: "pending",
    confidence: Math.min(100, Math.max(0, Math.round(out.confidence ?? 75))),
    mood: out.mood ?? "",
    palette: Array.isArray(out.palette) ? out.palette.filter((x) => typeof x === "string") : [],
    designNotes: designParts.filter(Boolean).join("\n\n"),
    referenceUrls: refUrls.slice(0, 16),
    moodBoardReferences: refs,
    lensAndFraming: out.lensAndFraming?.trim() ?? "",
    grainAndTexture: out.grainAndTexture?.trim() ?? "",
    lightingApproach: out.lightingApproach?.trim() ?? "",
  };
}

export async function runVisualBibleAgent(input: {
  rules: DirectorRulesState;
  scenes: SceneRow[];
  memory: AgentProjectMemory;
  state: Pick<ProjectStatePayload, "visualBible" | "directorPrep">;
  refineHint?: string;
  moodHint?: string;
  paletteHint?: string;
  mode?: "mood_board" | "full_bible";
}): Promise<StagedVisualSuggestion> {
  const mode = input.mode ?? "mood_board";
  const user =
    mode === "full_bible"
      ? buildFullVisualBibleUserPrompt({
          rules: input.rules,
          scenes: input.scenes,
          memory: input.memory,
          state: input.state,
          refineHint: input.refineHint,
        })
      : buildMoodBoardUserPrompt({
          rules: input.rules,
          scenes: input.scenes,
          memory: input.memory,
          state: input.state,
          moodHint: input.moodHint,
          paletteHint: input.paletteHint,
          refineHint: input.refineHint,
        });

  const out = await callSubAgentJson<VisualOutput>(
    VISUAL_BIBLE_SYSTEM_PROMPT,
    `${user}\n\nJSON schema example:\n${JSON.stringify(MOOD_BOARD_JSON_EXAMPLE, null, 2)}`,
    mode === "full_bible" ? 4096 : 3072
  );

  return toStagedVisual(out);
}

/** AI consistency review against established visual bible. */
export async function runVisualConsistencyAgent(input: {
  state: ProjectStatePayload;
  memory: AgentProjectMemory;
  sceneNumber?: number;
}): Promise<VisualConsistencyAgentResult> {
  const user = buildConsistencyUserPrompt({
    state: input.state,
    memory: input.memory,
    sceneNumber: input.sceneNumber,
  });

  const out = await callSubAgentJson<ConsistencyOutput>(
    VISUAL_BIBLE_SYSTEM_PROMPT,
    `${user}\n\nJSON schema example:\n${JSON.stringify(CONSISTENCY_JSON_EXAMPLE, null, 2)}`,
    2048
  );

  const scenes = input.state.directorPrep.scenes;
  const conflicts = (out.conflicts ?? []).map((c) => {
    const scene = c.sceneNumber != null ? scenes.find((s) => s.number === c.sceneNumber) : undefined;
    return {
      sceneNumber: c.sceneNumber ?? null,
      heading: scene?.heading ?? "",
      message: (c.description ?? "Consistency issue").trim(),
      severity: normalizeSeverity(c.severity),
      recommendedFix: (c.recommendedFix ?? "Align scene notes with the visual bible.").trim(),
    };
  });

  return {
    summary: (out.summary ?? "Consistency review complete.").trim(),
    conflicts,
  };
}
