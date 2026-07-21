import { getToolByRank } from "@/app/data";
import { buildShotToolPrompt } from "@/lib/pro/build-shot-tool-prompt";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import { suggestToolForBeat } from "@/lib/pro/prompt-engine/suggest-prompt-tool";
import {
  PHASE4_PROMPT_TOOL_RANKS,
  isPhase4PromptToolRank,
} from "@/lib/pro/prompt-engine/types";
import { kitEntriesFromState } from "@/lib/pro/kit-display";
import {
  SCRIPT_TO_PROMPT_DEFAULT_TOOL_RANKS,
  SCRIPT_TO_PROMPT_KIT_RANKS,
} from "@/lib/pro/script-to-prompt-template";
import type { PlannedShot, ProjectStatePayload } from "@/lib/pro/types";

export type PromptToolOption = {
  rank: number;
  name: string;
};

function orderedToolRanks(state: ProjectStatePayload): number[] {
  const scriptToPrompt = isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);
  if (scriptToPrompt) {
    return [...PHASE4_PROMPT_TOOL_RANKS];
  }
  const kitRanks = kitEntriesFromState(state.kit).map((k) => k.catalogRank);
  return [
    ...kitRanks,
    ...SCRIPT_TO_PROMPT_KIT_RANKS,
    ...SCRIPT_TO_PROMPT_DEFAULT_TOOL_RANKS,
  ];
}

/** Tools available for per-shot prompt formatting. */
export function promptToolOptions(state: ProjectStatePayload): PromptToolOption[] {
  const seen = new Set<number>();
  const out: PromptToolOption[] = [];
  for (const rank of orderedToolRanks(state)) {
    if (seen.has(rank)) continue;
    const tool = getToolByRank(rank);
    if (!tool) continue;
    seen.add(rank);
    out.push({ rank, name: tool.name });
  }
  return out;
}

export function defaultPromptToolRank(state: ProjectStatePayload): number {
  return 6;
}

export function resolvePromptToolRank(
  shot: PlannedShot,
  opts?: { forceRouting?: boolean; fallback?: number }
): number {
  if (shot.recommendedToolRank && !opts?.forceRouting) {
    return shot.recommendedToolRank;
  }
  const suggested = suggestToolForBeat(shot.shotType, shot.label);
  return suggested.rank;
}

export function toolSuggestionForShot(shot: PlannedShot) {
  return suggestToolForBeat(shot.shotType, shot.label);
}

function patchShotPrompt(
  state: ProjectStatePayload,
  shot: PlannedShot,
  sequence: (typeof state.shotPlan.sequences)[number],
  toolRank: number
): PlannedShot {
  const rank = isPhase4PromptToolRank(toolRank) ? toolRank : 6;
  const built = buildShotToolPrompt({ state, shot, sequence, toolRank: rank });
  return {
    ...shot,
    recommendedToolRank: rank,
    aiGenerationPrompt: built.prompt,
    aiNegativePrompt: built.negativePrompt,
  };
}

/** Fill or refresh aiGenerationPrompt on every shot from script + look + shot metadata. */
export function syncShotPromptsInState(
  state: ProjectStatePayload,
  opts?: { toolRank?: number; onlyEmpty?: boolean; applyRouting?: boolean; forceRouting?: boolean }
): ProjectStatePayload {
  const onlyEmpty = opts?.onlyEmpty ?? false;
  const useRouting =
    opts?.applyRouting ??
    isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);
  const fallback = opts?.toolRank ?? defaultPromptToolRank(state);

  const sequences = state.shotPlan.sequences.map((seq) => ({
    ...seq,
    shots: seq.shots.map((shot) => {
      if (onlyEmpty && shot.aiGenerationPrompt?.trim()) return shot;
      const rank = useRouting
        ? resolvePromptToolRank(shot, { forceRouting: opts?.forceRouting, fallback })
        : (shot.recommendedToolRank ?? fallback);
      return patchShotPrompt(state, shot, seq, rank);
    }),
  }));

  return { ...state, shotPlan: { sequences } };
}

/** Update one shot's prompt after tool or text edit. */
export function rebuildShotPromptInState(
  state: ProjectStatePayload,
  seqIndex: number,
  shotIndex: number,
  toolRank: number
): ProjectStatePayload {
  const sequences = state.shotPlan.sequences.map((seq, si) => {
    if (si !== seqIndex) return seq;
    return {
      ...seq,
      shots: seq.shots.map((shot, shi) => {
        if (shi !== shotIndex) return shot;
        return patchShotPrompt(state, shot, seq, toolRank);
      }),
    };
  });
  return { ...state, shotPlan: { sequences } };
}

export function countShotsWithPrompts(state: ProjectStatePayload): {
  total: number;
  withPrompt: number;
} {
  let total = 0;
  let withPrompt = 0;
  for (const seq of state.shotPlan.sequences) {
    for (const shot of seq.shots) {
      total += 1;
      if (shot.aiGenerationPrompt?.trim()) withPrompt += 1;
    }
  }
  return { total, withPrompt };
}
