"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { proBtn } from "@/components/pro/ux/pro-surfaces";

type Props = {
  withPrompt: number;
  total: number;
  onBuildAll: () => void;
  onRefreshAll: () => void;
  onGoToExport: () => void;
};

/** Inline prompts toolbar — not sticky (avoids triple chrome stack). */
export function PromptStickyActions({
  withPrompt,
  total,
  onBuildAll,
  onRefreshAll,
  onGoToExport,
}: Props) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-pro-muted/40 px-4 py-3 ring-1 ring-white/[0.04]">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-xs text-pro-text-secondary">
          <span className="font-medium text-pro-text">
            {withPrompt}/{total}
          </span>{" "}
          prompts ready · download from{" "}
          <span className="font-medium text-pro-text">Finish → Export</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" className={proBtn.primary} onClick={onBuildAll}>
            <Sparkles className="mr-1.5 size-3.5" aria-hidden />
            Build all
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/10 text-pro-text"
            onClick={onRefreshAll}
          >
            Re-route tools
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-pro-primary hover:text-pro-primary/90"
            onClick={onGoToExport}
          >
            Export
            <ArrowRight className="ml-1.5 size-3.5" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
