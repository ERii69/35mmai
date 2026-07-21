"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, HelpCircle, Loader2 } from "lucide-react";
import type { ThinkingLogEntry } from "@/lib/pro/thinking-log";

type Props = {
  entries: ThinkingLogEntry[];
  running?: boolean;
  className?: string;
  /** Collapsed by default to save vertical space (PRO-301). */
  defaultCollapsed?: boolean;
  /** When set, collapsed header shows "N agents completed". */
  agentTotal?: number;
};

/** Scrollable human-readable agent thinking timeline (not raw model logs). */
export function ThinkingLogPanel({
  entries,
  running,
  className = "",
  defaultCollapsed = true,
  agentTotal,
}: Props) {
  const [open, setOpen] = useState(!defaultCollapsed);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [entries.length, open]);

  if (entries.length === 0 && !running) return null;

  const workingCount = entries.filter((e) => e.phase === "working").length;
  const doneAgentIds = new Set(
    entries.filter((e) => e.phase === "done" && e.agentId).map((e) => e.agentId)
  );
  const doneCount = doneAgentIds.size;
  const total = agentTotal ?? doneCount;

  const collapsedSummary =
    !running && total > 0
      ? `${doneCount >= total ? total : doneCount} of ${total} agents completed`
      : running
        ? `${entries.length} update${entries.length === 1 ? "" : "s"} · agents working`
        : `${entries.length} update${entries.length === 1 ? "" : "s"}`;

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-pro-elevated/90 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.06] ${className}`}
      aria-label="Agent thinking log"
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pro-primary/40"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-pro-text">Thinking log</p>
          <p className="text-xs text-pro-text-secondary">
            {open ? "Timeline with timestamps" : collapsedSummary}
          </p>
        </div>
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-pro-text-secondary" aria-hidden />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-pro-text-secondary" aria-hidden />
        )}
      </button>

      {open ? (
        <ul className="max-h-52 space-y-0 overflow-y-auto border-t border-white/[0.06] px-3 py-2 custom-scroll">
          {entries.map((entry) => {
            const phase = !running && entry.phase === "working" ? "done" : entry.phase;
            return (
              <li
                key={entry.id}
                className={`flex gap-2 rounded-lg px-2 py-2 text-xs ${
                  phase === "working"
                    ? "bg-pro-primary/10 text-pro-primary"
                    : phase === "done"
                      ? "text-pro-text-secondary"
                      : "text-pro-text-secondary/70"
                }`}
              >
                {phase === "working" ? (
                  <Loader2 className="mt-0.5 size-3 shrink-0 animate-spin text-pro-primary" aria-hidden />
                ) : (
                  <span
                    className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                      entry.phase === "done" ? "bg-pro-success" : "bg-pro-secondary"
                    }`}
                    aria-hidden
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                    <span>
                      {entry.agentLabel ? (
                        <span className="font-medium text-pro-text">{entry.agentLabel}: </span>
                      ) : null}
                      {entry.message}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <time
                        className="text-[10px] tabular-nums text-pro-text-secondary"
                        dateTime={new Date(entry.at).toISOString()}
                      >
                        {new Date(entry.at).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </time>
                      {entry.why ? (
                        <span
                          className="inline-flex text-pro-text-secondary"
                          title={entry.why}
                        >
                          <HelpCircle className="size-3.5" aria-label="Why this step" />
                        </span>
                      ) : null}
                    </span>
                  </span>
                </span>
              </li>
            );
          })}
          {running && entries.every((e) => e.phase !== "working") ? (
            <li className="flex gap-2 px-2 py-2 text-xs text-pro-text-secondary">
              <Loader2 className="size-3 animate-spin" aria-hidden />
              Waiting for next agent…
            </li>
          ) : null}
          <div ref={bottomRef} />
        </ul>
      ) : null}
    </div>
  );
}
