"use client";

import { ArrowRight, X } from "lucide-react";
import { getNextWorkspaceStep } from "@/lib/pro/next-workspace-step";
import type { ProjectStatePayload } from "@/lib/pro/types";
import type { LookTabId, PrepStepId, ProductionTabId, WorkspaceMode } from "@/lib/pro/workspace-modes";

type NavigateOpts = {
  productionTab?: ProductionTabId;
  prepStep?: PrepStepId;
  lookTab?: LookTabId;
};

type Props = {
  state: ProjectStatePayload;
  mode: WorkspaceMode;
  prepStep?: PrepStepId;
  lookTab?: LookTabId;
  productionTab?: ProductionTabId;
  onNavigate: (mode: WorkspaceMode, opts?: NavigateOpts) => void;
  onDismiss?: () => void;
};

export function NextStepBanner({
  state,
  mode,
  prepStep,
  lookTab,
  productionTab,
  onNavigate,
  onDismiss,
}: Props) {
  const step = getNextWorkspaceStep(state);
  if (!step) return null;

  const alreadyThere =
    mode === step.mode &&
    (!step.productionTab || productionTab === step.productionTab) &&
    (!step.prepStep || prepStep === step.prepStep) &&
    (!step.lookTab || lookTab === step.lookTab);
  if (alreadyThere) return null;

  return (
    <div className="mb-3 hidden items-center justify-between gap-3 rounded-xl border border-pro-primary/20 bg-pro-primary/[0.06] px-3 py-2.5 sm:px-4 md:flex">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-pro-primary">
          Next step
        </p>
        <p className="truncate text-sm font-medium text-pro-text">{step.title}</p>
        <p className="truncate text-xs text-pro-text-secondary">{step.detail}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg bg-pro-primary/15 px-3 py-1.5 text-xs font-semibold text-pro-primary ring-1 ring-pro-primary/25 transition hover:bg-pro-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/40"
          onClick={() =>
            onNavigate(step.mode, {
              productionTab: step.productionTab,
              prepStep: step.prepStep,
              lookTab: step.lookTab,
            })
          }
        >
          Go there
          <ArrowRight className="size-3.5" aria-hidden />
        </button>
        {onDismiss ? (
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-pro-text-secondary transition hover:bg-white/5 hover:text-pro-text touch-manipulation"
            onClick={onDismiss}
            aria-label="Dismiss next step hint"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
