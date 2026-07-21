/**
 * Script-to-prompt workspace IA — 3-step pipeline (Script → Look → Finish).
 * Step 3 sub-nav: Shots → Prompts → Kit → Workflow → … → Export → Sign-off.
 * Legacy projects keep Prep · Look · Produce · Post from workspace-modes.
 */
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import type { ProjectStatePayload } from "@/lib/pro/types";
import type { LookTabId, PrepStepId, ProductionTabId, WorkspaceMode } from "@/lib/pro/workspace-modes";
import { WORKSPACE_MODES } from "@/lib/pro/workspace-modes";

export type WorkspacePipelineStep = "script" | "look" | "finish";

export type WorkspaceNavItem = {
  id: WorkspacePipelineStep | WorkspaceMode;
  label: string;
  hint: string;
};

export const SCRIPT_TO_PROMPT_PIPELINE: WorkspaceNavItem[] = [
  { id: "script", label: "Script", hint: "Paste · look rules · prep" },
  { id: "look", label: "Look", hint: "Palette · mood · check" },
  { id: "finish", label: "Finish", hint: "Prompts · kit · export" },
];

export function usesScriptToPromptPipeline(state: ProjectStatePayload): boolean {
  return isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);
}

export function workspaceNavForState(state: ProjectStatePayload): WorkspaceNavItem[] {
  if (usesScriptToPromptPipeline(state)) return SCRIPT_TO_PROMPT_PIPELINE;
  return WORKSPACE_MODES;
}

/** All look tabs — mobile uses primary / More split like legacy. */
export function lookTabsForState(
  state: ProjectStatePayload,
  allTabs: { id: LookTabId; label: string }[]
): { id: LookTabId; label: string }[] {
  return allTabs;
}

/** Map current workspace location to top-level pipeline step (script-to-prompt only). */
export function activePipelineStep(
  state: ProjectStatePayload,
  mode: WorkspaceMode,
  _productionTab: ProductionTabId,
  _lookTab: LookTabId
): WorkspacePipelineStep | null {
  if (!usesScriptToPromptPipeline(state)) return null;
  if (mode === "prep") return "script";
  if (mode === "look") return "look";
  if (mode === "production" || mode === "post") return "finish";
  return "script";
}

export function resolvePipelineStepNavigation(
  step: WorkspacePipelineStep,
  prepStep: PrepStepId = "script"
): {
  mode: WorkspaceMode;
  prepStep?: PrepStepId;
  lookTab?: LookTabId;
  productionTab?: ProductionTabId;
} {
  switch (step) {
    case "script":
      return { mode: "prep", prepStep };
    case "look":
      return { mode: "look", lookTab: "photos" };
    case "finish":
      return { mode: "production", productionTab: "prompts" };
  }
}
