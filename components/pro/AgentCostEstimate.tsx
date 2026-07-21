"use client";

import { Clock, Coins } from "lucide-react";
import {
  estimatePrepRun,
  estimatePrepRunBreakdown,
  type PrepAgentCostLine,
} from "@/lib/pro/prep-cost-estimate";
import type { PrepPipelineAgentId } from "@/lib/pro/agent-roster";

type Props = {
  scriptCharCount: number;
  agentCount?: number;
  agentIds?: PrepPipelineAgentId[];
  longScriptMode?: boolean;
  title?: string;
  compact?: boolean;
  minutesLabel?: string;
  costLabel?: string;
  showBreakdown?: boolean;
};

export function AgentCostEstimate({
  scriptCharCount,
  agentCount = 1,
  agentIds,
  longScriptMode = false,
  title = "Estimated before run",
  compact,
  minutesLabel,
  costLabel,
  showBreakdown = true,
}: Props) {
  const est = estimatePrepRun(scriptCharCount, agentCount, longScriptMode);
  const minutes = minutesLabel ?? est.minutesLabel;
  const cost = costLabel ?? est.costLabel;
  const breakdown: PrepAgentCostLine[] = showBreakdown
    ? estimatePrepRunBreakdown(scriptCharCount, agentIds, longScriptMode)
    : [];

  if (compact) {
    return (
      <p className="text-xs text-[#737373]">
        {minutes} · {cost}
      </p>
    );
  }

  return (
    <div className="rounded-xl bg-pro-muted/60 px-3 py-2.5 ring-1 ring-white/5">
      <p className="text-xs font-medium text-[#a3a3a3]">{title}</p>
      <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-[#e5e5e5]">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5 text-[#737373]" aria-hidden />
          {minutes}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Coins className="size-3.5 text-[#737373]" aria-hidden />
          {cost}
        </span>
      </div>
      {breakdown.length > 0 ? (
        <ul className="mt-2 space-y-1 border-t border-[#2a2a2a] pt-2 text-[10px] text-[#a3a3a3]">
          {breakdown.map((line) => (
            <li key={line.id} className="flex justify-between gap-2">
              <span className="text-[#d4d4d4]">{line.label}</span>
              <span className="shrink-0 tabular-nums">
                {line.minutesLabel} · {line.costLabel}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-1 text-[10px] text-[#525252]">Not billing-accurate — varies by model and script length.</p>
    </div>
  );
}
