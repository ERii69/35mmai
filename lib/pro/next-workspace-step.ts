import { buildScriptToPromptPackState, scriptToPromptPackReady } from "@/lib/pro/build-script-to-prompt-pack";
import { kitEntriesFromState } from "@/lib/pro/kit-display";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import type { ProjectStatePayload } from "@/lib/pro/types";
import type { LookTabId, PrepStepId, ProductionTabId, WorkspaceMode } from "@/lib/pro/workspace-modes";

export type NextWorkspaceStep = {
  id: string;
  title: string;
  detail: string;
  mode: WorkspaceMode;
  productionTab?: ProductionTabId;
  prepStep?: PrepStepId;
  lookTab?: LookTabId;
};

/** Single “do this next” hint for workspace guidance banners. */
export function getNextWorkspaceStep(state: ProjectStatePayload): NextWorkspaceStep | null {
  const approved = state.directorPrep.scenes.filter((s) => s.status === "approved").length;
  const hasScript = state.directorPrep.screenplay.rawText.trim().length > 0;
  const hasLook =
    state.visualBible.palette.length > 0 ||
    Boolean(state.directorPrep.agentMeta.visualMood.trim());
  const kitCount = kitEntriesFromState(state.kit).length;
  const scriptToPrompt = isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);

  if (!hasScript && state.directorPrep.scenes.length === 0) {
    return {
      id: "add-script",
      title: "Add your screenplay",
      detail: scriptToPrompt
        ? "Start in Script — paste your screenplay and look rules."
        : "Start in Prep with script paste or upload.",
      mode: "prep",
      prepStep: "script",
    };
  }

  if (hasScript && approved === 0 && state.directorPrep.scenes.length > 0) {
    return {
      id: "approve-scenes",
      title: "Review and approve scenes",
      detail: scriptToPrompt
        ? "Open Script → Run prep, then approve scenes for your prompt pack."
        : "Finish Script → Generate and add results to your project.",
      mode: "prep",
      prepStep: "generate",
    };
  }

  if (approved > 0 && !hasLook) {
    return {
      id: "lock-look",
      title: "Lock your look",
      detail: scriptToPrompt
        ? "Set palette and mood in Look — every prompt inherits these rules."
        : "Generate a mood board in Look before locking visual notes.",
      mode: "look",
      lookTab: "photos",
    };
  }

  if (scriptToPrompt && approved > 0 && hasLook) {
    const packReady = scriptToPromptPackReady(state);
    if (!packReady) {
      return {
        id: "build-prompts",
        title: "Build your prompt pack",
        detail: "Open Finish → Prompts — copy-ready lines from approved scenes.",
        mode: "production",
        productionTab: "prompts",
      };
    }
    return {
      id: "export-pack",
      title: "Export your prompt pack",
      detail: "Finish → Export: download Markdown or CSV for Midjourney, Kling, LTX, and your kit.",
      mode: "production",
      productionTab: "export",
    };
  }

  const hasShots = state.shotPlan.sequences.some((s) => s.shots.length > 0);

  if (!scriptToPrompt && approved > 0 && !hasShots) {
    return {
      id: "shot-plan",
      title: "Generate your shot plan",
      detail: "Open Production → Shots to build from approved prep.",
      mode: "production",
      productionTab: "shots",
    };
  }

  if (!scriptToPrompt && hasShots && kitCount === 0) {
    return {
      id: "browse-kit",
      title: "Browse tools for My Kit",
      detail: "Add catalog tools your project needs — search by category, no ranks to type.",
      mode: "production",
      productionTab: "kit",
    };
  }

  if (!scriptToPrompt && hasShots && state.budget.microTools.length === 0) {
    return {
      id: "suggest-budget",
      title: "Suggest a budget",
      detail: "Production → Budget can estimate lines from your shot plan.",
      mode: "production",
      productionTab: "budget",
    };
  }

  if (!scriptToPrompt && hasShots && state.postChecklist.items.length === 0) {
    return {
      id: "start-post",
      title: "Start post-production",
      detail: "Open Post → Sign-off to load delivery steps.",
      mode: "post",
    };
  }

  if (scriptToPrompt && state.postChecklist.items.length === 0 && scriptToPromptPackReady(state)) {
    return {
      id: "sign-off",
      title: "Sign off your project",
      detail: "Finish → Sign-off after you export — checklist before you share.",
      mode: "production",
      productionTab: "finish",
    };
  }

  return null;
}

/** Auto-build prompt pack in state when script-to-prompt project has approved scenes + look. */
export function maybeAutoBuildScriptToPromptPack(
  state: ProjectStatePayload
): ProjectStatePayload {
  if (!isScriptToPromptTemplate(state.directorPrep.appliedTemplateId)) return state;
  const approved = state.directorPrep.scenes.some((s) => s.status === "approved");
  const hasLook =
    state.visualBible.palette.length > 0 ||
    Boolean(state.directorPrep.agentMeta.visualMood.trim());
  if (!approved || !hasLook) return state;
  if (scriptToPromptPackReady(state)) return state;
  return buildScriptToPromptPackState(state);
}
