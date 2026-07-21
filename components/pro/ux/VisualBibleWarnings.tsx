"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { groupVisualConsistencyIssues } from "@/lib/pro/group-visual-consistency-issues";
import { severityLabel, type VisualConsistencyIssue } from "@/lib/pro/visual-consistency-check";

type Props = {
  issues: VisualConsistencyIssue[];
  onApplyToShots?: () => void;
  onGoToPhotos?: () => void;
  onAiReview?: () => void;
  aiReviewLoading?: boolean;
  agentsEnabled?: boolean;
  /** Show issue list immediately (Step 3 scan results). */
  defaultExpanded?: boolean;
};

/** Grouped look-vs-scenes flags with clear fix actions. */
export function VisualBibleWarnings({
  issues,
  onApplyToShots,
  onGoToPhotos,
  onAiReview,
  aiReviewLoading,
  agentsEnabled,
  defaultExpanded = false,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (issues.length === 0) return null;

  const grouped = groupVisualConsistencyIssues(issues);
  const high = issues.filter((i) => i.severity === "high").length;
  const sceneCount = new Set(issues.map((i) => i.sceneNumber)).size;

  return (
    <div
      className="rounded-xl border border-pro-warning/30 bg-pro-warning/10 p-4 ring-1 ring-pro-warning/10"
      role="status"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-2.5">
          <AlertTriangle className="size-5 shrink-0 text-pro-warning" aria-hidden />
          <div>
            <p className="text-sm font-medium text-pro-warning">
              {grouped.length} look check{grouped.length === 1 ? "" : "s"} · {sceneCount} scene
              {sceneCount === 1 ? "" : "s"}
              {high > 0 ? (
                <span className="ml-2 rounded bg-red-950/60 px-1.5 py-0.5 text-[10px] uppercase text-red-300">
                  {high} urgent
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 text-xs text-pro-warning/75">
              Prep scenes and your look bible may not fully match yet.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {onApplyToShots ? (
            <Button
              type="button"
              size="sm"
              className="bg-pro-success text-pro-muted hover:brightness-105"
              onClick={onApplyToShots}
            >
              Apply look to shots
            </Button>
          ) : null}
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-pro-warning hover:bg-pro-warning/15"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Hide" : "Details"}
            <ChevronDown
              className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </div>
      </div>

      {expanded ? (
        <ul className="mt-3 space-y-2">
          {grouped.map((group) => (
            <li
              key={group.message}
              className="rounded-lg border border-pro-warning/15 bg-black/20 px-3 py-2.5"
            >
              <p className="text-xs font-medium text-pro-warning">
                {severityLabel(group.severity) !== "Low" ? `${severityLabel(group.severity)} · ` : ""}
                {group.message}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {group.scenes.slice(0, 8).map((s) => (
                  <span
                    key={s.number}
                    className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-pro-warning/80"
                    title={s.heading}
                  >
                    Scene {s.number}
                  </span>
                ))}
                {group.scenes.length > 8 ? (
                  <span className="text-[10px] text-pro-warning/60">+{group.scenes.length - 8}</span>
                ) : null}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-pro-warning/70">
                <span className="font-medium text-pro-warning">Fix: </span>
                {group.recommendedFix}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2 border-t border-pro-warning/15 pt-3">
        {onGoToPhotos ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-pro-warning/30 text-pro-warning hover:bg-pro-warning/15"
            onClick={onGoToPhotos}
          >
            Update reference photos
          </Button>
        ) : null}
        {onAiReview && agentsEnabled ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-pro-warning/30 text-pro-warning"
            disabled={aiReviewLoading}
            onClick={onAiReview}
          >
            <ScanSearch className="mr-1.5 size-3.5" aria-hidden />
            {aiReviewLoading ? "Checking…" : "Deep AI check"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
