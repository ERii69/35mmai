"use client";

import { X } from "lucide-react";
import { useWorkspaceMilestoneHint } from "@/lib/pro/use-workspace-milestone-hint";

type Props = {
  projectId: string;
};

const TIP_ID = "prompts-howto-v1";

/** First-visit how-to on Finish → Prompts — dismissible per project. */
export function PromptsHowToTip({ projectId }: Props) {
  const { visible, dismiss } = useWorkspaceMilestoneHint(projectId, TIP_ID);
  if (!visible) return null;

  return (
    <aside
      className="rounded-xl border border-pro-primary/25 bg-pro-primary/[0.07] px-4 py-3 ring-1 ring-pro-primary/15"
      aria-labelledby="prompts-howto-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            id="prompts-howto-title"
            className="text-[10px] font-semibold uppercase tracking-wider text-pro-primary"
          >
            How to use prompts
          </p>
          <ol className="mt-2 space-y-1.5 text-sm leading-snug text-pro-text">
            <li>
              <span className="font-medium text-pro-text">1.</span> Pick a tool on the beat
              (Midjourney, Kling, LTX…).
            </li>
            <li>
              <span className="font-medium text-pro-text">2.</span> Tap <span className="font-medium">Copy</span>{" "}
              (and <span className="font-medium">Copy neg</span> if the tool uses negatives).
            </li>
            <li>
              <span className="font-medium text-pro-text">3.</span> Tap{" "}
              <span className="font-medium">Open tool</span> → paste → generate. Nothing runs inside
              35mmAiPro.
            </li>
          </ol>
          <p className="mt-2 text-xs text-pro-text-secondary">
            Prefer a file? Use <span className="font-medium text-pro-text">Export</span> for the full
            Markdown / CSV pack.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg p-2 text-pro-text-secondary transition hover:bg-white/5 hover:text-pro-text touch-manipulation"
          onClick={dismiss}
          aria-label="Dismiss how to use prompts"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </aside>
  );
}
