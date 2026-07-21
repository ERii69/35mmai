import { getNextWorkspaceStep, type NextWorkspaceStep } from "@/lib/pro/next-workspace-step";
import type { ProjectStatePayload } from "@/lib/pro/types";
import type { LookTabId, PrepStepId, ProductionTabId, WorkspaceMode } from "@/lib/pro/workspace-modes";

/** Unified 3-step IA — Script → Look → Finish (legacy Produce/Post map to Finish). */
export type UnifiedPipelineStep = "script" | "look" | "finish";

export const UNIFIED_WORKSPACE_STEPS: {
  id: UnifiedPipelineStep;
  label: string;
  hint: string;
}[] = [
  { id: "script", label: "Script", hint: "Paste script and vision, then run Script → Run prep." },
  { id: "look", label: "Look", hint: "Palette, mood board, and consistency checks." },
  { id: "finish", label: "Finish", hint: "Prompts, export, and sign-off." },
];

export function unifiedActiveStep(
  mode: WorkspaceMode,
  _state?: ProjectStatePayload
): UnifiedPipelineStep {
  if (mode === "prep") return "script";
  if (mode === "look") return "look";
  return "finish";
}

export function nextStepUnifiedPhase(step: NextWorkspaceStep): UnifiedPipelineStep {
  if (step.mode === "prep") return "script";
  if (step.mode === "look") return "look";
  return "finish";
}

export type StepVisualStatus = "complete" | "active" | "upcoming" | "suggested";

export function unifiedStepStatuses(
  state: ProjectStatePayload,
  mode: WorkspaceMode,
  prepStep: PrepStepId,
  lookTab: LookTabId,
  productionTab: ProductionTabId
): Record<UnifiedPipelineStep, StepVisualStatus> {
  const active = unifiedActiveStep(mode, state);
  const next = getNextWorkspaceStep(state);
  const suggested = next ? nextStepUnifiedPhase(next) : null;

  const hasScript = state.directorPrep.screenplay.rawText.trim().length > 0;
  const approved = state.directorPrep.scenes.filter((s) => s.status === "approved").length;
  const hasLook =
    state.visualBible.palette.length > 0 ||
    Boolean(state.directorPrep.agentMeta.visualMood.trim());

  const scriptDone = approved > 0;
  const lookDone = hasLook && approved > 0;
  const finishDone =
    state.postChecklist.items.length > 0 &&
    state.postChecklist.items.every((i) => i.done);

  function statusFor(step: UnifiedPipelineStep): StepVisualStatus {
    if (step === active) return "active";
    if (step === suggested && step !== active) return "suggested";
    if (step === "script" && scriptDone) return "complete";
    if (step === "look" && lookDone) return "complete";
    if (step === "finish" && finishDone) return "complete";
    return "upcoming";
  }

  return {
    script: statusFor("script"),
    look: statusFor("look"),
    finish: statusFor("finish"),
  };
}

export function isNextStepLocation(
  state: ProjectStatePayload,
  mode: WorkspaceMode,
  prepStep: PrepStepId,
  lookTab: LookTabId,
  productionTab: ProductionTabId
): boolean {
  const next = getNextWorkspaceStep(state);
  if (!next) return false;
  if (next.mode !== mode) return false;
  if (next.prepStep && next.prepStep !== prepStep) return false;
  if (next.lookTab && next.lookTab !== lookTab) return false;
  if (next.productionTab && next.productionTab !== productionTab) return false;
  return true;
}
