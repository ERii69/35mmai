"use client";

import { AlertTriangle, CheckCircle2, Clapperboard, Loader2, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LookCheckExplainer } from "@/components/pro/LookCheckExplainer";
import { VisualBibleWarnings } from "@/components/pro/ux/VisualBibleWarnings";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import type { VisualConsistencyIssue } from "@/lib/pro/visual-consistency-check";
import type { ProjectStatePayload } from "@/lib/pro/types";

export type LookCheckStatus = "idle" | "running" | "clear" | "issues";

type Props = {
  state: ProjectStatePayload;
  status: LookCheckStatus;
  issues: VisualConsistencyIssue[];
  agentsEnabled: boolean;
  onRunCheck: () => void;
  onApplyToShots: () => void;
  onGoToPhotos: () => void;
  onGoToPrep?: () => void;
};

const EXAMPLE_FLAGS = [
  "Scene notes say hard backlight, but your mood board is soft natural light",
  "A scene's palette drifts from the swatches you locked",
  "Prep tone (noir, warm, rural…) doesn't match your look bible",
];

/** Step 3 — scene vs mood board scan with clear CTA and inline results. */
export function LookCheckSection({
  state,
  status,
  issues,
  agentsEnabled,
  onRunCheck,
  onApplyToShots,
  onGoToPhotos,
  onGoToPrep,
}: Props) {
  const sceneCount = state.directorPrep.scenes.length;
  const running = status === "running";
  const isClear = status === "clear";
  const hasIssues = status === "issues";
  const hasRun = isClear || hasIssues;

  return (
    <section
      className="space-y-4 rounded-xl bg-pro-elevated/50 p-3 ring-1 ring-white/[0.06] sm:p-4"
      aria-labelledby="check-look-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-pro-primary">Step 3</p>
          <h4 id="check-look-heading" className="mt-0.5 text-base font-semibold text-pro-text">
            Match check — Prep scenes vs your look
          </h4>
          <p className="mt-1 text-sm text-pro-text-secondary">
            Optional QA before you shoot. Flags scene notes that drift from your mood board — palette,
            lighting, and tone.
          </p>
        </div>
        {hasRun ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={proBtn.outline}
            disabled={running}
            onClick={onRunCheck}
          >
            <ScanSearch className="mr-1.5 size-3.5" aria-hidden />
            Scan again
          </Button>
        ) : null}
      </div>

      <LookCheckExplainer state={state} />

      {isClear ? (
        <div
          className="flex items-start gap-2.5 rounded-lg border border-emerald-500/25 bg-emerald-950/25 px-3 py-2.5"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden />
          <div>
            <p className="text-sm font-medium text-emerald-100">All clear</p>
            <p className="mt-0.5 text-xs text-emerald-100/90">
              {sceneCount} prep scene{sceneCount === 1 ? "" : "s"} passed all three checks — palette, lighting,
              mood &amp; tone.
            </p>
          </div>
        </div>
      ) : null}

      {!hasRun ? (
        <>
          <details className="rounded-lg bg-black/20 ring-1 ring-white/[0.04]">
            <summary className="cursor-pointer px-3 py-2 text-[11px] font-medium text-pro-text-secondary marker:content-none [&::-webkit-details-marker]:hidden">
              Example flags (what you might see)
            </summary>
            <ul className="space-y-1.5 border-t border-white/[0.04] px-3 py-2">
              {EXAMPLE_FLAGS.map((line) => (
                <li key={line} className="flex gap-2 text-xs text-pro-text-secondary">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-pro-primary/70" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </details>

          <div className="rounded-xl bg-pro-muted/30 p-3 ring-1 ring-white/[0.06] sm:p-4">
            <p className="text-sm font-medium text-pro-text">
              {running
                ? `Running scan on ${sceneCount} scene${sceneCount === 1 ? "" : "s"}…`
                : sceneCount > 0
                  ? `Ready — scan ${sceneCount} prep scene${sceneCount === 1 ? "" : "s"}`
                  : "Add scenes in Prep first"}
            </p>
            {!running && sceneCount > 0 ? (
              <p className="mt-1 text-xs text-pro-text-secondary">
                Takes a few seconds. Results appear below with fix actions.
              </p>
            ) : null}

            <Button
              type="button"
              size="sm"
              className={`mt-3 w-full sm:w-auto ${proBtn.primary}`}
              disabled={running || sceneCount === 0}
              onClick={onRunCheck}
            >
              {running ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
                  Scanning…
                </>
              ) : (
                <>
                  <ScanSearch className="mr-1.5 size-3.5" aria-hidden />
                  Run match check
                </>
              )}
            </Button>
          </div>
        </>
      ) : null}

      {hasIssues && issues.length > 0 ? (
        <>
          <VisualBibleWarnings
            issues={issues}
            agentsEnabled={agentsEnabled}
            aiReviewLoading={running}
            defaultExpanded
            onApplyToShots={onApplyToShots}
            onGoToPhotos={onGoToPhotos}
            onAiReview={onRunCheck}
          />
          <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
            <p className="w-full text-xs font-medium text-pro-text">Fix a mismatch</p>
            {onGoToPrep ? (
              <Button type="button" size="sm" variant="outline" className={proBtn.outline} onClick={onGoToPrep}>
                <Clapperboard className="mr-1.5 size-3.5" aria-hidden />
                Open Prep — edit scene notes
              </Button>
            ) : null}
            <Button type="button" size="sm" className={proBtn.apply} onClick={onApplyToShots}>
              Apply look to shots
            </Button>
            <Button type="button" size="sm" variant="outline" className={proBtn.outline} onClick={onGoToPhotos}>
              Update reference photos
            </Button>
          </div>
        </>
      ) : null}

      {hasIssues && issues.length === 0 ? (
        <div
          className="flex items-start gap-2.5 rounded-lg border border-pro-warning/25 bg-pro-warning/10 px-3 py-2.5"
          role="status"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-pro-warning" aria-hidden />
          <p className="text-sm text-pro-warning">
            Possible drift detected — open Prep to tighten scene notes, or rebuild the mood board in Step 2.
          </p>
        </div>
      ) : null}
    </section>
  );
}
