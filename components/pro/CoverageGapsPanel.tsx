"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { getCoverageGaps, getShotPlanProductionSummary } from "@/lib/pro/shot-plan-stats";
import { SHOT_TYPE_OPTIONS } from "@/lib/pro/shot-plan";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  state: ProjectStatePayload;
  onSuggestCoverage: () => void;
  suggestDisabled?: boolean;
};

export function CoverageGapsPanel({ state, onSuggestCoverage, suggestDisabled }: Props) {
  const summary = getShotPlanProductionSummary(state);
  const gaps = getCoverageGaps(state);
  const shotTypeLabel = (t: string) =>
    SHOT_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t;

  const coverageColor =
    summary.coveragePercent >= 75
      ? "text-pro-success"
      : summary.coveragePercent >= 50
        ? "text-pro-warning"
        : "text-pro-primary";

  return (
    <aside
      className="rounded-2xl bg-pro-warning/10 p-5 ring-1 ring-pro-warning/25 lg:sticky lg:top-24"
      aria-labelledby="coverage-gaps-heading"
    >
      <h3 id="coverage-gaps-heading" className="flex items-center gap-2 text-sm font-semibold text-pro-warning">
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        Coverage
      </h3>

      <div className="mt-4 flex items-center gap-3">
        <p className={`text-3xl font-bold tabular-nums ${coverageColor}`}>{summary.coveragePercent}%</p>
        <p className="text-xs leading-snug text-pro-text-secondary">
          Wide / medium / close-up per scene
        </p>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-pro-text-secondary">
        <span className="font-medium text-pro-text">Suggest coverage</span> adds missing angle cards
        to each scene — new shots appear in the list on the left.
      </p>

      {gaps.length > 0 ? (
        <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto text-xs text-pro-warning custom-scroll">
          {gaps.map((g) => (
            <li key={g.sequenceId} className="rounded-lg bg-black/20 px-2.5 py-2">
              <span className="font-medium text-pro-warning">{g.sequenceTitle}</span>
              <span className="text-pro-warning/80">
                {" "}
                — missing {g.missingTypes.map(shotTypeLabel).join(", ")}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-pro-success">Coverage looks solid across sequences.</p>
      )}

      <Button
        type="button"
        size="sm"
        className={`mt-4 w-full ${proBtn.outline} !border-pro-warning/40 !text-pro-warning hover:!bg-pro-warning/15 hover:!text-pro-warning`}
        disabled={suggestDisabled || state.shotPlan.sequences.length === 0}
        onClick={onSuggestCoverage}
      >
        Suggest coverage
      </Button>
    </aside>
  );
}
