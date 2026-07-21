"use client";

import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { DirectorPrepWizard } from "@/components/pro/DirectorPrepWizard";
import { ProAdvancedPrepDrawer } from "@/components/pro/ProAdvancedPrepDrawer";
import { ProjectMemoryPanel } from "@/components/pro/ProjectMemoryPanel";
import { proFocus } from "@/components/pro/ux/pro-surfaces";
import {
  buildTemplateState,
  DEFAULT_DIRECTOR_PREP_TEMPLATE_ID,
  isDirectorPrepTemplateId,
  mergeDirectorPrepTemplate,
  type ProTemplateId,
} from "@/lib/pro/templates";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import type { WorkspaceTabId } from "@/lib/pro/playbook-steps";
import type { PrepStepId } from "@/lib/pro/workspace-modes";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  projectId: string;
  projectName: string;
  state: ProjectStatePayload;
  claudeAgentsEnabled: boolean;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  onOpenProduction?: () => void;
  onOpenPrompts?: () => void;
  onGoToExport?: () => void;
  onTemplateApplied: (state: ProjectStatePayload, updatedAt: string) => void;
  onGoToTab?: (tab: WorkspaceTabId, stepId?: string) => void;
  prepStep: PrepStepId;
  onPrepStepChange: (step: PrepStepId) => void;
  onReviewPhaseChange?: (inReview: boolean) => void;
  onGoToLook?: () => void;
  onSkipNextAutosave?: () => void;
  onGoToPost?: () => void;
  usesPipeline?: boolean;
  advancedOpen?: boolean;
  onAdvancedOpenChange?: (open: boolean) => void;
  onOpenWorkflow?: () => void;
};

export function DirectorPrepPanel({
  projectId,
  projectName,
  state,
  claudeAgentsEnabled,
  updateState,
  onOpenProduction,
  onOpenPrompts,
  onGoToExport,
  onTemplateApplied,
  onGoToTab,
  prepStep,
  onPrepStepChange,
  onReviewPhaseChange,
  onGoToLook,
  onSkipNextAutosave,
  onGoToPost,
  usesPipeline = false,
  advancedOpen = false,
  onAdvancedOpenChange,
  onOpenWorkflow,
}: Props) {
  const [pickerTemplateId, setPickerTemplateId] = useState(
    () => state.directorPrep.appliedTemplateId ?? DEFAULT_DIRECTOR_PREP_TEMPLATE_ID
  );
  const dp = state.directorPrep;
  const scriptToPrompt = isScriptToPromptTemplate(dp.appliedTemplateId);
  const inUseTemplateId = dp.appliedTemplateId;

  useEffect(() => {
    if (inUseTemplateId) setPickerTemplateId(inUseTemplateId);
  }, [inUseTemplateId]);

  function handleTemplateApplied(next: ProjectStatePayload, updatedAt: string) {
    let applied = next;
    const targetId = pickerTemplateId;
    if (
      targetId &&
      isDirectorPrepTemplateId(targetId) &&
      applied.directorPrep.appliedTemplateId !== targetId
    ) {
      const fresh = buildTemplateState(targetId as ProTemplateId);
      applied = mergeDirectorPrepTemplate(applied, fresh);
    }
    const inUseId = applied.directorPrep.appliedTemplateId ?? DEFAULT_DIRECTOR_PREP_TEMPLATE_ID;
    setPickerTemplateId(inUseId);
    onTemplateApplied(applied, updatedAt);
  }

  return (
    <div
      className={
        scriptToPrompt
          ? "relative"
          : "relative xl:grid xl:grid-cols-[minmax(0,1fr)_min(20rem,28vw)] xl:items-start xl:gap-8"
      }
    >
      <div className="min-w-0">
        <DirectorPrepWizard
          projectId={projectId}
          projectName={projectName}
          state={state}
          prepTemplateId={pickerTemplateId}
          claudeAgentsEnabled={claudeAgentsEnabled}
          updateState={updateState}
          onOpenProduction={onOpenProduction}
          onOpenPrompts={onOpenPrompts}
          onGoToExport={onGoToExport}
          prepStep={prepStep}
          onPrepStepChange={onPrepStepChange}
          onReviewPhaseChange={onReviewPhaseChange}
          onGoToLook={onGoToLook}
          onSkipNextAutosave={onSkipNextAutosave}
          hideDesktopSidebar
          onOpenWorkflow={onOpenWorkflow}
        />
      </div>

      {!scriptToPrompt ? (
        <aside className="hidden xl:sticky xl:top-[calc(7rem+env(safe-area-inset-top))] xl:block xl:self-start">
          <ProjectMemoryPanel memory={dp.agentMemory} appliedTemplateId={dp.appliedTemplateId} compact />
        </aside>
      ) : null}

      <ProAdvancedPrepDrawer
        open={advancedOpen}
        onClose={() => onAdvancedOpenChange?.(false)}
        projectId={projectId}
        state={state}
        updateState={updateState}
        onTemplateApplied={handleTemplateApplied}
        onGoToTab={onGoToTab}
        onGoToPost={onGoToPost}
        usesPipeline={usesPipeline}
      />
    </div>
  );
}

/** Icon-only advanced trigger for workspace header. */
export function ProPrepAdvancedButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Advanced settings"
      className={`flex size-9 items-center justify-center rounded-lg text-pro-text-secondary ring-1 ring-white/[0.08] transition hover:bg-white/[0.04] hover:text-pro-text ${proFocus} ${className ?? ""}`}
    >
      <Settings2 className="size-4" aria-hidden />
    </button>
  );
}
