"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import {
  PREP_AGENT_ROSTER,
  PREP_PIPELINE_ORDER,
  agentLabel,
  prepAgentsByGroup,
  type PrepPipelineAgentId,
} from "@/lib/pro/agent-roster";
import { agentResultDetail, agentResultPreview } from "@/lib/pro/agent-result-detail";
import { agentStatusLine } from "@/lib/pro/agent-running-labels";
import type { FilmmakerAgentInsight } from "@/lib/pro/agent-thinking-summaries";
import { PRO_SCENE_HEADING_REQUIRED } from "@/lib/pro/scene-heading-copy";
import type { AgentStagingBundle } from "@/lib/pro/types";

export type AgentSlotStatus = "waiting" | "running" | "done" | "error" | "skipped";

export type PrepRunPhase = "idle" | "blocked" | "running" | "complete";

export type AgentSlotState = {
  status: AgentSlotStatus;
  detail: string | null;
  thinking: string | null;
};

export function createInitialAgentSlots(): Record<PrepPipelineAgentId, AgentSlotState> {
  return Object.fromEntries(
    PREP_PIPELINE_ORDER.map((id) => [
      id,
      { status: "waiting" as const, detail: null, thinking: null },
    ])
  ) as Record<PrepPipelineAgentId, AgentSlotState>;
}

type Props = {
  slots: Record<PrepPipelineAgentId, AgentSlotState>;
  activeOnly?: PrepPipelineAgentId[];
  showRosterTable?: boolean;
  estimatedLabel?: string;
  costLabel?: string;
  insights?: Partial<Record<PrepPipelineAgentId, FilmmakerAgentInsight>>;
  onCancel?: () => void;
  cancelling?: boolean;
  /** idle = before first run; blocked = cannot run (e.g. no headings); running; complete */
  runPhase?: PrepRunPhase;
  phaseHint?: string;
  /** quick = on-device prep; ai = cloud agents */
  prepMode?: "quick" | "ai";
  /** When idle, parent may pass estimate here instead of a separate card. */
  idleEstimate?: { minutesLabel: string; costLabel: string };
  /** Full prep output — powers expandable agent cards after run. */
  staging?: AgentStagingBundle | null;
  /** Embedded inside PrepRunSummary — minimal chrome. */
  compact?: boolean;
  /** No review CTAs — preview-only agent output. */
  readOnly?: boolean;
  onRunAgain?: () => void;
  /** After a successful run — open Script review (Keep/Remove). */
  onStartReview?: () => void;
};

const STATUS_STYLES: Record<
  AgentSlotStatus,
  { dot: string; bar: string; text: string; row: string }
> = {
  waiting: {
    dot: "bg-pro-text-secondary/40",
    bar: "bg-pro-muted",
    text: "text-pro-text-secondary",
    row: "bg-pro-elevated/40 ring-white/[0.04]",
  },
  running: {
    dot: "bg-sky-400 animate-pulse",
    bar: "bg-sky-500/80 animate-pulse",
    text: "text-sky-300",
    row: "bg-sky-950/30 ring-sky-500/30",
  },
  done: {
    dot: "bg-pro-success",
    bar: "bg-pro-success",
    text: "text-pro-success",
    row: "bg-pro-success/5 ring-pro-success/20",
  },
  error: {
    dot: "bg-red-400",
    bar: "bg-red-500/60",
    text: "text-red-300",
    row: "bg-red-950/20 ring-red-500/25",
  },
  skipped: {
    dot: "bg-pro-text-secondary/30",
    bar: "bg-pro-muted",
    text: "text-pro-text-secondary",
    row: "bg-pro-muted/30 ring-white/[0.04]",
  },
};

export function AgentProgressPanel({
  slots,
  activeOnly,
  showRosterTable = false,
  estimatedLabel,
  costLabel,
  insights,
  onCancel,
  cancelling,
  runPhase = "idle",
  phaseHint,
  prepMode = "ai",
  idleEstimate,
  staging,
  compact = false,
  readOnly = false,
  onRunAgain,
  onStartReview,
}: Props) {
  const order = activeOnly ?? PREP_PIPELINE_ORDER;
  const groupedAgents = prepAgentsByGroup(order);
  const runningId = order.find((id) => slots[id].status === "running");
  const doneCount = order.filter((id) => slots[id].status === "done").length;
  const isRunning = runPhase === "running" || Boolean(runningId);
  const progressPct =
    order.length > 0 ? Math.round(((doneCount + (runningId ? 0.45 : 0)) / order.length) * 100) : 0;
  const [expandedAgents, setExpandedAgents] = useState<Set<PrepPipelineAgentId>>(new Set());

  function toggleAgentExpand(id: PrepPipelineAgentId) {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const phaseTitle =
    runPhase === "blocked"
      ? "Can't run prep yet"
      : runPhase === "running"
        ? prepMode === "quick"
          ? "Generating your prep package…"
          : "Agent progress"
        : runPhase === "complete"
          ? "What agents found"
          : prepMode === "quick"
            ? "Run quick prep"
            : "Run AI prep";

  const phaseSubtitle =
    runPhase === "blocked"
      ? phaseHint ?? PRO_SCENE_HEADING_REQUIRED
      : runPhase === "running"
        ? `${doneCount}/${order.length} complete${runningId ? ` · ${agentStatusLine(runningId, "running", null)}` : ""}`
        : runPhase === "complete"
          ? readOnly
            ? "Expand any section for details."
            : null
          : staging?.status === "committed"
            ? "Saved to project — expand any agent or use the tabs below to review."
            : idleEstimate
            ? `${idleEstimate.minutesLabel} · ${idleEstimate.costLabel}`
            : phaseHint ??
              (prepMode === "quick"
                ? "Tap Run quick prep to start."
                : "Tap Run AI prep to start.");

  return (
    <div
      className={
        compact
          ? "space-y-3"
          : "space-y-4 rounded-2xl bg-pro-elevated/60 p-4 ring-1 ring-white/[0.06] sm:p-5"
      }
    >
      {!compact ? (
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium text-pro-text">{phaseTitle}</h3>
          </div>
          {phaseSubtitle ? (
            <p
              className={`mt-0.5 text-xs ${
                runPhase === "blocked" ? "text-pro-warning" : "text-pro-text-secondary"
              }`}
            >
              {phaseSubtitle}
            </p>
          ) : null}
        </div>
        {estimatedLabel && runPhase === "running" ? (
          <p className="text-lg font-semibold tabular-nums text-pro-primary">{estimatedLabel}</p>
        ) : null}
      </div>
      ) : null}

      {!compact && costLabel && runPhase === "running" ? (
        <p className="text-xs text-pro-text-secondary">{costLabel}</p>
      ) : null}

      {runPhase === "blocked" ? (
        <p className="rounded-xl bg-pro-muted/50 px-3 py-2.5 text-xs leading-relaxed text-pro-text-secondary ring-1 ring-white/[0.05]">
          <span className="font-medium text-pro-warning">What&apos;s missing:</span> each scene needs its
          own line starting with <span className="font-mono text-pro-text">INT.</span> or{" "}
          <span className="font-mono text-pro-text">EXT.</span> — for example{" "}
          <span className="font-mono text-pro-text">INT. KITCHEN - NIGHT</span>. Add those in Step 1.
        </p>
      ) : null}

      {!compact ? (
      <div className="h-2 overflow-hidden rounded-full bg-pro-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-pro-primary to-pro-success transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(
              progressPct,
              runPhase === "complete" ? 100 : isRunning ? 12 : 0
            )}%`,
          }}
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={
            runPhase === "idle"
              ? "Prep not started"
              : runPhase === "blocked"
                ? "Prep blocked"
                : "Prep progress"
          }
        />
      </div>
      ) : null}

      <div className="space-y-4" aria-label="Prep agents">
        {groupedAgents.map(({ group, agents }) => (
          <section key={group.id}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-pro-primary">
                {group.label}
              </span>
              <span className="h-px flex-1 bg-white/[0.06]" aria-hidden />
            </div>
            <ul className="space-y-2">
              {agents.map((meta) => {
                const id = meta.id;
                const slot = slots[id];
                const styles = STATUS_STYLES[slot.status];
                const insight = insights?.[id];
                const slotRunning = slot.status === "running";
                const line = agentStatusLine(id, slot.status, slot.detail, { queued: isRunning });
                const expanded = expandedAgents.has(id);
                const fullDetail = agentResultDetail(id, staging ?? null);
                const previewLine = agentResultPreview(id, staging ?? null, line);
                const canExpand = slot.status === "done" && Boolean(fullDetail);

                return (
                  <li
                    key={id}
                    className={`rounded-xl px-3 py-3 ring-1 transition-all duration-300 ${styles.row}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="relative mt-0.5 flex size-9 shrink-0 flex-col items-center justify-center">
                        <span className="mb-1 inline-flex size-5 items-center justify-center rounded-full bg-black/30 text-[10px] font-bold tabular-nums text-pro-primary">
                          {meta.step}
                        </span>
                        {slotRunning ? (
                          <>
                            <span className="absolute inline-flex size-7 animate-ping rounded-full bg-sky-400/30" />
                            <Loader2 className="relative size-4 animate-spin text-sky-400" aria-hidden />
                          </>
                        ) : slot.status === "done" ? (
                          <Check className="size-4 text-pro-success" aria-hidden />
                        ) : slot.status === "error" ? (
                          <X className="size-4 text-red-400" aria-hidden />
                        ) : (
                          <span className={`size-2 rounded-full ${styles.dot}`} aria-hidden />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-pro-text">{meta.label}</p>
                            <p className="text-[10px] uppercase tracking-wide text-pro-text-secondary/80">
                              {meta.groupLabel}
                            </p>
                          </div>
                          {canExpand ? (
                            <button
                              type="button"
                              className="inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-pro-text-secondary hover:bg-white/5 hover:text-pro-text"
                              aria-expanded={expanded}
                              onClick={() => toggleAgentExpand(id)}
                            >
                              {expanded ? "Less" : "Details"}
                              <ChevronDown
                                className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`}
                                aria-hidden
                              />
                            </button>
                          ) : null}
                        </div>
                        <p className={`mt-1.5 text-xs ${styles.text}`}>
                          {canExpand && !expanded ? previewLine : line}
                        </p>
                        {expanded && fullDetail ? (
                          <>
                            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-black/25 px-2.5 py-2 font-sans text-[11px] leading-relaxed text-pro-text-secondary">
                              {fullDetail}
                            </pre>
                            {insight?.rationale ? (
                              <p className="mt-2 text-[11px] leading-relaxed text-pro-text-secondary">
                                <span className="font-medium text-pro-text">Why: </span>
                                {insight.rationale}
                              </p>
                            ) : null}
                          </>
                        ) : null}
                        {expanded && insight?.rationale && !fullDetail ? (
                          <p className="mt-2 text-[11px] leading-relaxed text-pro-text-secondary">
                            {insight.rationale}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-black/20">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
                        style={{
                          width:
                            slot.status === "done"
                              ? "100%"
                              : slot.status === "running"
                                ? "55%"
                                : slot.status === "error"
                                  ? "100%"
                                  : isRunning
                                    ? "8%"
                                    : "0%",
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {!compact ? (
      <ol className="flex flex-wrap justify-between gap-1 border-t border-white/[0.06] pt-3 sm:hidden" aria-hidden>
        {order.map((id) => {
          const slot = slots[id];
          return (
            <li key={id} className="text-[9px] text-pro-text-secondary">
              {agentLabel(id).replace(" Agent", "").slice(0, 8)}
            </li>
          );
        })}
      </ol>
      ) : null}

      {!compact && showRosterTable ? (
        <details className="rounded-xl bg-pro-muted/40 ring-1 ring-white/[0.04]">
          <summary className="cursor-pointer px-3 py-2 text-xs text-pro-text-secondary marker:content-none [&::-webkit-details-marker]:hidden">
            What each agent handles
          </summary>
          <PrepAgentRosterTable />
        </details>
      ) : null}

      {runPhase === "complete" && !readOnly && onRunAgain ? (
        <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
          <button
            type="button"
            onClick={onRunAgain}
            className="rounded-lg border border-white/[0.1] bg-pro-elevated px-3 py-2 text-xs font-medium text-pro-text hover:bg-pro-elevated"
          >
            Run prep again
          </button>
        </div>
      ) : null}

      {onRunAgain && runPhase === "complete" && readOnly ? (
        <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
          <button
            type="button"
            onClick={onRunAgain}
            className="rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-pro-text ring-1 ring-white/10 hover:bg-white/10"
          >
            Run prep again
          </button>
        </div>
      ) : null}

      {onCancel && !compact ? (
        <button
          type="button"
          onClick={onCancel}
          disabled={cancelling}
          className="text-xs text-pro-text-secondary underline-offset-2 hover:text-pro-warning hover:underline"
        >
          {cancelling ? "Cancelling…" : "Cancel run"}
        </button>
      ) : null}
    </div>
  );
}

function PrepAgentRosterTable() {
  return (
    <div className="overflow-x-auto px-1 pb-2">
      <table className="w-full min-w-[320px] text-left text-xs">
        <thead>
          <tr className="text-pro-text-secondary">
            <th className="px-2 py-2 font-medium">Section</th>
            <th className="px-2 py-2 font-medium">Handled by</th>
            <th className="px-2 py-2 font-medium">Your control</th>
          </tr>
        </thead>
        <tbody>
          {PREP_AGENT_ROSTER.map((a) => (
            <tr key={a.id} className="border-t border-white/5">
              <td className="px-2 py-2 text-pro-text-secondary">{a.handles}</td>
              <td className="px-2 py-2 text-pro-text">{a.label}</td>
              <td className="px-2 py-2 text-pro-text-secondary">{a.userControl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
