"use client";

import type { AgentSuggestionStatus } from "@/lib/pro/types";

type Props = {
  status: AgentSuggestionStatus | string;
  onKeep: () => void;
  onRemove: () => void;
  onUndo?: () => void;
};

/** Keep / Remove on the right; bright green when kept; Undo replaces actions when removed. */
export function KeepRemoveButtons({ status, onKeep, onRemove, onUndo }: Props) {
  const kept = status === "approved";
  const removed = status === "rejected";
  const pending = status === "pending";

  if (removed && onUndo) {
    return (
      <div className="flex shrink-0 flex-col items-end">
        <button
          type="button"
          onClick={onUndo}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#fca5a5] ring-1 ring-red-500/50 transition hover:bg-red-500/15"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      {pending ? (
        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-pro-warning">
          Needs decision
        </span>
      ) : null}
      <div className="flex flex-col gap-1.5 sm:flex-row">
        <button
          type="button"
          onClick={onKeep}
          className={
            kept
              ? "rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-bold text-emerald-950 shadow-sm ring-1 ring-emerald-300"
              : "rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-600/50 hover:bg-emerald-500/15"
          }
        >
          Keep
        </button>
        <button
          type="button"
          onClick={onRemove}
          className={
            removed
              ? "rounded-lg bg-pro-warning/15 px-3 py-1.5 text-xs font-semibold text-pro-warning ring-1 ring-pro-warning/40"
              : "rounded-lg px-3 py-1.5 text-xs font-semibold text-pro-text-secondary ring-1 ring-white/15 hover:bg-white/5 hover:text-pro-text"
          }
        >
          Remove
        </button>
      </div>
    </div>
  );
}
