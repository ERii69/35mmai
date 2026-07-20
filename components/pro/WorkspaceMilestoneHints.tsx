"use client";

import { NextStepBanner } from "@/components/pro/NextStepBanner";
import { ProWorkspaceNextStepMobile } from "@/components/pro/ProWorkspaceNextStepMobile";
import { getNextWorkspaceStep } from "@/lib/pro/next-workspace-step";
import { useWorkspaceMilestoneHint } from "@/lib/pro/use-workspace-milestone-hint";
import type { ProjectStatePayload } from "@/lib/pro/types";
import type { LookTabId, PrepStepId, ProductionTabId, WorkspaceMode } from "@/lib/pro/workspace-modes";

type NavigateOpts = {
  productionTab?: ProductionTabId;
  prepStep?: PrepStepId;
  lookTab?: LookTabId;
};

type Props = {
  projectId: string;
  state: ProjectStatePayload;
  mode: WorkspaceMode;
  prepStep?: PrepStepId;
  lookTab?: LookTabId;
  productionTab?: ProductionTabId;
  onNavigate: (mode: WorkspaceMode, opts?: NavigateOpts) => void;
};

/** Dismissible next-step nudges after prep milestones — desktop banner + mobile strip. */
export function WorkspaceMilestoneHints({
  projectId,
  state,
  mode,
  prepStep,
  lookTab,
  productionTab,
  onNavigate,
}: Props) {
  const step = getNextWorkspaceStep(state);
  const { visible, dismiss } = useWorkspaceMilestoneHint(projectId, step?.id ?? null);

  if (!step || !visible) return null;

  const alreadyThere =
    mode === step.mode &&
    (!step.productionTab || productionTab === step.productionTab) &&
    (!step.prepStep || prepStep === step.prepStep) &&
    (!step.lookTab || lookTab === step.lookTab);
  if (alreadyThere) return null;

  return (
    <>
      <NextStepBanner
        state={state}
        mode={mode}
        prepStep={prepStep}
        lookTab={lookTab}
        productionTab={productionTab}
        onNavigate={onNavigate}
        onDismiss={dismiss}
      />
      <ProWorkspaceNextStepMobile
        state={state}
        mode={mode}
        prepStep={prepStep}
        lookTab={lookTab}
        productionTab={productionTab}
        onNavigate={onNavigate}
        onDismiss={dismiss}
      />
    </>
  );
}
