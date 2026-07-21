"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clapperboard,
  Loader2,
  Plus,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverageGapsPanel } from "@/components/pro/CoverageGapsPanel";
import { ProductionQuickActionsBar } from "@/components/pro/ProductionQuickActionsBar";
import { ProProductionQuickActionsMobile } from "@/components/pro/ProProductionQuickActionsMobile";
import { KeyboardShortcutTooltip } from "@/components/pro/ux/KeyboardShortcutTooltip";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import { ProEmptyState } from "@/components/pro/ux/ProEmptyState";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import { ProLoadingBar } from "@/components/pro/ux/ProLoadingBar";
import { ProStatusBanner } from "@/components/pro/ux/ProStatusBanner";
import { ThinkingLogPanel } from "@/components/pro/ux/ThinkingLogPanel";
import { logEntryForAgent, newThinkingLogEntry, type ThinkingLogEntry } from "@/lib/pro/thinking-log";
import { ShotCard } from "@/components/pro/ShotCard";
import { ShotPlanActionBanner } from "@/components/pro/ShotPlanActionBanner";
import { ShotPlanSummary } from "@/components/pro/ShotPlanSummary";
import { ShotSequenceContext } from "@/components/pro/ShotSequenceContext";
import { applyCrossTabIntelligence } from "@/lib/pro/cross-tab-sync";
import { ensureShotPlanFromScript } from "@/lib/pro/ensure-shot-plan-from-script";
import { PRO_SCENE_HEADING_REQUIRED } from "@/lib/pro/scene-heading-copy";
import { generateShotPlanFromPrep } from "@/lib/pro/generate-shot-plan-from-prep";
import { migrateShotPlanLegacy } from "@/lib/pro/migrate-shot-plan-legacy";
import { recordShotStatusMemory } from "@/lib/pro/record-shot-memory";
import {
  matchVisualBibleToShotPlan,
  suggestMissingCoverageShots,
  visualBibleContextLine,
} from "@/lib/pro/shot-plan-enrichment";
import {
  moveShotBetweenSequences,
  moveShotInSequence,
  newPlannedShot,
  newShotSequence,
} from "@/lib/pro/shot-plan";
import {
  isCorruptReferenceFragment,
  mergeReferenceUrls,
  normalizePhotoDataUrl,
  partitionReferenceUrls,
} from "@/lib/pro/reference-url-utils";
import { sanitizeReferenceUrls } from "@/lib/pro/suggest-look-references";
import { checkVisualConsistency } from "@/lib/pro/visual-consistency-check";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import type { PlannedShot, ProjectStatePayload, ShotSequence } from "@/lib/pro/types";
import type { ProductionTabId } from "@/lib/pro/workspace-modes";

const fieldClass = proSurface.field;

type Props = {
  projectId: string;
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  agentsEnabled?: boolean;
  onPersist?: () => void | Promise<void>;
  onGoToTab?: (tab: ProductionTabId) => void;
};

export function ShotsPanel({
  projectId,
  state,
  updateState,
  agentsEnabled,
  onPersist,
  onGoToTab,
}: Props) {
  const scriptToPrompt = isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);
  const [canDragReorder, setCanDragReorder] = useState(false);
  const [dragShot, setDragShot] = useState<{ seqIndex: number; shotIndex: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => setCanDragReorder(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const [dropTarget, setDropTarget] = useState<{ seqIndex: number; shotIndex: number } | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { showToast: pushToast } = useProToast();
  const [feedback, setFeedback] = useState<{ variant: "success" | "error"; message: string } | null>(
    null
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [shotThinkingLog, setShotThinkingLog] = useState<ThinkingLogEntry[]>([]);
  const [actionBanner, setActionBanner] = useState<{ title: string; detail: string } | null>(
    null
  );

  const issues = checkVisualConsistency(state);
  const approvedCount = state.directorPrep.scenes.filter((s) => s.status === "approved").length;
  const sceneCount = state.directorPrep.scenes.length;
  const palette = state.visualBible.palette;
  const hasApproved = approvedCount > 0;
  const canGenerate = hasApproved || sceneCount > 0;

  const referenceOptions = useMemo(() => {
    const raw = [
      ...sanitizeReferenceUrls(state.visualBible.referenceUrls),
      ...state.directorPrep.scenes.flatMap((s) => s.visualRefs),
    ]
      .map((u) => normalizePhotoDataUrl(u.trim()))
      .filter((u) => u.length > 0 && !isCorruptReferenceFragment(u));
    const { photos, labels } = partitionReferenceUrls(raw);
    return mergeReferenceUrls(photos, labels);
  }, [state.visualBible.referenceUrls, state.directorPrep.scenes]);

  useEffect(() => {
    if (state.shotPlan.sequences.some((s) => s.shots.length === 0)) {
      updateState((p) => migrateShotPlanLegacy(p));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || !e.shiftKey || e.key.toLowerCase() !== "g") return;
      if (aiLoading || !canGenerate) return;
      e.preventDefault();
      if (agentsEnabled) {
        void generateFromApproved();
      } else {
        generateLocalFromApproved();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hotkey when panel open
  }, [aiLoading, canGenerate, agentsEnabled]);

  function countShots(seqs: ShotSequence[]): number {
    return seqs.reduce((n, seq) => n + seq.shots.length, 0);
  }

  function showActionBanner(title: string, detail: string) {
    setActionBanner({ title, detail });
  }

  function showSuccess(msg: string, banner?: { title: string; detail: string }) {
    setFeedback({ variant: "success", message: msg });
    pushToast({ message: msg, variant: "success" });
    if (banner) showActionBanner(banner.title, banner.detail);
    window.setTimeout(() => setFeedback(null), 4500);
  }

  function patchSequences(fn: (seqs: ShotSequence[]) => ShotSequence[]) {
    updateState((p) =>
      applyCrossTabIntelligence({ ...p, shotPlan: { sequences: fn(p.shotPlan.sequences) } }, "production")
    );
  }

  function updateShot(
    seqIndex: number,
    shotIndex: number,
    shot: PlannedShot,
    prevStatus?: PlannedShot["status"]
  ) {
    updateState((p) => {
      let next = { ...p };
      const seqs = [...next.shotPlan.sequences];
      const shots = [...seqs[seqIndex].shots];
      shots[shotIndex] = shot;
      seqs[seqIndex] = { ...seqs[seqIndex], shots };
      next = { ...next, shotPlan: { sequences: seqs } };
      if (prevStatus != null) {
        next = recordShotStatusMemory(next, shot, prevStatus, shot.status);
      }
      return applyCrossTabIntelligence(next, "production");
    });
  }

  async function generateFromApproved() {
    setAiLoading(true);
    setFeedback(null);
    setShotThinkingLog([
      newThinkingLogEntry({
        agentId: "shot_list",
        agentLabel: "Shot Planner",
        message: "Reading approved scenes and visual bible…",
        phase: "working",
      }),
    ]);
    try {
      const res = await fetch(`/api/pro/shot-plan/${projectId}/generate`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        source?: string;
        shotPlan?: ProjectStatePayload["shotPlan"];
        scenes?: ProjectStatePayload["directorPrep"]["scenes"];
        shotCount?: number;
        warning?: string;
      };
      if (!res.ok || !data.ok || !data.shotPlan) {
        if (res.status === 429) {
          const msg = data.error ?? "Daily AI limit reached — use quick prep";
          setFeedback({ variant: "error", message: msg });
          pushToast({ message: msg, variant: "error" });
          return;
        }
        setFeedback({ variant: "error", message: data.error ?? "Shot plan generation failed" });
        throw new Error(data.error ?? "Shot plan generation failed");
      }
      updateState((p) =>
        applyCrossTabIntelligence(
          {
            ...p,
            shotPlan: data.shotPlan!,
            directorPrep: data.scenes ? { ...p.directorPrep, scenes: data.scenes } : p.directorPrep,
          },
          "full"
        )
      );
      setShotThinkingLog((prev) => [
        ...prev.map((e) => (e.phase === "working" ? { ...e, phase: "done" as const } : e)),
        logEntryForAgent(
          "shot_list",
          data.warning
            ? `Built ${data.shotCount ?? 0} shots (${data.source}) — ${data.warning}`
            : `Built ${data.shotCount ?? 0} shots from prep + visual bible.`,
          "done"
        ),
      ]);
      showSuccess(
        data.warning
          ? `Shot plan (${data.source}) — ${data.warning}`
          : `Generated ${data.shotCount ?? 0} shots from prep + visual bible.`,
        {
          title: "Shot plan updated",
          detail: scriptToPrompt
            ? `Built ${data.shotCount ?? 0} visual beat${(data.shotCount ?? 0) === 1 ? "" : "s"} from prep. Open Finish → Prompts to copy generation lines.`
            : `Built ${data.shotCount ?? 0} shot card${(data.shotCount ?? 0) === 1 ? "" : "s"} from approved scenes. Edit each card below — lens and lighting notes are prefilled from your look bible.`,
        }
      );
      await onPersist?.();
    } catch (e) {
      const preview = generateShotPlanFromPrep(state);
      const shotCount = countShots(preview.shotPlan.sequences);
      updateState((p) => applyCrossTabIntelligence(generateShotPlanFromPrep(p), "full"));
      const msg = e instanceof Error ? e.message : "Used local fallback from prep scenes.";
      if (msg.includes("failed")) {
        setFeedback({ variant: "error", message: msg });
      } else {
        showSuccess(msg, {
          title: "Shot plan rebuilt (local)",
          detail: scriptToPrompt
            ? `${shotCount} visual beat${shotCount === 1 ? "" : "s"} from your scenes. Copy prompts in Finish → Prompts.`
            : `${shotCount} shot card${shotCount === 1 ? "" : "s"} from prep scenes — adjust coverage on each card below.`,
        });
      }
      await onPersist?.();
    } finally {
      setAiLoading(false);
      window.setTimeout(() => setShotThinkingLog([]), 8000);
    }
  }

  function generateLocalFromApproved() {
    const preview = generateShotPlanFromPrep(state);
    const shotCount = countShots(preview.shotPlan.sequences);
    const sceneN = approvedCount > 0 ? approvedCount : sceneCount;
    updateState((p) => applyCrossTabIntelligence(generateShotPlanFromPrep(p), "full"));
    showSuccess(`Built shot plan from ${sceneN} scene(s).`, {
      title: scriptToPrompt ? "Visual beats rebuilt" : "Shot plan rebuilt",
      detail: scriptToPrompt
        ? `${shotCount} beat${shotCount === 1 ? "" : "s"} ready — cards below are reference only; copy text in Finish → Prompts.`
        : `${shotCount} shot card${shotCount === 1 ? "" : "s"} across ${sceneN} scene${sceneN === 1 ? "" : "s"}. Each card is one angle — use Suggest coverage if wide/medium/close-up are missing.`,
    });
  }

  function suggestCoverage() {
    let added = 0;
    const touched: string[] = [];
    updateState((p) => {
      const seqs = p.shotPlan.sequences.map((seq) => {
        const scene =
          seq.sceneNumber != null
            ? p.directorPrep.scenes.find((s) => s.number === seq.sceneNumber)
            : p.directorPrep.scenes.find((s) => s.linkedSequenceId === seq.id);
        const missing = suggestMissingCoverageShots(seq.shots, p, scene?.id ?? null);
        if (!missing.length) return seq;
        added += missing.length;
        touched.push(seq.title || `Scene ${seq.sceneNumber ?? ""}`.trim());
        return { ...seq, shots: [...seq.shots, ...missing] };
      });
      return applyCrossTabIntelligence({ ...p, shotPlan: { sequences: seqs } }, "production");
    });
    showSuccess(
      added ? `Added ${added} suggested shot(s).` : "Coverage already complete.",
      {
        title: added ? `Added ${added} shot${added === 1 ? "" : "s"}` : "Coverage already complete",
        detail: added
          ? `New shot cards added under ${touched.slice(0, 3).join(", ")}${touched.length > 3 ? "…" : ""}. Coverage % updates in the panel on the right.`
          : "Every scene already has wide, medium, and close-up angles.",
      }
    );
  }

  function matchVisualBible() {
    updateState((p) => applyCrossTabIntelligence(matchVisualBibleToShotPlan(p), "look"));
    showSuccess("Visual bible applied to all shots.");
  }

  function addSequence() {
    patchSequences((seqs) => [
      ...seqs,
      {
        ...newShotSequence(`Sequence ${seqs.length + 1}`),
        shots: [],
      },
    ]);
  }

  const hasSequences = state.shotPlan.sequences.length > 0;

  return (
    <div className="space-y-8 pb-4 lg:pb-0">
      {feedback ? (
        <ProStatusBanner
          variant={feedback.variant}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      {actionBanner ? (
        <ShotPlanActionBanner
          title={actionBanner.title}
          detail={actionBanner.detail}
          onDismiss={() => setActionBanner(null)}
        />
      ) : null}

      <ProLoadingBar active={aiLoading} label="Shot Planner agent building coverage…" />

      {shotThinkingLog.length > 0 ? (
        <ThinkingLogPanel entries={shotThinkingLog} running={aiLoading} defaultCollapsed />
      ) : null}

      {issues.length > 0 ? (
        <div className="rounded-lg border border-pro-warning/25 bg-pro-warning/10 px-3 py-2">
          <p className="text-xs font-medium text-pro-warning">Look consistency</p>
          <ul className="mt-1 space-y-1 text-xs text-pro-text-secondary">
            {issues.slice(0, 3).map((i) => (
              <li key={`${i.sceneNumber}-${i.message}`}>
                Scene {i.sceneNumber}: {i.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-pro-text">
            {scriptToPrompt ? "Beats" : "Shot plan"}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-pro-text-secondary">
            {scriptToPrompt
              ? hasSequences
                ? `${state.shotPlan.sequences.length} visual beat${state.shotPlan.sequences.length === 1 ? "" : "s"} — open Finish → Prompts to copy generation lines.`
                : "Visual beats from prep — copy-ready prompts live under Finish → Prompts."
              : hasSequences
                ? `${state.shotPlan.sequences.length} sequence${state.shotPlan.sequences.length === 1 ? "" : "s"} from your prep. Coverage cards below — drag to reorder on desktop, or use ↑↓ on mobile.`
                : "Build coverage from scenes you kept in Prep — wide, medium, close-up per scene."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <KeyboardShortcutTooltip shortcutId="generate_shot_plan">
            <Button
              type="button"
              className={proBtn.primary}
              disabled={aiLoading || !canGenerate}
              onClick={() => {
                if (agentsEnabled && hasApproved) {
                  void generateFromApproved();
                } else {
                  generateLocalFromApproved();
                }
              }}
            >
              {aiLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : (
                <Wand2 className="mr-2 size-4" aria-hidden />
              )}
              {aiLoading ? "Building…" : hasSequences ? "Rebuild from prep" : "Build from prep"}
            </Button>
          </KeyboardShortcutTooltip>
        </div>
      </header>

      {palette.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {palette.slice(0, 6).map((sw, i) => (
            <PaletteSwatch key={`palette-${i}-${sw}`} label={sw} />
          ))}
        </div>
      ) : null}

      {!hasApproved && sceneCount > 0 ? (
        <p className="text-sm text-pro-text-secondary">
          Tip: Add scenes to your project in Prep for the best coverage.
        </p>
      ) : null}

      <ShotPlanSummary state={state} onGoToTab={onGoToTab} promptPack={scriptToPrompt} />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-6">
      {state.shotPlan.sequences.length === 0 ? (
        <ProEmptyState
          icon={<Clapperboard className="size-10" aria-hidden />}
          title={scriptToPrompt ? "No beats yet" : "No shots yet"}
          description={
            scriptToPrompt
              ? "Build visual beats from scenes you approved in Script → Run prep. Then copy prompts from Finish → Prompts."
              : "Generate from approved scenes in Prep, or build instantly from INT./EXT. headings in your script. Visual bible notes shape each shot."
          }
          action={
            state.directorPrep.screenplay.rawText.trim() || sceneCount > 0 ? (
              <Button
                type="button"
                size="sm"
                className={proBtn.primary}
                onClick={() => {
                  updateState((p) => {
                    const { state: next, didParseScenes, didGenerateShots } =
                      ensureShotPlanFromScript(p);
                    if (didParseScenes || didGenerateShots) {
                      showSuccess(
                        didParseScenes && didGenerateShots
                          ? "Parsed scenes and built shot coverage from your script."
                          : didParseScenes
                            ? "Parsed scenes from script — review in Prep."
                            : "Built shot plan from prep scenes."
                      );
                    } else {
                      setFeedback({
                        variant: "error",
                        message: PRO_SCENE_HEADING_REQUIRED,
                      });
                    }
                    return applyCrossTabIntelligence(next, "full");
                  });
                }}
              >
                Build from script
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="space-y-4">
          {state.shotPlan.sequences.map((seq, seqIndex) => {
            const isCollapsed = collapsed[seq.id] ?? false;
            const linkedScenes = state.directorPrep.scenes.filter((s) => s.linkedSequenceId === seq.id);
            const scene =
              linkedScenes[0] ??
              (seq.sceneNumber != null
                ? state.directorPrep.scenes.find((s) => s.number === seq.sceneNumber)
                : undefined);
            const sceneLabel = scene
              ? `Scene ${scene.number}${scene.heading ? `: ${scene.heading}` : ""}`
              : null;
            const accent = palette[0]?.match(/#([0-9a-f]{3,8})/i)?.[0] ?? "#C8102E";

            return (
              <li
                key={seq.id}
                className="rounded-2xl bg-pro-elevated/80 shadow-md ring-1 ring-white/[0.06]"
                style={{ borderLeftWidth: 4, borderLeftColor: accent }}
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-white/5 px-3 py-2.5">
                  <button
                    type="button"
                    className="text-[#a3a3a3] hover:text-white"
                    onClick={() => setCollapsed((c) => ({ ...c, [seq.id]: !isCollapsed }))}
                    aria-expanded={!isCollapsed}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="size-4" aria-hidden />
                    ) : (
                      <ChevronDown className="size-4" aria-hidden />
                    )}
                  </button>
                  <input
                    className={`min-w-[180px] flex-1 ${fieldClass}`}
                    value={seq.title}
                    onChange={(e) =>
                      patchSequences((seqs) => {
                        const next = [...seqs];
                        next[seqIndex] = { ...next[seqIndex], title: e.target.value };
                        return next;
                      })
                    }
                  />
                  {sceneLabel ? (
                    <span className="text-xs text-emerald-400/90">{sceneLabel}</span>
                  ) : null}
                  <span className="text-xs text-[#525252]">{seq.shots.length} shots</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={`ml-auto ${proBtn.outline}`}
                    onClick={() =>
                      patchSequences((seqs) => {
                        const next = [...seqs];
                        const visualNote = visualBibleContextLine(state);
                        next[seqIndex] = {
                          ...next[seqIndex],
                          shots: [
                            ...next[seqIndex].shots,
                            {
                              ...newPlannedShot("medium", "New shot"),
                              visualBibleNote: visualNote,
                              cameraNotes: state.visualBible.lensAndFraming,
                              lightingNotes: state.visualBible.grainAndTexture,
                              visualRefUrl: referenceOptions[0] ?? "",
                              sceneId: scene?.id ?? null,
                            },
                          ],
                        };
                        return next;
                      })
                    }
                  >
                    + Shot
                  </Button>
                </div>

                {!isCollapsed ? (
                  <div className="p-3">
                    <ShotSequenceContext
                      scene={scene}
                      notes={seq.notes}
                      shotCount={seq.shots.length}
                      scriptToPrompt={scriptToPrompt}
                      onNotesChange={(notes) =>
                        patchSequences((seqs) => {
                          const next = [...seqs];
                          next[seqIndex] = { ...next[seqIndex], notes };
                          return next;
                        })
                      }
                    />
                    <div
                      className={
                        scriptToPrompt
                          ? "flex gap-3 overflow-x-auto pb-2"
                          : "grid gap-4"
                      }
                    >
                      {seq.shots.map((shot, shotIndex) => (
                        <ShotCard
                          key={shot.id}
                          shot={shot}
                          seqIndex={seqIndex}
                          shotIndex={shotIndex}
                          sceneLabel={sceneLabel}
                          referenceOptions={referenceOptions}
                          palette={palette}
                          layout={scriptToPrompt ? "filmstrip" : "sheet"}
                          notesDefaultOpen={!scriptToPrompt}
                          draggable={canDragReorder}
                          isDragging={
                            dragShot?.seqIndex === seqIndex && dragShot?.shotIndex === shotIndex
                          }
                          isDropTarget={
                            dropTarget?.seqIndex === seqIndex &&
                            dropTarget?.shotIndex === shotIndex &&
                            !(
                              dragShot?.seqIndex === seqIndex && dragShot?.shotIndex === shotIndex
                            )
                          }
                          onDragStart={() => setDragShot({ seqIndex, shotIndex })}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDropTarget({ seqIndex, shotIndex });
                          }}
                          onDrop={() => {
                            if (!dragShot) return;
                            patchSequences((seqs) =>
                              moveShotBetweenSequences(seqs, dragShot, { seqIndex, shotIndex })
                            );
                            setDragShot(null);
                            setDropTarget(null);
                          }}
                          canMoveUp={shotIndex > 0}
                          canMoveDown={shotIndex < seq.shots.length - 1}
                          onMoveUp={() =>
                            patchSequences((seqs) => {
                              const next = [...seqs];
                              const cur = next[seqIndex];
                              if (!cur || shotIndex <= 0) return seqs;
                              next[seqIndex] = {
                                ...cur,
                                shots: moveShotInSequence(cur.shots, shotIndex, shotIndex - 1),
                              };
                              return next;
                            })
                          }
                          onMoveDown={() =>
                            patchSequences((seqs) => {
                              const next = [...seqs];
                              const cur = next[seqIndex];
                              if (!cur || shotIndex >= cur.shots.length - 1) return seqs;
                              next[seqIndex] = {
                                ...cur,
                                shots: moveShotInSequence(cur.shots, shotIndex, shotIndex + 1),
                              };
                              return next;
                            })
                          }
                          onChange={(nextShot) => updateShot(seqIndex, shotIndex, nextShot)}
                          onStatusChange={(nextShot, prev) =>
                            updateShot(seqIndex, shotIndex, nextShot, prev)
                          }
                          onRemove={() =>
                            patchSequences((seqs) => {
                              const next = [...seqs];
                              next[seqIndex] = {
                                ...next[seqIndex],
                                shots: next[seqIndex].shots.filter((_, i) => i !== shotIndex),
                              };
                              return next;
                            })
                          }
                        />
                      ))}
                      <button
                        type="button"
                        className={
                          scriptToPrompt
                            ? "flex min-w-[120px] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-[#444] text-xs text-[#525252] hover:border-[#666] hover:text-[#a3a3a3]"
                            : "flex min-h-[8rem] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#444] text-xs text-[#525252] hover:border-[#666] hover:text-[#a3a3a3]"
                        }
                        onClick={() =>
                          patchSequences((seqs) => {
                            const next = [...seqs];
                            const visualNote = visualBibleContextLine(state);
                            next[seqIndex] = {
                              ...next[seqIndex],
                              shots: [
                                ...next[seqIndex].shots,
                                {
                                  ...newPlannedShot("medium", "New shot"),
                                  visualBibleNote: visualNote,
                                  sceneId: scene?.id ?? null,
                                  visualRefUrl: referenceOptions[0] ?? "",
                                },
                              ],
                            };
                            return next;
                          })
                        }
                      >
                        <Plus className="mb-1 size-5" aria-hidden />
                        Add shot
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
        </div>

        {hasSequences && !scriptToPrompt ? (
          <CoverageGapsPanel
            state={state}
            onSuggestCoverage={suggestCoverage}
            suggestDisabled={aiLoading}
          />
        ) : null}
      </div>

      <ProductionQuickActionsBar
        hideCoverageActions={scriptToPrompt}
        onSuggestCoverage={suggestCoverage}
        onMatchVisualBible={matchVisualBible}
        onAddSequence={addSequence}
        onGoToExport={onGoToTab ? () => onGoToTab("export") : undefined}
        onGenerate={() => void generateFromApproved()}
        generating={aiLoading}
        canGenerate={canGenerate}
        disabled={!hasSequences && !canGenerate}
      />
      <ProProductionQuickActionsMobile
        hideCoverageActions={scriptToPrompt}
        onSuggestCoverage={suggestCoverage}
        onMatchVisualBible={matchVisualBible}
        onAddSequence={addSequence}
        onGoToExport={onGoToTab ? () => onGoToTab("export") : undefined}
        onGenerate={() => void generateFromApproved()}
        generating={aiLoading}
        canGenerate={canGenerate}
        disabled={!hasSequences && !canGenerate}
      />
    </div>
  );
}

function PaletteSwatch({ label }: { label: string }) {
  const hex = label.match(/#([0-9a-f]{3,8})/i)?.[0];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-pro-elevated px-2 py-0.5 text-[10px] text-pro-text-secondary ring-1 ring-white/[0.06]">
      {hex ? (
        <span className="size-3 rounded-full border border-[#555]" style={{ backgroundColor: hex }} aria-hidden />
      ) : null}
      {label.slice(0, 24)}
    </span>
  );
}
