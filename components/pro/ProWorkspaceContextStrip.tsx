"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  workspaceNavForState,
  activePipelineStep,
  usesScriptToPromptPipeline,
} from "@/lib/pro/workspace-pipeline";
import {
  LOOK_TABS,
  WORKSPACE_MODES,
  prepTabsForState,
  productionTabsForState,
  type LookTabId,
  type PrepStepId,
  type ProductionTabId,
  type WorkspaceMode,
} from "@/lib/pro/workspace-modes";
import { PRO_OPEN_PROJECT_SWITCHER_EVENT } from "@/lib/pro/pro-nav-events";
import { proTapHaptic } from "@/lib/pro/haptic";
import { cn } from "@/lib/utils";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  projectName: string;
  mode: WorkspaceMode;
  state?: ProjectStatePayload;
  prepStep?: PrepStepId;
  productionTab?: ProductionTabId;
  lookTab?: LookTabId;
  className?: string;
};

/** Breadcrumb: Projects › project › mode — mobile strip + desktop header. */
export function ProWorkspaceContextStrip({
  projectName,
  mode,
  state,
  prepStep = "script",
  productionTab = "prompts",
  lookTab = "photos",
  className,
}: Props) {
  const pipeline = state ? usesScriptToPromptPipeline(state) : false;

  let phaseLabel = WORKSPACE_MODES.find((m) => m.id === mode)?.label ?? mode;
  if (state) {
    const step = activePipelineStep(state, mode, productionTab, lookTab);
    if (step) {
      phaseLabel =
        workspaceNavForState(state).find((m) => m.id === step)?.label ?? phaseLabel;
    }
  }

  let subLabel: string | null = null;
  if (state && pipeline) {
    if (mode === "prep") {
      subLabel = prepTabsForState(state).find((t) => t.id === prepStep)?.label ?? null;
    } else if (mode === "look") {
      subLabel = LOOK_TABS.find((t) => t.id === lookTab)?.label ?? null;
    } else if (mode === "production" || mode === "post") {
      subLabel =
        productionTabsForState(state).find((t) => t.id === productionTab)?.label ?? null;
    }
  }

  function openProjectSwitcher() {
    proTapHaptic();
    window.dispatchEvent(new Event(PRO_OPEN_PROJECT_SWITCHER_EVENT));
  }

  return (
    <nav
      aria-label="Workspace location"
      className={cn("flex min-w-0 items-center gap-1 text-xs md:text-sm", className)}
    >
      <Link
        href="/pro/app"
        className="shrink-0 font-medium text-pro-primary transition hover:text-pro-primary/80"
        onClick={() => proTapHaptic()}
      >
        Projects
      </Link>
      <ChevronRight className="size-3 shrink-0 text-pro-text-secondary/60 md:size-3.5" aria-hidden />
      <button
        type="button"
        onClick={openProjectSwitcher}
        className="min-w-0 truncate font-medium text-pro-text transition hover:text-pro-primary"
      >
        {projectName}
      </button>
      <ChevronRight className="size-3 shrink-0 text-pro-text-secondary/60 md:size-3.5" aria-hidden />
      <span className="shrink-0 font-medium text-pro-text">{phaseLabel}</span>
      {subLabel ? (
        <>
          <ChevronRight
            className="size-3 shrink-0 text-pro-text-secondary/60 md:size-3.5"
            aria-hidden
          />
          <span className="shrink-0 text-pro-text-secondary">{subLabel}</span>
        </>
      ) : null}
    </nav>
  );
}
