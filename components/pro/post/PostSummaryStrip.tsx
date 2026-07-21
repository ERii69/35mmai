"use client";

import { buildPostSummaryStrip } from "@/lib/pro/post-summary";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  state: ProjectStatePayload;
};

export function PostSummaryStrip({ state }: Props) {
  const summary = buildPostSummaryStrip(state);

  return (
    <div className={`${proSurface.sectionMuted} grid gap-3 sm:grid-cols-2 lg:grid-cols-4`}>
      <SummaryCell label="Look" value={summary.lookLine ?? "Add mood + refs in Look"} />
      <SummaryCell label="Coverage" value={summary.shotLine ?? "No shots planned yet"} />
      <SummaryCell label="Kit" value={summary.kitLine} />
      <SummaryCell
        label="Progress"
        value={
          summary.checklistTotal > 0
            ? `${summary.checklistPct}% sign-off · ${summary.workflowPhaseComplete ? "Pipeline done" : "Pipeline in progress"}`
            : summary.workflowPhaseComplete
              ? "Pipeline marked complete"
              : "Load sign-off checklist"
        }
      />
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-pro-elevated/60 px-3 py-3 ring-1 ring-white/[0.06]">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-pro-text-secondary">
        {label}
      </p>
      <p className="mt-1 text-sm leading-snug text-pro-text">{value}</p>
    </div>
  );
}
