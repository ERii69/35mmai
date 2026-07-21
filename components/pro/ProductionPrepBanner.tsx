"use client";

import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { ensureShotPlanFromScript } from "@/lib/pro/ensure-shot-plan-from-script";
import { prepProductionHints } from "@/lib/pro/sync-production-from-prep";
import { syncProductionFromPrep } from "@/lib/pro/sync-production-from-prep";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  onGoToShots?: () => void;
};

export function ProductionPrepBanner({ state, updateState, onGoToShots }: Props) {
  const hints = prepProductionHints(state);
  if (hints.length === 0) return null;

  return (
    <div className="rounded-xl bg-pro-primary/10 px-4 py-3 ring-1 ring-pro-primary/25">
      <div className="flex items-start gap-2">
        <Link2 className="mt-0.5 size-4 shrink-0 text-pro-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-pro-text">Connected to Prep</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-pro-text-secondary">
            {hints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              size="sm"
              className={`${proBtn.primary} w-full sm:w-auto`}
              onClick={() =>
                updateState((p) => {
                  const { state: next } = ensureShotPlanFromScript(p);
                  return syncProductionFromPrep(next);
                })
              }
            >
              Build shot plan from script
            </Button>
            <div className="hidden gap-2 sm:flex sm:flex-wrap">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={proBtn.outline}
              onClick={() => updateState((p) => syncProductionFromPrep(p))}
            >
              Sync budget from prep
            </Button>
            {onGoToShots ? (
              <Button type="button" size="sm" className={proBtn.primary} onClick={onGoToShots}>
                Open shot plan
              </Button>
            ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
