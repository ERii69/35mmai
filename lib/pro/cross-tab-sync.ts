import {
  ensureShotPlanFromScript,
  shotPlanHasCoverage,
} from "@/lib/pro/ensure-shot-plan-from-script";
import { migrateShotPlanLegacy } from "@/lib/pro/migrate-shot-plan-legacy";
import { hasShotPlanForBudget, suggestBudgetFromShotPlan } from "@/lib/pro/budget-from-shot-plan";
import { syncProductionFromPrep } from "@/lib/pro/sync-production-from-prep";
import { memoryWithLearnedPreferences } from "@/lib/pro/synthesize-project-memory";
import type { ProjectStatePayload } from "@/lib/pro/types";

/** Keep Prep, Look, and Production aligned after a meaningful change. */
export function applyCrossTabIntelligence(
  state: ProjectStatePayload,
  trigger: "prep" | "look" | "production" | "full"
): ProjectStatePayload {
  let next: ProjectStatePayload = {
    ...state,
    directorPrep: {
      ...state.directorPrep,
      agentMemory: memoryWithLearnedPreferences(
        state.directorPrep.agentMemory,
        state.directorPrep.directorRules,
        state.directorPrep.appliedTemplateId
      ),
    },
  };

  if (trigger === "look" || trigger === "full") {
    next = syncVisualBibleIntoShotPlan(next);
  }

  if (trigger === "production" || trigger === "full") {
    if (hasShotPlanForBudget(next)) {
      const budgetSuggestion = suggestBudgetFromShotPlan(next);
      next = {
        ...next,
        directorPrep: {
          ...next.directorPrep,
          agentMeta: {
            ...next.directorPrep.agentMeta,
            budgetSummaryText: budgetSuggestion.summary,
          },
        },
      };
    }
  }

  if (trigger === "prep" || trigger === "full") {
    next = syncProductionFromPrep(next);
  }

  if (
    (trigger === "prep" || trigger === "full" || trigger === "production") &&
    !shotPlanHasCoverage(next)
  ) {
    next = ensureShotPlanFromScript(next).state;
  }

  return migrateShotPlanLegacy(next);
}

function syncVisualBibleIntoShotPlan(state: ProjectStatePayload): ProjectStatePayload {
  const visualNote = [
    state.visualBible.palette.slice(0, 3).join(", "),
    state.directorPrep.agentMeta.visualMood.trim(),
  ]
    .filter(Boolean)
    .join(" · ")
    .slice(0, 140);

  if (!visualNote) return state;

  const sequences = state.shotPlan.sequences.map((seq) => ({
    ...seq,
    shots: seq.shots.map((shot) =>
      shot.visualBibleNote.trim()
        ? shot
        : { ...shot, visualBibleNote: visualNote }
    ),
  }));

  const scenes = state.directorPrep.scenes.map((scene) => {
    const refs = [...scene.visualRefs];
    for (const url of state.visualBible.referenceUrls.slice(0, 3)) {
      if (!refs.includes(url) && !url.startsWith("data:image")) refs.push(url);
    }
    return { ...scene, visualRefs: refs.slice(0, 8) };
  });

  return {
    ...state,
    shotPlan: { sequences },
    directorPrep: { ...state.directorPrep, scenes },
  };
}

export type CrossTabStatus = {
  prepReady: boolean;
  lookReady: boolean;
  productionReady: boolean;
  postReady: boolean;
  messages: string[];
};

export function getCrossTabStatus(state: ProjectStatePayload): CrossTabStatus {
  const approved = state.directorPrep.scenes.filter((s) => s.status === "approved").length;
  const hasLook =
    state.visualBible.palette.length > 0 ||
    Boolean(state.directorPrep.agentMeta.visualMood.trim());
  const hasShots = state.shotPlan.sequences.length > 0;
  const messages: string[] = [];

  if (approved > 0 && !hasShots) {
    messages.push(`${approved} approved scene${approved === 1 ? "" : "s"} → generate shot plan in Production.`);
  }
  if (approved > 0 && !hasLook) {
    messages.push("Set Look tab palette/mood for stronger shot visual notes.");
  }
  if (hasLook && hasShots) {
    messages.push("Look and shot plan linked via visual bible notes on each shot.");
  }
  if ((state.directorPrep.agentMemory.learnedPreferences ?? []).length > 0) {
    const n = (state.directorPrep.agentMemory.learnedPreferences ?? []).length;
    messages.push(
      `${n} learned preference${n === 1 ? "" : "s"} active for agents.`
    );
  }

  const postStarted = state.postChecklist.items.length > 0;

  return {
    prepReady: approved > 0 || state.directorPrep.scenes.length > 0,
    lookReady: hasLook,
    productionReady: hasShots || state.budget.microTools.length > 0,
    postReady: postStarted,
    messages,
  };
}
