"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentProgressPanel } from "@/components/pro/AgentProgressPanel";
import type { AgentSlotState } from "@/components/pro/AgentProgressPanel";
import type { PrepPipelineAgentId } from "@/lib/pro/agent-roster";
import type { FilmmakerAgentInsight } from "@/lib/pro/agent-thinking-summaries";
import type { AgentStagingBundle } from "@/lib/pro/types";

type Props = {
  sceneCount: number;
  slots: Record<PrepPipelineAgentId, AgentSlotState>;
  activePipeline: PrepPipelineAgentId[] | null;
  insights?: Partial<Record<PrepPipelineAgentId, FilmmakerAgentInsight>>;
  staging: AgentStagingBundle | null;
  prepMode: "quick" | "ai";
  onExpandRun?: () => void;
};

/** Compact collapsible summary after prep — run details, not review actions. */
export function PrepRunSummary({
  sceneCount,
  slots,
  activePipeline,
  insights,
  staging,
  prepMode,
  onExpandRun,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const pipeline = activePipeline ?? [];
  const doneCount = pipeline.filter((id) => slots[id]?.status === "done").length;

  return (
    <div className="rounded-2xl bg-pro-elevated/50 ring-1 ring-white/[0.06]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-pro-success/20">
            <Check className="size-4 text-pro-success" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-pro-text">Prep run complete</p>
            <p className="text-xs text-pro-text-secondary">
              {doneCount}/{pipeline.length || 5} sections · {sceneCount} scene
              {sceneCount === 1 ? "" : "s"} generated
              {prepMode === "quick" ? " · on-device" : " · AI"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {onExpandRun ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/10 bg-pro-elevated text-pro-text-secondary hover:text-pro-text"
              onClick={onExpandRun}
            >
              Run prep again
            </Button>
          ) : null}
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-medium text-pro-text ring-1 ring-white/10 hover:bg-white/10"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Hide" : "Show"} details
              <ChevronDown
                className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
        </div>
      </div>
      {expanded ? (
        <div className="border-t border-white/[0.06] px-2 pb-2 pt-1">
          <AgentProgressPanel
            slots={slots}
            activeOnly={activePipeline ?? undefined}
            insights={insights}
            staging={staging}
            runPhase="complete"
            prepMode={prepMode}
            compact
            readOnly
          />
        </div>
      ) : null}
    </div>
  );
}
