import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import type { ProjectStatePayload } from "@/lib/pro/types";
import type { LookTabId, PrepStepId, ProductionTabId, WorkspaceMode } from "@/lib/pro/workspace-modes";
import { defaultProductionTabForState } from "@/lib/pro/workspace-modes";
import type { UnifiedPipelineStep } from "@/lib/pro/workspace-step-progress";

/** Map unified stepper tap → workspace mode + sub-location. Always resets to the phase entry point. */
export function resolveUnifiedStepNavigation(
  step: UnifiedPipelineStep,
  state: ProjectStatePayload
): {
  mode: WorkspaceMode;
  prepStep?: PrepStepId;
  lookTab?: LookTabId;
  productionTab?: ProductionTabId;
} {
  switch (step) {
    case "script":
      return { mode: "prep", prepStep: "script" };
    case "look":
      return { mode: "look", lookTab: "photos" };
    case "finish": {
      if (isScriptToPromptTemplate(state.directorPrep.appliedTemplateId)) {
        return { mode: "production", productionTab: "prompts" };
      }
      return { mode: "production", productionTab: defaultProductionTabForState(state) };
    }
  }
}

/** Prep sub-steps shown under the Script phase — never duplicate the phase label "Script". */
export function prepSubTabsForPhase(
  tabs: { id: PrepStepId; label: string }[]
): { id: PrepStepId; label: string }[] {
  return tabs.filter((t) => t.id !== "script");
}

export function scriptPhaseHint(prepStep: PrepStepId, hasScript = false): string {
  switch (prepStep) {
    case "script":
      return hasScript
        ? "Script loaded — open Run prep to build your prompt pack."
        : "Try the 3-scene demo or paste a script, then run prep on Run prep.";
    case "generate":
      return "Run prep and review scenes for your prompt pack.";
    case "download":
      return "Download prep report or continue to Look.";
  }
}
