import { generateShotPlanFromPrep } from "@/lib/pro/generate-shot-plan-from-prep";
import { syncShotPromptsInState } from "@/lib/pro/sync-shot-prompts";
import type { ProjectStatePayload } from "@/lib/pro/types";

/** Build visual beats + copy-ready prompts from approved scenes (no Shots tab required). */
export function buildScriptToPromptPackState(state: ProjectStatePayload): ProjectStatePayload {
  const withBeats = generateShotPlanFromPrep(state);
  return syncShotPromptsInState(withBeats, {
    onlyEmpty: false,
    applyRouting: true,
  });
}

export function scriptToPromptPackReady(state: ProjectStatePayload): boolean {
  const total = state.shotPlan.sequences.reduce((n, seq) => n + seq.shots.length, 0);
  if (total === 0) return false;
  const approved = state.directorPrep.scenes.some((s) => s.status === "approved");
  const hasLook =
    state.visualBible.palette.length > 0 ||
    Boolean(state.directorPrep.agentMeta.visualMood.trim());
  return approved && hasLook;
}
