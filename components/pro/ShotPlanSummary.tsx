"use client";

import type { ComponentType } from "react";
import { Calendar, Clapperboard, Layers, Percent } from "lucide-react";
import { getShotPlanProductionSummary, kitHintFromShotTypes } from "@/lib/pro/shot-plan-stats";
import { countShotsWithPrompts } from "@/lib/pro/sync-shot-prompts";
import type { ProjectStatePayload } from "@/lib/pro/types";
import type { ProductionTabId } from "@/lib/pro/workspace-modes";

type Props = {
  state: ProjectStatePayload;
  onGoToTab?: (tab: ProductionTabId) => void;
  promptPack?: boolean;
};

/** Stats row only — coverage gaps live in sidebar. */
export function ShotPlanSummary({ state, onGoToTab, promptPack = false }: Props) {
  const summary = getShotPlanProductionSummary(state);
  const allShots = state.shotPlan.sequences.flatMap((s) => s.shots);
  const kitHints = kitHintFromShotTypes(allShots);
  const { withPrompt: promptsReady } = countShotsWithPrompts(state);

  if (summary.totalShots === 0 && summary.totalSequences === 0) return null;

  return (
    <section className="rounded-2xl bg-pro-elevated/60 p-5 ring-1 ring-white/[0.06] sm:p-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Clapperboard} label={promptPack ? "Visual beats" : "Total shots"} value={String(summary.totalShots)} />
        {!promptPack ? (
          <>
            <Stat icon={Calendar} label="Est. shoot days" value={summary.estimatedShootDays.toFixed(1)} />
            <Stat icon={Percent} label="Coverage" value={`${summary.coveragePercent}%`} highlight />
          </>
        ) : (
          <Stat icon={Percent} label="Prompts ready" value={String(promptsReady)} highlight />
        )}
        <Stat icon={Layers} label="Scenes" value={String(summary.totalSequences)} />
      </div>
      <p className="mt-3 text-xs text-pro-text-secondary">
        {promptPack ? (
          <>
            {promptsReady} copy-ready prompt{promptsReady === 1 ? "" : "s"} across{" "}
            {summary.totalSequences} scene{summary.totalSequences === 1 ? "" : "s"}.
            {onGoToTab ? (
              <>
                {" "}
                <button
                  type="button"
                  className="font-medium text-pro-primary underline-offset-2 hover:underline"
                  onClick={() => onGoToTab("prompts")}
                >
                  Open Prompts to copy →
                </button>
              </>
            ) : null}
          </>
        ) : (
          <>
            ~{summary.totalDurationMinutes} min screen time · {summary.approvedSceneCount} approved
            scene{summary.approvedSceneCount === 1 ? "" : "s"} linked
          </>
        )}
      </p>
      {kitHints.length > 0 ? (
        <p className="mt-2 text-xs text-pro-text-secondary">
          Kit hints: <span className="text-pro-text">{kitHints.join(" · ")}</span>
          {onGoToTab ? (
            <button
              type="button"
              className="ml-2 text-pro-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/40"
              onClick={() => onGoToTab("kit")}
            >
              Open Kit →
            </button>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-pro-muted/80 px-3 py-3 ring-1 ring-white/[0.05]">
      <div className="flex items-center gap-2 text-pro-text-secondary">
        <Icon className="size-3.5" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p
        className={`mt-1.5 text-2xl font-semibold tabular-nums ${
          highlight ? "text-pro-primary" : "text-pro-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
