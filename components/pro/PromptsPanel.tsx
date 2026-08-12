"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptSceneSection } from "@/components/pro/PromptSceneSection";
import { PromptStickyActions } from "@/components/pro/PromptStickyActions";
import { ProEmptyState } from "@/components/pro/ux/ProEmptyState";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import {
  buildScriptToPromptPackState,
  rebuildAllPromptsInState,
} from "@/lib/pro/build-script-to-prompt-pack";
import {
  countShotsWithPrompts,
  promptToolOptions,
  rebuildShotPromptInState,
  syncShotPromptsInState,
} from "@/lib/pro/sync-shot-prompts";
import type { ProductionTabId } from "@/lib/pro/workspace-modes";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  projectId: string;
  projectName: string;
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  onGoToTab: (tab: ProductionTabId) => void;
  onGoToPrepGenerate?: () => void;
};

export function PromptsPanel({
  projectId,
  projectName,
  state,
  updateState,
  onGoToTab,
  onGoToPrepGenerate,
}: Props) {
  const { showToast } = useProToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const usingScriptToPrompt = isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);

  // Trust saved shot plan + tool overrides. Only auto-build when there are no beats yet.
  // Regenerating on every render was resetting manual tool picks (e.g. LTX) back to Midjourney.
  const displayState = useMemo(() => {
    const existingTotal = state.shotPlan.sequences.reduce((n, seq) => n + seq.shots.length, 0);
    if (existingTotal > 0) {
      const { withPrompt, total } = countShotsWithPrompts(state);
      if (withPrompt < total) {
        return syncShotPromptsInState(state, {
          onlyEmpty: true,
          applyRouting: true,
          forceRouting: false,
        });
      }
      return state;
    }
    return buildScriptToPromptPackState(state);
  }, [state]);

  const toolOptions = useMemo(() => promptToolOptions(displayState), [displayState]);
  const { total, withPrompt } = useMemo(() => countShotsWithPrompts(displayState), [displayState]);
  const hasShots = total > 0;

  async function copyText(key: string, text: string, label: string) {
    if (!text.trim()) {
      showToast({ message: "Nothing to copy yet — build prompts first.", variant: "info" });
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast({ message: `${label} copied.`, variant: "success" });
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast({ message: "Could not copy — select and copy manually.", variant: "error" });
    }
  }

  function buildAll() {
    updateState((p) => rebuildAllPromptsInState(p));
    showToast({
      message: "Rebuilt every prompt from script + look (cleared look-bible clutter).",
      variant: "success",
    });
  }

  function rerouteAll() {
    updateState((p) => rebuildAllPromptsInState(p, { forceRouting: true }));
    showToast({
      message: "Spread tools by beat: Midjourney · LTX · Nano · Kling (motion).",
      variant: "success",
    });
  }

  function patchShot(
    seqIndex: number,
    shotIndex: number,
    patch: Partial<(typeof state.shotPlan.sequences)[number]["shots"][number]>
  ) {
    updateState((p) => {
      const sequences = p.shotPlan.sequences.map((seq, si) => {
        if (si !== seqIndex) return seq;
        return {
          ...seq,
          shots: seq.shots.map((shot, shi) =>
            shi === shotIndex ? { ...shot, ...patch } : shot
          ),
        };
      });
      return { ...p, shotPlan: { sequences } };
    });
  }

  if (!hasShots) {
    return (
      <ProEmptyState
        icon={<Sparkles className="size-10 text-pro-primary/80" aria-hidden />}
        title="No visual beats yet"
        description={
          usingScriptToPrompt
            ? "Approve scenes in Script → Run prep and lock your look — prompts build here automatically."
            : "Add or generate a shot plan first, then build tool-native prompts for Midjourney, Nano, Kling, LTX, and Higgsfield."
        }
        action={
          usingScriptToPrompt && onGoToPrepGenerate ? (
            <Button
              type="button"
              className="bg-pro-primary hover:brightness-110"
              onClick={onGoToPrepGenerate}
            >
              Go to Script → Run prep
            </Button>
          ) : usingScriptToPrompt ? undefined : (
            <Button
              type="button"
              className="bg-pro-primary hover:brightness-110"
              onClick={() => onGoToTab("shots")}
            >
              Open Shots
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-pro-text">Prompts</h2>
        <p className="mt-1 max-w-2xl text-sm text-pro-text-secondary">
          Tool-native prompts from your approved script and look bible — copy into Midjourney, Nano,
          Kling, LTX, or Higgsfield. Nothing generates inside 35mmPRO.
        </p>
      </header>

      <PromptStickyActions
        withPrompt={withPrompt}
        total={total}
        onBuildAll={buildAll}
        onRefreshAll={rerouteAll}
        onGoToExport={() => onGoToTab("export")}
      />

      <div className="space-y-5">
        {displayState.shotPlan.sequences.map((seq, seqIndex) => (
          <PromptSceneSection
            key={seq.id}
            seq={seq}
            seqIndex={seqIndex}
            toolOptions={toolOptions}
            copiedKey={copiedKey}
            onToolChange={(shotIndex, rank) =>
              updateState((p) => rebuildShotPromptInState(p, seqIndex, shotIndex, rank))
            }
            onPromptChange={(shotIndex, text) =>
              patchShot(seqIndex, shotIndex, { aiGenerationPrompt: text })
            }
            onNegativeChange={(shotIndex, text) =>
              patchShot(seqIndex, shotIndex, { aiNegativePrompt: text })
            }
            onCopy={copyText}
          />
        ))}
      </div>

      <footer className="rounded-xl bg-pro-muted/30 px-4 py-3 text-xs leading-relaxed text-pro-text-secondary ring-1 ring-white/[0.06]">
        ~3–4 prompts per scene from approved script + look. Copy each line into the linked external tool.
      </footer>
    </div>
  );
}
