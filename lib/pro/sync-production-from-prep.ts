import { suggestBudgetFromScenes } from "@/lib/pro/budget-from-scenes";
import {
  hasShotPlanForBudget,
  suggestBudgetFromShotPlan,
} from "@/lib/pro/budget-from-shot-plan";
import type { DirectorBudgetTier, ProjectStatePayload } from "@/lib/pro/types";

/** Pull budget band + tool presets from prep run into Production tabs. */
export function syncProductionFromPrep(state: ProjectStatePayload): ProjectStatePayload {
  const dp = state.directorPrep;
  const approvedCount = dp.scenes.filter((s) => s.status === "approved").length;
  const tier = dp.directorRules.budgetTier;
  const stagingBudget = dp.agentStaging?.budget;
  const budgetTier: DirectorBudgetTier =
    stagingBudget?.status === "approved" ? stagingBudget.tier : tier;

  const suggestion = hasShotPlanForBudget(state)
    ? suggestBudgetFromShotPlan(state)
    : suggestBudgetFromScenes(Math.max(1, approvedCount), budgetTier);
  const tierLabel =
    budgetTier === "high" ? "High" : budgetTier === "mid" ? "Mid" : "Indie / micro";

  return {
    ...state,
    budget: {
      ...state.budget,
      microTools: suggestion.microTools,
      lowTools: suggestion.lowTools,
      selectedBudget:
        dp.agentMeta.budgetSummaryText.trim().slice(0, 200) ||
        state.budget.selectedBudget ||
        `${tierLabel} — ${approvedCount} approved scene${approvedCount === 1 ? "" : "s"}`,
      selectedRole: state.budget.selectedRole ?? "Director / producer",
    },
  };
}

export function prepProductionHints(state: ProjectStatePayload): string[] {
  const hints: string[] = [];
  const approved = state.directorPrep.scenes.filter((s) => s.status === "approved").length;
  if (approved > 0 && state.shotPlan.sequences.length === 0) {
    hints.push(`${approved} approved scene${approved === 1 ? "" : "s"} — generate shot plan in Shots tab.`);
  }
  if (state.directorPrep.agentMeta.budgetSummaryText && !state.budget.selectedBudget) {
    hints.push("Prep budget summary ready — sync to Budget tab.");
  }
  if (state.directorPrep.agentMeta.lastRunAt && state.budget.microTools.length === 0) {
    hints.push("Apply budget tools from your last prep run.");
  }
  return hints;
}
