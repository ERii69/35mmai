import { getToolByRank, workflowStages } from "@/app/data";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import type { ProjectStatePayload } from "@/lib/pro/types";

const GENRE_KIT_RANKS: Record<string, number[]> = {
  drama: [4, 6, 1, 18, 52],
  narrative: [4, 6, 52, 18],
  documentary: [1, 12, 15, 54, 55],
  interview: [1, 12, 15, 54],
  horror: [1, 6, 2, 18],
  thriller: [1, 6, 2, 18, 52],
  comedy: [4, 6, 5, 18],
  scifi: [1, 2, 6, 18, 8],
  "sci-fi": [1, 2, 6, 18, 8],
  action: [1, 2, 54, 55, 18],
};

const TIER_STARTER: Record<string, number[]> = {
  indie: [1, 4, 6, 12, 18, 52],
  mid: [1, 2, 4, 6, 14, 18, 52, 53],
  high: [1, 2, 3, 7, 8, 14, 18, 52, 53],
};

const SHOT_TYPE_RANKS: Partial<Record<string, number[]>> = {
  aerial: [54, 55],
  dolly: [54],
};

export type RecommendedKitItem = {
  rank: number;
  reason: string;
};

/** Ranked tool suggestions from genre, budget tier, workflow phase, and shot plan. */
export function getRecommendedKitRanks(state: ProjectStatePayload): RecommendedKitItem[] {
  const seen = new Set<number>();
  const out: RecommendedKitItem[] = [];

  function push(rank: number, reason: string) {
    if (seen.has(rank) || !getToolByRank(rank)) return;
    seen.add(rank);
    out.push({ rank, reason });
  }

  const rules = state.directorPrep.directorRules;
  for (const tag of rules.genreTags) {
    const key = tag.toLowerCase().trim();
    const ranks = GENRE_KIT_RANKS[key];
    if (ranks) {
      for (const r of ranks) push(r, `Matches genre “${tag}”`);
    }
  }

  for (const r of TIER_STARTER[rules.budgetTier] ?? TIER_STARTER.indie) {
    push(r, `${rules.budgetTier} budget starter`);
  }

  const stage = workflowStages[state.workflow.stageIndex];
  if (stage) {
    for (const step of stage.steps) {
      for (const r of step.tools) {
        push(r, `Used in ${stage.title}: ${step.step}`);
      }
    }
  }

  for (const seq of state.shotPlan.sequences) {
    for (const shot of seq.shots) {
      const extra = SHOT_TYPE_RANKS[shot.shotType];
      if (extra) {
        for (const r of extra) push(r, `Supports ${shot.shotType} shots`);
      }
    }
  }

  if (
    !isScriptToPromptTemplate(state.directorPrep.appliedTemplateId) &&
    state.directorPrep.scenes.some((s) => s.status === "approved")
  ) {
    push(52, "Scheduling / day-out-of-days when scenes are approved");
    push(14, "Script breakdown / tagging");
  }

  return out.slice(0, 8);
}
