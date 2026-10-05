"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptLocksEditor } from "@/components/pro/PromptLocksEditor";
import { PromptSceneSection } from "@/components/pro/PromptSceneSection";
import { PromptStickyActions } from "@/components/pro/PromptStickyActions";
import { PromptsHowToTip } from "@/components/pro/PromptsHowToTip";
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
  promptViewState,
  rebuildShotPromptInState,
  syncShotPromptsInState,
} from "@/lib/pro/sync-shot-prompts";
import { promptJobIsKnown } from "@/lib/pro/directed-prompt";
import {
  continuityWarnings,
  derivePromptLocks,
  staleSceneNumbers,
} from "@/lib/pro/prompt-locks";
import type { ProductionTabId } from "@/lib/pro/workspace-modes";
import type { ProjectStatePayload, PromptJob, PromptLocksState } from "@/lib/pro/types";

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
    if (existingTotal > 0) return promptViewState(state);
    return buildScriptToPromptPackState(state);
  }, [state]);

  useEffect(() => {
    if (displayState === state) return;
    updateState(() => displayState);
  }, [displayState, state, updateState]);

  const locks = useMemo<PromptLocksState>(() => {
    const saved = displayState.directorPrep.promptLocks;
    if (saved && (saved.characters.length > 0 || saved.places.length > 0)) return saved;
    return derivePromptLocks(displayState);
  }, [displayState]);
  const warnings = useMemo(() => continuityWarnings(displayState), [displayState]);
  const stale = useMemo(() => new Set(staleSceneNumbers(displayState)), [displayState]);

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
      message: "Prompts now follow your sentences.",
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

  function promptsFollowingLocks(next: ProjectStatePayload): ProjectStatePayload {
    return syncShotPromptsInState(next, { onlyEmpty: false, applyRouting: true });
  }

  function patchKeptStill(id: string, text: string) {
    updateState((p) => {
      const saved = p.directorPrep.promptLocks;
      const current =
        saved && (saved.characters.length > 0 || saved.places.length > 0)
          ? saved
          : derivePromptLocks(p);
      return promptsFollowingLocks({
        ...p,
        directorPrep: {
          ...p.directorPrep,
          promptLocks: {
            ...current,
            characters: current.characters.map((row) =>
              row.id === id ? { ...row, keptStillPrompt: text } : row
            ),
          },
        },
      });
    });
  }

  function setToolShape(rank: number, job: PromptJob) {
    updateState((p) => {
      const saved = p.directorPrep.promptLocks ?? derivePromptLocks(p);
      return {
        ...p,
        directorPrep: {
          ...p.directorPrep,
          promptLocks: {
            ...saved,
            toolShapes: { ...saved.toolShapes, [String(rank)]: job },
          },
        },
      };
    });
  }

  function patchLock(kind: "character" | "place", id: string, look: string) {
    updateState((p) => {
      const saved = p.directorPrep.promptLocks;
      const current =
        saved && (saved.characters.length > 0 || saved.places.length > 0)
          ? saved
          : derivePromptLocks(p);
      const next: PromptLocksState = {
        ...current,
        characters:
          kind === "character"
            ? current.characters.map((row) => (row.id === id ? { ...row, look } : row))
            : current.characters,
        places:
          kind === "place"
            ? current.places.map((row) => (row.id === id ? { ...row, look } : row))
            : current.places,
      };
      return promptsFollowingLocks({
        ...p,
        directorPrep: { ...p.directorPrep, promptLocks: next },
      });
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
          Write the frame. Pick the tool. Copy the prompt and paste it there. Nothing is generated here.
        </p>
      </header>

      <PromptsHowToTip projectId={projectId} />

      <PromptStickyActions
        withPrompt={withPrompt}
        total={total}
        onBuildAll={buildAll}
        onRefreshAll={rerouteAll}
        onGoToExport={() => onGoToTab("export")}
      />

      <PromptLocksEditor
        locks={locks}
        warnings={warnings}
        copiedKey={copiedKey}
        onLookChange={patchLock}
        onKeptStillChange={patchKeptStill}
        onCopy={copyText}
      />

      <div className="space-y-5">
        {displayState.shotPlan.sequences.map((seq, seqIndex) => (
          <PromptSceneSection
            key={seq.id}
            seq={seq}
            seqIndex={seqIndex}
            stale={seq.sceneNumber != null && stale.has(seq.sceneNumber)}
            toolOptions={toolOptions}
            copiedKey={copiedKey}
            onToolChange={(shotIndex, rank) =>
              updateState((p) => rebuildShotPromptInState(p, seqIndex, shotIndex, rank))
            }
            onSentenceChange={(shotIndex, text) =>
              updateState((p) => {
                const withSentence = {
                  ...p,
                  shotPlan: {
                    sequences: p.shotPlan.sequences.map((seq, si) => {
                      if (si !== seqIndex) return seq;
                      return {
                        ...seq,
                        shots: seq.shots.map((shot, shi) =>
                          shi === shotIndex ? { ...shot, frameSentence: text, promptEdited: false } : shot
                        ),
                      };
                    }),
                  },
                };
                const rank =
                  withSentence.shotPlan.sequences[seqIndex]?.shots[shotIndex]?.recommendedToolRank ??
                  6;
                return rebuildShotPromptInState(withSentence, seqIndex, shotIndex, rank);
              })
            }
            onPromptChange={(shotIndex, text) =>
              patchShot(seqIndex, shotIndex, { aiGenerationPrompt: text, promptEdited: true })
            }
            toolShapeKnown={(rank) => promptJobIsKnown(displayState, rank)}
            onToolShape={(rank, job) => setToolShape(rank, job)}
            onNegativeChange={(shotIndex, text) =>
              patchShot(seqIndex, shotIndex, { aiNegativePrompt: text })
            }
            onCopy={copyText}
          />
        ))}
      </div>

      <footer className="rounded-xl bg-pro-muted/30 px-4 py-3 text-xs leading-relaxed text-pro-text-secondary ring-1 ring-white/[0.06]">
        Copy the prompt into the tool. The picture is made there, not here.
      </footer>
    </div>
  );
}
