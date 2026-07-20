"use client";

import { Check, Clock } from "lucide-react";
import { workflowStages } from "@/app/data";
import { Button } from "@/components/ui/button";
import { WorkflowStepsList } from "@/components/pro/WorkflowStepsList";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import { PRE_PRODUCE_STAGE_INDICES } from "@/lib/pro/post-workflow";
import type { ProjectStatePayload } from "@/lib/pro/types";

const PHASE_WEEKS = ["4–12 weeks", "1–4 weeks"];
const PHASE_DAYS_HINT = ["~30–90 days", "~7–30 days"];

const PRE_PRODUCE_STAGES = PRE_PRODUCE_STAGE_INDICES.map((i) => workflowStages[i]!);

type Props = {
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  onGoToKitTab?: () => void;
  onGoToPost?: () => void;
};

export function WorkflowPanel({ state, updateState, onGoToKitTab, onGoToPost }: Props) {
  const stageIndex = Math.min(state.workflow.stageIndex, PRE_PRODUCE_STAGES.length - 1);
  const completedPhases = state.workflow.completedPhases ?? [];
  const stage = PRE_PRODUCE_STAGES[stageIndex] ?? PRE_PRODUCE_STAGES[0];
  const progressPct = Math.round(((stageIndex + 1) / PRE_PRODUCE_STAGES.length) * 100);
  const phaseComplete = completedPhases.includes(stageIndex);

  function togglePhaseComplete(index: number) {
    updateState((p) => {
      const prev = p.workflow.completedPhases ?? [];
      const next = prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index].sort((a, b) => a - b);
      return { ...p, workflow: { ...p.workflow, completedPhases: next } };
    });
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold text-pro-text">Phases</h2>
        <p className="mt-2 max-w-xl text-[15px] leading-normal text-pro-text-secondary">
          Pre-production through shoot — post-production lives under Post.
          {onGoToPost ? (
            <>
              {" "}
              <button
                type="button"
                onClick={onGoToPost}
                className="text-pro-primary underline-offset-2 hover:underline"
              >
                Open Post →
              </button>
            </>
          ) : null}
        </p>
      </header>

      <div className={proSurface.sectionMuted}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-pro-text-secondary">
            Phase progress
          </p>
          <p className="flex items-center gap-1 text-xs text-pro-text-secondary">
            <Clock className="size-3.5" aria-hidden />
            {PHASE_WEEKS[stageIndex] ?? "—"} · {PHASE_DAYS_HINT[stageIndex]}
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
          {progressPct}% through pre-production & shoot
        </p>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {PRE_PRODUCE_STAGES.map((s, i) => {
            const active = i === stageIndex;
            const done = completedPhases.includes(i) || i < stageIndex;
            return (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() =>
                    updateState((p) => ({ ...p, workflow: { ...p.workflow, stageIndex: i } }))
                  }
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-xs transition ring-1 ${
                    active
                      ? "bg-pro-primary/15 ring-pro-primary/30 text-pro-text"
                      : done
                        ? "bg-pro-success/10 ring-pro-success/20 text-pro-success"
                        : "bg-pro-elevated/60 ring-white/[0.06] text-pro-text-secondary hover:ring-white/12"
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-semibold">
                    {done ? <Check className="size-3.5 shrink-0" aria-hidden /> : null}
                    {i + 1}. {s.title}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-normal opacity-80">
                    {PHASE_WEEKS[i]}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
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
            onClick={() => togglePhaseComplete(stageIndex)}
          >
            <Check className="mr-1.5 size-3.5" aria-hidden />
            {phaseComplete ? "Marked complete" : "Mark phase complete"}
          </Button>
        </div>

        <label className="mt-5 block text-sm font-medium text-pro-text-secondary">
          Jump to phase
          <select
            className="mt-1.5 w-full rounded-xl border-0 bg-pro-muted px-3.5 py-3 text-pro-text shadow-inner ring-1 ring-white/[0.08] focus-visible:ring-2 focus-visible:ring-pro-primary/50"
            value={stageIndex}
            onChange={(e) =>
              updateState((p) => ({
                ...p,
                workflow: { stageIndex: parseInt(e.target.value, 10) || 0 },
              }))
            }
          >
            {PRE_PRODUCE_STAGES.map((s, i) => (
              <option key={s.title} value={i}>
                Phase {i + 1}: {s.title}
                {completedPhases.includes(i) ? " ✓" : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-6">
          <WorkflowStepsList steps={stage.steps} onGoToKitTab={onGoToKitTab} />
        </div>
      </div>
    </div>
  );
}
