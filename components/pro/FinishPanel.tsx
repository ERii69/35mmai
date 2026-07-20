"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostDeliverablesPanel } from "@/components/pro/post/PostDeliverablesPanel";
import { PostSignOffPanel } from "@/components/pro/post/PostSignOffPanel";
import { proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  onGoToExport?: () => void;
};

/** Slim finish step for script-to-prompt — checklist; download lives on Export tab. */
export function FinishPanel({ state, updateState, onGoToExport }: Props) {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-pro-text">Sign-off</h2>
        <p className="mt-2 max-w-xl text-[15px] leading-normal text-pro-text-secondary">
          When your external generations are ready, check off the list below. Download your prompt pack
          from <strong className="text-pro-text">Finish → Export</strong> — that&apos;s the one file to
          keep.
        </p>
        {onGoToExport ? (
          <Button
            type="button"
            className={`${proBtn.primary} mt-4`}
            onClick={onGoToExport}
          >
            Export
            <ArrowRight className="ml-2 size-4" aria-hidden />
          </Button>
        ) : null}
      </header>

      <section className={proSurface.sectionMuted}>
        <PostSignOffPanel state={state} updateState={updateState} />
      </section>

      <section>
        <PostDeliverablesPanel state={state} updateState={updateState} />
      </section>
    </div>
  );
}
