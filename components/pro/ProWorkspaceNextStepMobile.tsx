"use client";

import { ChevronRight, X } from "lucide-react";
import { getNextWorkspaceStep } from "@/lib/pro/next-workspace-step";
import { proFocus } from "@/components/pro/ux/pro-surfaces";
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

/** Single primary CTA on mobile — avoids competing with in-panel next-step banner. */
export function ProWorkspaceNextStepMobile({
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
    <div className="mb-3 flex items-center gap-1 md:hidden">
      <button
        type="button"
        className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-pro-elevated/70 px-3 py-2 text-left ring-1 ring-white/[0.04] transition hover:border-pro-primary/25 hover:bg-pro-muted/80 ${proFocus}`}
        onClick={() =>
          onNavigate(step.mode, {
            productionTab: step.productionTab,
            prepStep: step.prepStep,
            lookTab: step.lookTab,
          })
        }
      >
        <span className="min-w-0 truncate text-left">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-pro-primary/90">
            Next
          </span>
          <span className="block truncate font-medium">{step.title}</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-pro-text-secondary" aria-hidden />
      </button>
      {onDismiss ? (
        <button
          type="button"
          className="shrink-0 rounded-lg p-2 text-pro-text-secondary transition hover:bg-white/5 hover:text-pro-text"
          onClick={onDismiss}
          aria-label="Dismiss next step hint"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
