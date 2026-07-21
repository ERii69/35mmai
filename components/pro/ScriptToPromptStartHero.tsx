"use client";

import { FileUp, Layers, Sparkles, Upload } from "lucide-react";
import { proMarketing } from "@/components/pro/pro-marketing-surfaces";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { PRO_SCENE_HEADING_REQUIRED } from "@/lib/pro/scene-heading-copy";

type Props = {
  onTryDemo: () => void;
  onLoadFiveSceneSample: () => void;
  onPasteScript: () => void;
  onUploadScript: () => void;
  onChangeWorkflow: () => void;
  demoBusy?: boolean;
};

/** Empty Script tab — template-first entry for Script to prompt. */
export function ScriptToPromptStartHero({
  onTryDemo,
  onLoadFiveSceneSample,
  onPasteScript,
  onUploadScript,
  onChangeWorkflow,
  demoBusy = false,
}: Props) {
  return (
    <div className="mb-4 space-y-3">
      <div className="rounded-xl border border-pro-accent/20 bg-gradient-to-b from-pro-accent/[0.08] to-transparent p-4 ring-1 ring-pro-accent/10">
        <p className="flex items-center gap-2 text-sm font-semibold text-pro-text">
          <Sparkles className={`size-4 shrink-0 ${proMarketing.heroIcon}`} aria-hidden />
          Script to prompt
        </p>
        <p className="mt-1 text-xs leading-relaxed text-pro-text-secondary">
          Paste your screenplay, run prep, lock your look, then copy prompts for Midjourney, Kling, LTX,
          and your kit.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          disabled={demoBusy}
          onClick={onTryDemo}
          className={`${proBtn.marketingPrimary} flex min-h-[5.5rem] flex-col items-start justify-between gap-2 p-4 text-left disabled:opacity-60`}
        >
          <Sparkles className="size-5 shrink-0" aria-hidden />
          <span>
            <span className="block text-sm font-semibold">Try 3-scene demo</span>
            <span className="mt-0.5 block text-xs font-normal opacity-90">Instant prompts — no paste needed</span>
          </span>
        </button>

        <button
          type="button"
          onClick={onPasteScript}
          className="flex min-h-[5.5rem] flex-col items-start justify-between gap-2 rounded-xl border border-white/[0.1] bg-pro-elevated/80 p-4 text-left transition hover:border-white/20 hover:bg-pro-elevated"
        >
          <FileUp className="size-5 shrink-0 text-pro-text-secondary" aria-hidden />
          <span>
            <span className="block text-sm font-semibold text-pro-text">Paste your script</span>
            <span className="mt-0.5 block text-xs text-pro-text-secondary">Fountain-style INT./EXT. headings</span>
          </span>
        </button>

        <button
          type="button"
          onClick={onUploadScript}
          className="flex min-h-[5.5rem] flex-col items-start justify-between gap-2 rounded-xl border border-white/[0.1] bg-pro-elevated/80 p-4 text-left transition hover:border-white/20 hover:bg-pro-elevated"
        >
          <Upload className="size-5 shrink-0 text-pro-text-secondary" aria-hidden />
          <span>
            <span className="block text-sm font-semibold text-pro-text">Upload .txt / .fountain</span>
            <span className="mt-0.5 block text-xs text-pro-text-secondary">Or pick another template</span>
          </span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-1.5 text-center">
        <button
          type="button"
          onClick={onLoadFiveSceneSample}
          className="text-xs font-medium text-pro-text-secondary underline-offset-2 transition hover:text-pro-text hover:underline"
        >
          Load 5-scene sample
        </button>
        <p className="max-w-md text-[11px] leading-snug text-pro-text-secondary/80">
          {PRO_SCENE_HEADING_REQUIRED}
        </p>
      </div>

      <p className="text-center text-xs text-pro-text-secondary">
        <button
          type="button"
          onClick={onChangeWorkflow}
          className="inline-flex items-center gap-1 font-medium text-pro-text-secondary underline-offset-2 transition hover:text-pro-text hover:underline"
        >
          <Layers className="size-3.5" aria-hidden />
          Classical AI short, Blank, and more templates
        </button>
      </p>
    </div>
  );
}
