"use client";

import { ArrowRight, Plus, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeyboardShortcutTooltip } from "@/components/pro/ux/KeyboardShortcutTooltip";
import { proBtn } from "@/components/pro/ux/pro-surfaces";

type Props = {
  onSuggestCoverage: () => void;
  onMatchVisualBible: () => void;
  onAddSequence: () => void;
  onGoToExport?: () => void;
  onGenerate?: () => void;
  generating?: boolean;
  canGenerate?: boolean;
  disabled?: boolean;
  hideCoverageActions?: boolean;
};

export function ProductionQuickActionsBar({
  onSuggestCoverage,
  onMatchVisualBible,
  onAddSequence,
  onGoToExport,
  onGenerate,
  generating,
  canGenerate,
  disabled,
  hideCoverageActions = false,
}: Props) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 hidden border-t border-white/[0.06] bg-pro-base/95 px-4 py-3 backdrop-blur-md sm:-mx-0 sm:rounded-2xl sm:border sm:ring-1 sm:ring-white/[0.06] md:block">
      <p className="mb-2 text-[11px] text-pro-text-secondary">
        {hideCoverageActions
          ? "Beats rebuild from prep — download your pack from Finish → Export."
          : "Generate shot plan rebuilds all cards from Prep. Suggest coverage only fills missing wide / medium / close-up."}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {onGenerate ? (
          <KeyboardShortcutTooltip shortcutId="generate_shot_plan">
            <Button
              type="button"
              size="sm"
              className={proBtn.primary}
              disabled={!canGenerate || generating || disabled}
              onClick={onGenerate}
            >
              <Wand2 className="mr-1.5 size-3.5" aria-hidden />
              {generating ? "Generating…" : hideCoverageActions ? "Rebuild beats" : "Generate shot plan"}
            </Button>
          </KeyboardShortcutTooltip>
        ) : null}
        {!hideCoverageActions ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={proBtn.outline}
          disabled={disabled}
          onClick={onSuggestCoverage}
        >
          <Sparkles className="mr-1.5 size-3.5" aria-hidden />
          Suggest coverage
        </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          className={proBtn.apply}
          disabled={disabled}
          onClick={onMatchVisualBible}
        >
          Match visual bible
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={proBtn.outline}
          disabled={disabled}
          onClick={onAddSequence}
        >
          <Plus className="mr-1.5 size-3.5" aria-hidden />
          Add sequence
        </Button>
        {onGoToExport ? (
          <div className="ml-auto">
            <Button type="button" size="sm" variant="ghost" className={proBtn.ghostToolbar} onClick={onGoToExport}>
              Export
              <ArrowRight className="ml-1 size-3.5" aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
