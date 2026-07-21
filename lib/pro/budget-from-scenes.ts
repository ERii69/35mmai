import {
  BUDGET_DEFAULT_LOW_ROWS,
  BUDGET_DEFAULT_MICRO_ROWS,
  budgetLinesFromPreset,
} from "@/app/data";
import type { DirectorBudgetTier } from "@/lib/pro/types";

const TIER_SCALE: Record<DirectorBudgetTier, number> = {
  indie: 1,
  mid: 1.5,
  high: 2,
};

export type BudgetFromScenesSuggestion = {
  approvedSceneCount: number;
  budgetTier: DirectorBudgetTier;
  microTools: ReturnType<typeof budgetLinesFromPreset>;
  lowTools: ReturnType<typeof budgetLinesFromPreset>;
  summary: string;
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

/** Deterministic budget suggestion from approved scenes + director budget tier. */
export function suggestBudgetFromScenes(
  approvedSceneCount: number,
  budgetTier: DirectorBudgetTier
): BudgetFromScenesSuggestion {
  const scenes = Math.max(0, approvedSceneCount);
  const tierScale = TIER_SCALE[budgetTier];
  const sceneScale = scenes === 0 ? 1 : Math.max(1, Math.ceil(scenes / 5));
  const multiplier = sceneScale * tierScale;

  const microTools = scalePresetRows(BUDGET_DEFAULT_MICRO_ROWS, multiplier);
  const lowTools =
    budgetTier === "indie"
      ? []
      : scalePresetRows(BUDGET_DEFAULT_LOW_ROWS, Math.max(1, multiplier * 0.75));

  return {
    approvedSceneCount: scenes,
    budgetTier,
    microTools,
    lowTools,
    summary: `${scenes} approved scene${scenes === 1 ? "" : "s"} · ${budgetTier} tier · scaled preset lines (review before applying).`,
  };
}
