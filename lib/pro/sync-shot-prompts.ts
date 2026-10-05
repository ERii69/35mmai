import { getToolByRank } from "@/app/data";
import { composeDirectedPrompt, draftFrameSentence, visualPromptToolOptions } from "@/lib/pro/directed-prompt";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import { suggestToolForBeat, toolRankForPromptPack } from "@/lib/pro/prompt-engine/suggest-prompt-tool";
import { PHASE4_PROMPT_TOOL_RANKS } from "@/lib/pro/prompt-engine/types";
import { kitEntriesFromState } from "@/lib/pro/kit-display";
import {
  SCRIPT_TO_PROMPT_DEFAULT_TOOL_RANKS,
  SCRIPT_TO_PROMPT_KIT_RANKS,
} from "@/lib/pro/script-to-prompt-template";
import type { PlannedShot, ProjectStatePayload } from "@/lib/pro/types";

export type PromptToolOption = {
  rank: number;
  name: string;
  suggested?: boolean;
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

/** Tools the filmmaker can paste a visual prompt into. */
export function promptToolOptions(state: ProjectStatePayload): PromptToolOption[] {
  if (isScriptToPromptTemplate(state.directorPrep.appliedTemplateId)) {
    return visualPromptToolOptions();
  }
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
  const suggested = suggestToolForBeat(shot.shotType, shot.label, {
    diversify: opts?.forceRouting === true,
  });
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
  const scene = state.directorPrep.scenes.find((row) => row.number === sequence.sceneNumber);
  const sentence =
    shot.frameSentence == null
      ? draftFrameSentence(scene, shot.shotType)
      : shot.frameSentence.trim();
  if (!sentence) {
    return {
      ...shot,
      frameSentence: "",
      promptEdited: false,
      recommendedToolRank: toolRank,
      aiGenerationPrompt: "",
      aiNegativePrompt: "",
    };
  }
  const built = composeDirectedPrompt({ state, shot, sequence, toolRank, sentence });
  return {
    ...shot,
    frameSentence: sentence,
    promptEdited: false,
    recommendedToolRank: toolRank,
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

  const sequences = state.shotPlan.sequences.map((seq) => {
    const scene = state.directorPrep.scenes.find((s) => s.number === seq.sceneNumber);
    return {
      ...seq,
      shots: seq.shots.map((shot) => {
        if (onlyEmpty && shot.aiGenerationPrompt?.trim()) return shot;
        const rank = useRouting
          ? opts?.forceRouting
            ? resolvePromptToolRank(shot, { forceRouting: true, fallback })
            : shot.recommendedToolRank && !opts?.forceRouting
              ? shot.recommendedToolRank
              : toolRankForPromptPack(shot.shotType, scene)
          : (shot.recommendedToolRank ?? fallback);
        return patchShotPrompt(state, shot, seq, rank);
      }),
    };
  });

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

/** What the Prompts page shows. Fills only empty prompts; leaves hand edits and tool picks. */
export function promptViewState(state: ProjectStatePayload): ProjectStatePayload {
  const existingTotal = state.shotPlan.sequences.reduce((n, seq) => n + seq.shots.length, 0);
  if (existingTotal === 0) return state;
  const { withPrompt, total } = countShotsWithPrompts(state);
  if (withPrompt < total) {
    return syncShotPromptsInState(state, {
      onlyEmpty: true,
      applyRouting: true,
      forceRouting: false,
    });
  }
  return state;
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
