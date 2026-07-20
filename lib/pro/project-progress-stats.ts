import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import { countShotsWithPrompts } from "@/lib/pro/sync-shot-prompts";
import type { ProjectStatePayload } from "@/lib/pro/types";
import { getShotPlanProductionSummary } from "@/lib/pro/shot-plan-stats";

export type ProjectProgressStats = {
  sceneCount: number;
  approvedScenes: number;
  totalShots: number;
  coveragePercent: number;
  hasScript: boolean;
  hasLook: boolean;
  hasShotPlan: boolean;
  /** Rough 0–100 completion for dashboard (legacy projects). */
  percentComplete: number;
  /** Script-to-prompt projects: shots with copy-ready prompts. */
  promptsReady: number;
  /** Total visual beats / prompt slots. */
  totalPromptSlots: number;
  scriptToPrompt: boolean;
  /** One-line dashboard summary. */
  summaryLine: string;
};

export function getProjectProgressStats(state: ProjectStatePayload): ProjectProgressStats {
  const scenes = state.directorPrep.scenes;
  const approvedScenes = scenes.filter((s) => s.status === "approved").length;
  const shotSummary = getShotPlanProductionSummary(state);
  const hasScript = state.directorPrep.screenplay.rawText.trim().length > 0;
  const hasLook =
    state.visualBible.palette.length > 0 ||
    Boolean(state.directorPrep.agentMeta.visualMood.trim());
  const hasShotPlan = shotSummary.totalShots > 0;
  const scriptToPrompt = isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);
  const { total: totalPromptSlots, withPrompt: promptsReady } = countShotsWithPrompts(state);

  let score = 0;
  if (hasScript) score += 25;
  if (approvedScenes > 0) score += 25;
  if (scriptToPrompt) {
    if (promptsReady > 0) score += 50;
  } else {
    if (hasShotPlan) score += 30;
    if (shotSummary.coveragePercent >= 50) score += 20;
  }

  const summaryLine = scriptToPrompt
    ? `${approvedScenes} scenes · ${promptsReady}/${totalPromptSlots || promptsReady} prompts`
    : `${approvedScenes} scenes · ${Math.min(100, score)}%`;

  return {
    sceneCount: scenes.length,
    approvedScenes,
    totalShots: shotSummary.totalShots,
    coveragePercent: shotSummary.coveragePercent,
    hasScript,
    hasLook,
    hasShotPlan,
    percentComplete: Math.min(100, score),
    promptsReady,
    totalPromptSlots,
    scriptToPrompt,
    summaryLine,
  };
}
