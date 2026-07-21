import type { BudgetFromScenesSuggestion } from "@/lib/pro/budget-from-scenes";
import {
  BUDGET_DEFAULT_LOW_ROWS,
  BUDGET_DEFAULT_MICRO_ROWS,
  budgetLinesFromPreset,
} from "@/app/data";
import { getShotPlanProductionSummary, kitHintFromShotTypes } from "@/lib/pro/shot-plan-stats";
import type { DirectorBudgetTier, ProjectStatePayload } from "@/lib/pro/types";

const TIER_SCALE: Record<DirectorBudgetTier, number> = {
  indie: 1,
  mid: 1.5,
  high: 2,
};

function scalePresetRows(
  rows: readonly { readonly rank: number; readonly qty: number }[],
  multiplier: number
) {
  return budgetLinesFromPreset(
    rows.map(({ rank, qty }) => ({
      rank,
      qty: Math.max(1, Math.min(12, Math.round(qty * multiplier))),
    }))
  );
}

/** Budget suggestion scaled from shot count, shoot days, and kit hints. */
export function suggestBudgetFromShotPlan(
  state: ProjectStatePayload
): BudgetFromScenesSuggestion {
  const summary = getShotPlanProductionSummary(state);
  const tier = state.directorPrep.directorRules.budgetTier;
  const tierScale = TIER_SCALE[tier];

  const shootDayScale = Math.max(1, Math.ceil(summary.estimatedShootDays));
  const shotScale = summary.totalShots > 0 ? Math.max(1, Math.ceil(summary.totalShots / 18)) : 1;
  const sequenceScale =
    summary.totalSequences > 0 ? Math.max(1, Math.ceil(summary.totalSequences / 4)) : 1;

  const allShots = state.shotPlan.sequences.flatMap((s) => s.shots);
  const kitHints = kitHintFromShotTypes(allShots);
  const kitMul = kitHints.length > 0 ? 1 + kitHints.length * 0.08 : 1;

  const multiplier = shootDayScale * shotScale * sequenceScale * tierScale * kitMul;

  const microTools = scalePresetRows(BUDGET_DEFAULT_MICRO_ROWS, multiplier);
  const lowTools =
    tier === "indie"
      ? []
      : scalePresetRows(BUDGET_DEFAULT_LOW_ROWS, Math.max(1, multiplier * 0.75));

  const kitNote = kitHints.length ? ` Kit hints: ${kitHints.join(", ")}.` : "";

  return {
    approvedSceneCount: summary.approvedSceneCount,
    budgetTier: tier,
    microTools,
    lowTools,
    summary: `${summary.totalShots} shots · ~${summary.estimatedShootDays} shoot day${summary.estimatedShootDays === 1 ? "" : "s"} · ${tier} tier · scaled from shot plan.${kitNote}`,
  };
}

export function hasShotPlanForBudget(state: ProjectStatePayload): boolean {
  return state.shotPlan.sequences.some((s) => s.shots.length > 0);
}

const TIER_GUIDELINE_SHOOT_DAYS: Record<DirectorBudgetTier, number> = {
  indie: 5,
  mid: 12,
  high: 30,
};

/** Warn when shot plan implies more shoot days than the selected budget tier guideline. */
export function getBudgetTierPressureWarning(state: ProjectStatePayload): string | null {
  if (!hasShotPlanForBudget(state)) return null;
  const summary = getShotPlanProductionSummary(state);
  const tier = state.directorPrep.directorRules.budgetTier;
  const guideline = TIER_GUIDELINE_SHOOT_DAYS[tier];
  if (summary.estimatedShootDays <= guideline) return null;
  return `Shot plan implies ~${summary.estimatedShootDays} shoot days — above the ~${guideline}-day guideline for ${tier} tier. Trim shots or raise your tier in Prep → Vision.`;
}
