"use client";

import { Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RefinePreview } from "@/lib/pro/refine-preview";

type Props = {
  preview: RefinePreview;
  minutesLabel: string;
  costLabel: string;
  onConfirm: () => void;
  onDismiss: () => void;
  running?: boolean;
  disabled?: boolean;
};

export function RefinePreviewCard({
  preview,
  minutesLabel,
  costLabel,
  onConfirm,
  onDismiss,
  running,
  disabled,
}: Props) {
  const skipped = preview.skippedAgentLabels;

  return (
    <div className="rounded-xl border border-pro-primary/30 bg-pro-primary/5 p-4">
      <div className="flex items-start gap-2">
        <Eye className="mt-0.5 size-4 shrink-0 text-pro-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">Preview changes</p>
          <p className="mt-0.5 text-xs text-pro-text-secondary">
            Review what will run before you commit. Unchanged sections stay as-is.
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/[0.08] bg-pro-elevated px-3 py-2.5 text-xs">
        <p className="font-medium text-pro-text">Agents that will run</p>
        <p className="mt-1 text-pro-text">{preview.agentLabels.join(" → ")}</p>
        {skipped.length > 0 ? (
          <p className="mt-2 text-pro-text-secondary">
            <span className="text-[#525252]">Unchanged: </span>
            {skipped.join(", ")}
          </p>
        ) : null}
        <p className="mt-2 text-pro-text-secondary">
          {minutesLabel} · {costLabel}
        </p>
      </div>

      <ul className="mt-3 space-y-1.5 text-xs text-pro-text-secondary">
        {preview.changeSummary.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="text-pro-primary">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {preview.trustNote ? (
        <p className="mt-3 text-[10px] leading-relaxed text-[#525252]">{preview.trustNote}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          className="bg-pro-primary hover:brightness-110"
          disabled={disabled || running}
          onClick={onConfirm}
        >
          <Sparkles className="mr-1.5 size-3.5" aria-hidden />
          {running ? "Running refine…" : "Run refine"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-white/[0.1] text-pro-text-secondary"
          disabled={running}
          onClick={onDismiss}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
