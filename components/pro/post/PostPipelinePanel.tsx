"use client";

import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowStepsList } from "@/components/pro/WorkflowStepsList";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import {
  getPostProductionStage,
  POST_PRODUCTION_STAGE_INDEX,
} from "@/lib/pro/post-workflow";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  onGoToPostKit?: () => void;
};

export function PostPipelinePanel({ state, updateState, onGoToPostKit }: Props) {
  const stage = getPostProductionStage();
  const completedPhases = state.workflow.completedPhases ?? [];
  const phaseComplete = completedPhases.includes(POST_PRODUCTION_STAGE_INDEX);
  const stepCount = stage.steps.length;
  const doneSteps = phaseComplete ? stepCount : Math.min(state.workflow.stageIndex >= POST_PRODUCTION_STAGE_INDEX ? 2 : 0, stepCount);
  const progressPct = Math.round((doneSteps / Math.max(stepCount, 1)) * 100);

  function togglePostPhaseComplete() {
    updateState((p) => {
      const prev = p.workflow.completedPhases ?? [];
      const next = prev.includes(POST_PRODUCTION_STAGE_INDEX)
        ? prev.filter((i) => i !== POST_PRODUCTION_STAGE_INDEX)
        : [...prev, POST_PRODUCTION_STAGE_INDEX].sort((a, b) => a - b);
      return {
        ...p,
        workflow: {
          ...p.workflow,
          stageIndex: POST_PRODUCTION_STAGE_INDEX,
          completedPhases: next,
        },
      };
    });
  }

  return (
    <div className="space-y-6">
      <div className={proSurface.sectionMuted}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-pro-text-secondary">
            {stage.title}
          </p>
          <p className="flex items-center gap-1 text-xs text-pro-text-secondary">
            <Clock className="size-3.5" aria-hidden />
            4–12 weeks · ~30–90 days
          </p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-pro-muted ring-1 ring-white/[0.04]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pro-primary via-rose-500/80 to-pro-success transition-all duration-500"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="mt-2 text-right text-xs font-medium text-pro-text-secondary">
          {phaseComplete ? "Post-production marked complete" : `${progressPct}% through post pipeline`}
        </p>
      </div>

      <div className={proSurface.card}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-pro-text">{stage.title}</h3>
            <p className="mt-1 text-sm text-pro-text-secondary">{stage.description}</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant={phaseComplete ? "outline" : "default"}
            className={
              phaseComplete
                ? "border-pro-success/40 text-pro-success"
                : "bg-pro-success/90 text-white hover:bg-pro-success"
            }
            onClick={togglePostPhaseComplete}
          >
            <Check className="mr-1.5 size-3.5" aria-hidden />
            {phaseComplete ? "Marked complete" : "Mark post complete"}
          </Button>
        </div>
        <WorkflowStepsList steps={stage.steps} onGoToKitTab={onGoToPostKit} />
      </div>
    </div>
  );
}
