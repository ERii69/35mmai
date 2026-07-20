"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import {
  ChevronRight,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyScriptToPrep } from "@/lib/pro/apply-script-to-prep";
import { commitAgentStaging } from "@/lib/pro/commit-agent-staging";
import {
  importScriptToPrepJson,
  previewScriptToPrepImport,
} from "@/lib/pro/import-script-to-prep";
import { mergeAgentPartial } from "@/lib/pro/merge-agent-partial";
import type { AgentPartialPatch } from "@/lib/pro/agents/stream-types";
import { planRefineAgents } from "@/lib/pro/plan-refine-agents";
import {
  PREP_PIPELINE_ORDER,
  agentLabel,
  type PrepPipelineAgentId,
} from "@/lib/pro/agent-roster";
import {
  AgentProgressPanel,
  createInitialAgentSlots,
} from "@/components/pro/AgentProgressPanel";
import { PrepAgentSelector } from "@/components/pro/PrepAgentSelector";
import { PrepKeyboardHints } from "@/components/pro/PrepKeyboardHints";
import { ProExportDownloadButton } from "@/components/pro/ProExportDownloadButton";
import { prepStepToWizardStep, wizardStepToPrepStep, type PrepStepId } from "@/lib/pro/workspace-modes";
import { isScriptToPromptTemplate, SCRIPT_TO_PROMPT_DEFAULT_AGENTS } from "@/lib/pro/script-to-prompt-template";
import { VisionFieldsEditor } from "@/components/pro/VisionFieldsEditor";
import { KeyboardShortcutTooltip } from "@/components/pro/ux/KeyboardShortcutTooltip";
import { ProSelect } from "@/components/pro/ux/ProSelect";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import { proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";
import {
  buildFilmmakerAgentInsight,
  humanizeThinkingMessage,
  type FilmmakerAgentInsight,
} from "@/lib/pro/agent-thinking-summaries";
import {
  buildLocalPrepImport,
  buildLocalPrepStaging,
  filterLocalStagingByAgents,
} from "@/lib/pro/local-prep-from-screenplay";
import { buildScriptToPromptPackState } from "@/lib/pro/build-script-to-prompt-pack";
import { applyInstantDemoPrep } from "@/lib/pro/instant-demo-prep";
import {
  refreshScriptToPromptStagingShots,
} from "@/lib/pro/build-script-to-prompt-shots";
import { countPromptsInStaging, synthesizeVisualBeatsFromScenes } from "@/lib/pro/synthesize-visual-beats";
import { countPromptsInBundle, openPromptsCta } from "@/lib/pro/script-to-prompt-copy";
import { approveAllStagingItems, cascadeRejectLocation } from "@/lib/pro/staging-review-sync";
import { defaultPromptToolRank, syncShotPromptsInState } from "@/lib/pro/sync-shot-prompts";
import { stagingHasReviewContent, stagingReviewStats } from "@/lib/pro/staging-review-stats";
import {
  countPrepScenesFromScreenplay,
  sampleUnrecognizedSluglineCandidates,
} from "@/lib/pro/parse-scene-headings";
import { RefinePreviewCard } from "@/components/pro/ux/RefinePreviewCard";
import { ScriptToPromptStartHero } from "@/components/pro/ScriptToPromptStartHero";
import { ProEmptyState } from "@/components/pro/ux/ProEmptyState";
import { ProStatusBanner } from "@/components/pro/ux/ProStatusBanner";
import { ProLoadingBar } from "@/components/pro/ux/ProLoadingBar";
import { appendMemoryDecision } from "@/lib/pro/append-memory-decision";
import { recordStagingDecisions } from "@/lib/pro/record-agent-memory";
import { applyCrossTabIntelligence } from "@/lib/pro/cross-tab-sync";
import { ProPrepRunMobileBar } from "@/components/pro/ProPrepRunMobileBar";
import { PrepReviewPanel } from "@/components/pro/PrepReviewPanel";
import { ProConfirmDialog } from "@/components/pro/ux/ProConfirmDialog";
import { estimateLocalPrepRun, estimatePrepRun } from "@/lib/pro/prep-cost-estimate";
import { buildRefinePreview } from "@/lib/pro/refine-preview";
import { ProjectMemoryPanel } from "@/components/pro/ProjectMemoryPanel";
import { PRO_SCRIPT_PASTE_PRIVACY_CALLOUT } from "@/lib/pro/membership-policy";
import { buildScriptToPrepAgentPrompt } from "@/lib/pro/script-to-prep-prompt";
import {
  buildTemplateState,
  isDirectorPrepTemplateId,
  mergeDirectorPrepTemplate,
  type ProTemplateId,
} from "@/lib/pro/templates";
import type {
  AgentProgressStep,
  AgentStagingBundle,
  DirectorBudgetTier,
  ProjectStatePayload,
} from "@/lib/pro/types";
import { SCREENPLAY_RAW_TEXT_MAX_CHARS } from "@/lib/pro/types";

const FIELD_CLASS = `${proSurface.field} ${proSurface.fieldMono}`;

const PREP_STREAM_TIMEOUT_MS = 120_000;

type WizardStep = 1 | 2 | 3;

type Props = {
  projectId: string;
  projectName: string;
  state: ProjectStatePayload;
  claudeAgentsEnabled: boolean;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  onOpenProduction?: () => void;
  onOpenPrompts?: () => void;
  onGoToExport?: () => void;
  onSkipNextAutosave?: () => void;
  prepStep: PrepStepId;
  onPrepStepChange: (step: PrepStepId) => void;
  onReviewPhaseChange?: (inReview: boolean) => void;
  onGoToLook?: () => void;
  hideDesktopSidebar?: boolean;
  /** Template selected in picker (may differ from applied until Apply or prep run). */
  prepTemplateId?: string | null;
  onOpenWorkflow?: () => void;
};

export function DirectorPrepWizard({
  projectId,
  projectName,
  state,
  prepTemplateId,
  claudeAgentsEnabled,
  updateState,
  onOpenProduction,
  onOpenPrompts,
  onGoToExport,
  onSkipNextAutosave,
  prepStep,
  onPrepStepChange,
  onReviewPhaseChange,
  onGoToLook,
  hideDesktopSidebar = false,
  onOpenWorkflow,
}: Props) {
  const activeStep = prepStepToWizardStep(prepStep);
  const setActiveStep = (step: WizardStep) => {
    onPrepStepChange(wizardStepToPrepStep(step));
  };

  const dp = state.directorPrep;
  const effectivePrepTemplateId = dp.appliedTemplateId ?? prepTemplateId ?? null;
  const scriptToPromptActive = isScriptToPromptTemplate(effectivePrepTemplateId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scriptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const abortReasonRef = useRef<"timeout" | "user" | null>(null);
  const runPrepSectionRef = useRef<HTMLDivElement>(null);
  const reviewSectionRef = useRef<HTMLDivElement>(null);
  const localRunCounterRef = useRef(0);
  const stagingPatchGenRef = useRef(0);
  const stagingClearedRef = useRef(false);
  const scriptToPromptDefaultsAppliedRef = useRef<string | null>(null);
  const scriptToPromptAutoApprovedRunRef = useRef<string | null>(null);
  const runPrepRef = useRef<(opts?: { refine?: boolean; agents?: PrepPipelineAgentId[] }) => Promise<void>>(
    async () => {}
  );
  const [agentsEnabled, setAgentsEnabled] = useState(claudeAgentsEnabled);
  const [running, setRunning] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast: pushToast } = useProToast();
  const [staging, setStaging] = useState<AgentStagingBundle | null>(dp.agentStaging);
  const [manualPaste, setManualPaste] = useState("");
  const [showManualSteps, setShowManualSteps] = useState(false);
  const [agentSlots, setAgentSlots] = useState(createInitialAgentSlots);
  const [agentInsights, setAgentInsights] = useState<
    Partial<Record<PrepPipelineAgentId, FilmmakerAgentInsight>>
  >({});
  const [refineHint, setRefineHint] = useState("");
  const [refinePreviewOpen, setRefinePreviewOpen] = useState(false);
  const [activePipeline, setActivePipeline] = useState<PrepPipelineAgentId[] | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<PrepPipelineAgentId[]>([
    ...PREP_PIPELINE_ORDER,
  ]);
  /** After prep completes, review panel shows on Generate (same tab). */
  const [prepFocusPhase, setPrepFocusPhase] = useState<"wizard" | "review">("wizard");
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [editingCommitted, setEditingCommitted] = useState(false);
  const [skipReviewConfirmOpen, setSkipReviewConfirmOpen] = useState(false);
  const [quickAddBusy, setQuickAddBusy] = useState(false);

  const hasScript = dp.screenplay.rawText.trim().length > 0;
  const sceneCount = dp.scenes.length;
  const approvedCount = dp.scenes.filter((s) => s.status === "approved").length;
  const charCount = dp.screenplay.rawText.length;
  const detectedHeadingCount = useMemo(
    () =>
      hasScript
        ? countPrepScenesFromScreenplay(dp.screenplay.rawText, dp.prepRunSettings)
        : 0,
    [hasScript, dp.screenplay.rawText, dp.prepRunSettings.analysisExcerpt]
  );
  const headingFormatHints = useMemo(
    () =>
      hasScript && detectedHeadingCount === 0
        ? sampleUnrecognizedSluglineCandidates(dp.screenplay.rawText)
        : [],
    [hasScript, detectedHeadingCount, dp.screenplay.rawText]
  );
  const localPrepBlocked = hasScript && !agentsEnabled && detectedHeadingCount === 0;

  /** Align applied template with picker before prep (keeps script + staging). */
  function syncPrepTemplateFromPicker(): void {
    const target = prepTemplateId ?? dp.appliedTemplateId;
    if (!target || target === dp.appliedTemplateId || !isDirectorPrepTemplateId(target)) return;
    const fresh = buildTemplateState(target as ProTemplateId);
    updateState((p) => mergeDirectorPrepTemplate(p, fresh));
  }

  function finishPrepRunOnGenerate() {
    setPrepFocusPhase("review");
    onPrepStepChange("generate");
    setReviewConfirmed(scriptToPromptActive);
    setEditingCommitted(false);
    requestAnimationFrame(() => {
      reviewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const prepRunPhase = useMemo(() => {
    if (running) return "running" as const;
    const pipeline = activePipeline ?? selectedAgents;
    const finishedCount = pipeline.filter(
      (id) => agentSlots[id].status === "done" || agentSlots[id].status === "skipped"
    ).length;
    const hasStagingResults =
      stagingHasReviewContent(staging) &&
      (staging?.status === "review" || staging?.status === "committed");
    if (hasStagingResults) {
      if (pipeline.length > 0 && finishedCount === pipeline.length) {
        return "complete" as const;
      }
      if (!activePipeline || finishedCount === pipeline.length) {
        return "complete" as const;
      }
    }
    if (localPrepBlocked) return "blocked" as const;
    return "idle" as const;
  }, [running, agentSlots, localPrepBlocked, activePipeline, selectedAgents, staging?.status, staging?.runId]);
  const overCharLimit = charCount > SCREENPLAY_RAW_TEXT_MAX_CHARS;

  const showReviewPanel = Boolean(
    stagingHasReviewContent(staging) && !running && prepRunPhase === "complete"
  );
  const showPrepSelector =
    hasScript && !running && !showReviewPanel && prepRunPhase !== "blocked";
  const showPrepProgress = running || prepRunPhase === "blocked";

  function restartPrepRun() {
    stagingPatchGenRef.current += 1;
    stagingClearedRef.current = true;
    scriptToPromptAutoApprovedRunRef.current = null;
    resetPrepResultsState();
    updateState((p) => ({
      ...p,
      directorPrep: { ...p.directorPrep, agentStaging: null },
    }));
    showToast("Ready to run prep again.");
    requestAnimationFrame(() => {
      runPrepSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function promptPackVisualHints(bundle: AgentStagingBundle) {
    return {
      mood: bundle.visual?.mood ?? dp.agentMeta.visualMood,
      palette: bundle.visual?.palette,
      lens: bundle.visual?.lensAndFraming,
      lighting: bundle.visual?.lightingApproach,
    };
  }

  function finalizeStagingBundle(
    bundle: AgentStagingBundle,
    pipeline: PrepPipelineAgentId[]
  ): AgentStagingBundle {
    let next = filterLocalStagingByAgents(bundle, pipeline, { promptPack: scriptToPromptActive });
    if (scriptToPromptActive) {
      if (next.shotSequences.length === 0 && next.scenes.length > 0) {
        next = {
          ...next,
          shotSequences: synthesizeVisualBeatsFromScenes(
            next.scenes.map((s) => s.scene),
            dp.directorRules,
            promptPackVisualHints(next),
            next.runId
          ),
        };
      }
      next = refreshScriptToPromptStagingShots(next, dp.directorRules, promptPackVisualHints(next));
      next = approveAllStagingItems(next);
    }
    return next;
  }

  useEffect(() => {
    if (!scriptToPromptActive) {
      scriptToPromptDefaultsAppliedRef.current = null;
      return;
    }
    const templateKey = effectivePrepTemplateId ?? "";
    if (scriptToPromptDefaultsAppliedRef.current === templateKey) return;
    scriptToPromptDefaultsAppliedRef.current = templateKey;
    setSelectedAgents([...SCRIPT_TO_PROMPT_DEFAULT_AGENTS]);
  }, [scriptToPromptActive, effectivePrepTemplateId]);

  useEffect(() => {
    scriptToPromptAutoApprovedRunRef.current = null;
  }, [effectivePrepTemplateId]);

  useEffect(() => {
    onReviewPhaseChange?.(showReviewPanel);
  }, [showReviewPanel, onReviewPhaseChange]);

  /** Upgrade saved prep runs that still have old coverage labels instead of generation prompts. */
  useEffect(() => {
    if (!scriptToPromptActive || !staging || staging.status !== "review") return;
    const refreshed = refreshScriptToPromptStagingShots(
      staging,
      dp.directorRules,
      promptPackVisualHints(staging)
    );
    if (refreshed === staging) return;
    onSkipNextAutosave?.();
    setStaging(refreshed);
    updateState((p) => ({
      ...p,
      directorPrep: { ...p.directorPrep, agentStaging: refreshed },
    }));
  }, [scriptToPromptActive, staging?.runId, dp.directorRules, dp.agentMeta.visualMood, onSkipNextAutosave, updateState]);

  /** Script to prompt: auto-keep staging items (including stale runs saved before fast path). */
  useEffect(() => {
    if (!scriptToPromptActive || !staging || staging.status !== "review" || editingCommitted) return;
    if (scriptToPromptAutoApprovedRunRef.current === staging.runId) return;

    const stats = stagingReviewStats(staging);
    if (!stats) return;

    scriptToPromptAutoApprovedRunRef.current = staging.runId;

    if (stats.pendingTotal === 0) {
      setReviewConfirmed(true);
      return;
    }

    const approved = approveAllStagingItems(staging);
    onSkipNextAutosave?.();
    setStaging(approved);
    updateState((p) => ({
      ...p,
      directorPrep: { ...p.directorPrep, agentStaging: approved },
    }));
    setReviewConfirmed(true);
  }, [scriptToPromptActive, staging, editingCommitted, onSkipNextAutosave, updateState]);

  const manualPreview = useMemo(
    () => (manualPaste.trim() ? previewScriptToPrepImport(manualPaste) : null),
    [manualPaste]
  );

  const runEstimate = useMemo(
    () =>
      agentsEnabled
        ? estimatePrepRun(charCount, selectedAgents.length, dp.prepRunSettings.longScriptMode)
        : estimateLocalPrepRun(selectedAgents.length),
    [agentsEnabled, charCount, selectedAgents.length, dp.prepRunSettings.longScriptMode]
  );

  const refinePreview = useMemo(() => buildRefinePreview(refineHint), [refineHint]);
  const refineEstimate = useMemo(
    () =>
      estimatePrepRun(
        charCount,
        refinePreview?.agents.length ?? PREP_PIPELINE_ORDER.length,
        dp.prepRunSettings.longScriptMode
      ),
    [charCount, refinePreview, dp.prepRunSettings.longScriptMode]
  );

  useEffect(() => {
    setAgentsEnabled(claudeAgentsEnabled);
  }, [claudeAgentsEnabled]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/pro/agent/status")
      .then((r) => r.json())
      .then((j: { configured?: boolean }) => {
        if (!cancelled && typeof j.configured === "boolean") setAgentsEnabled(j.configured);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);


  function patchDirectorPrep(
    fn: (prev: ProjectStatePayload["directorPrep"]) => ProjectStatePayload["directorPrep"]
  ) {
    updateState((p) => ({ ...p, directorPrep: fn(p.directorPrep) }));
  }

  function showToast(msg: string) {
    pushToast({ message: msg, variant: "success" });
  }

  function failPrepRun(message: string) {
    setError(message);
    setProgressMessage(null);
    setRunning(false);
    setAgentSlots((prev) => {
      const next = { ...prev };
      for (const id of PREP_PIPELINE_ORDER) {
        if (next[id].status === "running") {
          next[id] = { status: "error", detail: message, thinking: null };
        }
      }
      return next;
    });
  }

  function resetAgentSlots(pipeline: PrepPipelineAgentId[]) {
    const next = createInitialAgentSlots();
    for (const id of PREP_PIPELINE_ORDER) {
      if (!pipeline.includes(id)) next[id] = { status: "skipped", detail: null, thinking: null };
    }
    setAgentSlots(next);
    setActivePipeline(pipeline);
  }

  function markAgentRunning(id: PrepPipelineAgentId) {
    setAgentSlots((prev) => {
      const next = { ...prev };
      for (const key of PREP_PIPELINE_ORDER) {
        if (key === id) next[key] = { ...next[key], status: "running", detail: null };
        else if (next[key].status === "running") {
          next[key] = { ...next[key], status: "waiting" };
        }
      }
      return next;
    });
  }

  function markAgentDone(id: PrepPipelineAgentId, detail: string) {
    setAgentSlots((prev) => ({
      ...prev,
      [id]: { status: "done", detail, thinking: prev[id].thinking },
    }));
  }

  async function runNativePrep(options?: {
    refine?: boolean;
    agents?: PrepPipelineAgentId[];
  }) {
    const pipeline =
      options?.agents ??
      (options?.refine && refineHint.trim()
        ? (planRefineAgents(refineHint) ?? selectedAgents)
        : selectedAgents);

    if (pipeline.length === 0) {
      setError("Select at least one agent to run.");
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    abortReasonRef.current = null;
    const timeoutId = window.setTimeout(() => {
      abortReasonRef.current = "timeout";
      ac.abort();
    }, PREP_STREAM_TIMEOUT_MS);

    setRunning(true);
    setError(null);
    setProgressMessage(null);
    setPrepFocusPhase("wizard");
    setAgentInsights({});
    setShowManualSteps(false);
    resetAgentSlots(pipeline);
    let runId = staging?.runId ?? "";

    try {
      if (!runId) runId = `run-${new Date().getTime()}`;
      const res = await fetch(`/api/pro/agent/${projectId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ac.signal,
        body: JSON.stringify({
          refine: Boolean(options?.refine && refineHint.trim()),
          refineHint: options?.refine ? refineHint.trim() : undefined,
          agents: pipeline,
          screenplay: {
            rawText: dp.screenplay.rawText,
            title: dp.screenplay.title,
          },
        }),
      });

      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Prep failed (${res.status})`);
      }
      if (!res.body) throw new Error("No response stream.");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buffer = "";
      let completedStaging: AgentStagingBundle | null = null;
      const stagingAccumulator: { value: AgentStagingBundle | null } = {
        value: staging
          ? mergeAgentPartial(
              null,
              {
                executiveSummary: staging.executiveSummary,
                researchNotes: staging.researchNotes,
                scenes: staging.scenes,
                shotSequences: staging.shotSequences,
                locations: staging.locations,
                characters: staging.characters,
                budget: staging.budget,
                visual: staging.visual,
              },
              runId
            )
          : null,
      };
      let streamCompleted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += dec.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as {
            type: string;
            step?: AgentProgressStep | PrepPipelineAgentId;
            message?: string;
            patch?: AgentPartialPatch;
            staging?: AgentStagingBundle;
            memoryPatch?: Partial<ProjectStatePayload["directorPrep"]["agentMemory"]>;
          };

          if (event.type === "thinking" && event.step && event.message) {
            const step = event.step as PrepPipelineAgentId;
            const hint = humanizeThinkingMessage(step, event.message);
            markAgentRunning(step);
            setAgentSlots((prev) => ({
              ...prev,
              [step]: { status: "running", detail: hint, thinking: hint },
            }));
          }

          if (event.type === "progress" && event.step) {
            const msg = event.message?.trim();
            setProgressMessage(msg ?? null);
            if (event.step !== "complete" && event.step !== "error") {
              markAgentRunning(event.step as PrepPipelineAgentId);
            }
          }

          if (event.type === "partial" && event.step && event.patch) {
            const step = event.step as PrepPipelineAgentId;
            stagingAccumulator.value = mergeAgentPartial(
              stagingAccumulator.value,
              event.patch,
              runId
            );
            setStaging(stagingAccumulator.value);
            const insight = buildFilmmakerAgentInsight(
              step,
              event.patch,
              dp.directorRules,
              stagingAccumulator.value
            );
            setAgentInsights((prev) => ({ ...prev, [step]: insight }));
            markAgentDone(step, insight.summary);
            setAgentSlots((prev) => ({
              ...prev,
              [step]: {
                status: "done",
                detail: insight.summary,
                thinking: insight.rationale,
              },
            }));
            updateState((p) => ({
              ...p,
              directorPrep: { ...p.directorPrep, agentStaging: stagingAccumulator.value },
            }));
          }

          if (event.type === "complete" && event.staging) {
            streamCompleted = true;
            const finalStaging = finalizeStagingBundle(event.staging, pipeline);
            completedStaging = finalStaging;
            setStaging(finalStaging);
            setAgentSlots((prev) => {
              const next = { ...prev };
              for (const id of pipeline) {
                next[id] = {
                  status: "done",
                  detail: next[id].detail ?? "Done",
                  thinking: next[id].thinking,
                };
              }
              return next;
            });
            updateState((p) => {
              const memoryBase = scriptToPromptActive
                ? recordStagingDecisions(
                    p.directorPrep.agentMemory,
                    finalStaging,
                    p.directorPrep.directorRules
                  )
                : p.directorPrep.agentMemory;
              return {
                ...p,
                directorPrep: {
                  ...p.directorPrep,
                  agentStaging: finalStaging,
                  agentMemory: {
                    ...memoryBase,
                    ...(event.memoryPatch ?? {}),
                  },
                },
              };
            });
          }

          if (event.type === "error") {
            throw new Error(event.message ?? "Prep error");
          }
        }
      }

      if (
        !streamCompleted &&
        ((completedStaging ?? stagingAccumulator.value)?.scenes?.length ?? 0) === 0 &&
        detectedHeadingCount > 0
      ) {
        clearTimeout(timeoutId);
        abortRef.current = null;
        setRunning(false);
        await runLocalPrepWithProgress();
        return;
      }

      setProgressMessage(null);
      if (streamCompleted && ((completedStaging ?? stagingAccumulator.value)?.scenes.length ?? 0) > 0) {
        finishPrepRunOnGenerate();
      } else {
        onPrepStepChange("generate");
      }
      showToast(
        options?.refine
          ? "Refine complete — Keep or Remove results below."
          : "Prep complete — Keep or Remove each item below, then add to project."
      );
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        if (abortReasonRef.current === "timeout") {
          if (detectedHeadingCount > 0) {
            clearTimeout(timeoutId);
            abortRef.current = null;
            setRunning(false);
            await runLocalPrepWithProgress();
            return;
          }
          failPrepRun("Prep timed out. Try fewer agents or use local prep.");
        } else {
          failPrepRun("Prep run cancelled.");
        }
      } else {
        const msg = e instanceof Error ? e.message : "Prep failed.";
        if (/ANTHROPIC|503|not configured|Native agents/i.test(msg)) {
          setAgentsEnabled(false);
          setError(null);
          clearTimeout(timeoutId);
          abortRef.current = null;
          setRunning(false);
          await runLocalPrepWithProgress();
          return;
        }
        failPrepRun(msg);
      }
    } finally {
      clearTimeout(timeoutId);
      setRunning(false);
      abortRef.current = null;
    }
  }

  function cancelPrepRun() {
    abortReasonRef.current = "user";
    abortRef.current?.abort();
  }

  async function refreshAgentStatus(): Promise<boolean> {
    try {
      const res = await fetch("/api/pro/agent/status", { cache: "no-store" });
      const j = (await res.json()) as { configured?: boolean };
      if (typeof j.configured === "boolean") {
        setAgentsEnabled(j.configured);
        return j.configured;
      }
    } catch {
      /* keep current */
    }
    return agentsEnabled;
  }

  async function runLocalPrepWithProgress() {
    syncPrepTemplateFromPicker();
    const pipeline = scriptToPromptActive
      ? ([...SCRIPT_TO_PROMPT_DEFAULT_AGENTS] as PrepPipelineAgentId[])
      : selectedAgents.length > 0
        ? selectedAgents
        : ([...PREP_PIPELINE_ORDER] as PrepPipelineAgentId[]);

    setRunning(true);
    setError(null);
    setActiveStep(2);
    setPrepFocusPhase("wizard");
    setShowManualSteps(true);
    setProgressMessage("Reading your script and building prep sections…");
    resetAgentSlots(pipeline);
    setAgentInsights({});
    if (pipeline.includes("script_analyzer")) {
      setAgentSlots((prev) => ({
        ...prev,
        script_analyzer: { status: "running", detail: "Reading scene lines…", thinking: null },
      }));
    }

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    const built = buildLocalPrepImport({
      screenplay: dp.screenplay,
      rules: dp.directorRules,
      prepRunSettings: dp.prepRunSettings,
      projectName,
      promptPack: scriptToPromptActive,
    });

    if ("error" in built) {
      failPrepRun(built.error);
      return;
    }

    localRunCounterRef.current += 1;
    const runId = `local-${localRunCounterRef.current}`;
    const fullStaging = buildLocalPrepStaging(built, runId, dp.screenplay.rawText, {
      promptPack: scriptToPromptActive,
    });
    const nextStaging = finalizeStagingBundle(fullStaging, pipeline);
    if (!stagingHasReviewContent(nextStaging)) {
      failPrepRun(
        "No prep sections to review. Include Script & scenes or other checked sections."
      );
      return;
    }
    setStaging(nextStaging);
    updateState((p) => ({
      ...p,
      directorPrep: {
        ...p.directorPrep,
        agentStaging: nextStaging,
        agentMemory: scriptToPromptActive
          ? recordStagingDecisions(
              p.directorPrep.agentMemory,
              nextStaging,
              p.directorPrep.directorRules
            )
          : p.directorPrep.agentMemory,
      },
    }));

    const summaries: Record<PrepPipelineAgentId, string> = {
      script_analyzer: `Broke script into ${built.scenes.length} scene${built.scenes.length === 1 ? "" : "s"}.`,
      research:
        built.locations.length > 0 || fullStaging.characters.length > 0
          ? [
              fullStaging.characters.length
                ? `${fullStaging.characters.length} character${fullStaging.characters.length === 1 ? "" : "s"}`
                : null,
              built.locations.length
                ? `${built.locations.length} location${built.locations.length === 1 ? "" : "s"}`
                : null,
            ]
              .filter(Boolean)
              .join(", ") + " from script."
          : "No characters or locations parsed from headings.",
      shot_list: scriptToPromptActive
        ? `${countPromptsInStaging(built.shotSequences)} visual beats from ${built.scenes.length} scene${built.scenes.length === 1 ? "" : "s"}.`
        : `Drafted ${built.shotSequences.length} shot sequence${built.shotSequences.length === 1 ? "" : "s"}.`,
      budget: built.budgetSummaryText.slice(0, 120),
      visual_bible: built.visualMood.slice(0, 120) || "Set Look tab for full mood board.",
    };

    setAgentSlots((prev) => {
      const next = { ...prev };
      for (const id of PREP_PIPELINE_ORDER) {
        if (!pipeline.includes(id)) {
          next[id] = { status: "skipped", detail: "Not selected this run", thinking: null };
        } else {
          next[id] = { status: "done", detail: summaries[id], thinking: null };
        }
      }
      return next;
    });

    setProgressMessage(null);
    setRunning(false);
    setActivePipeline(pipeline);
    finishPrepRunOnGenerate();
    showToast(
      scriptToPromptActive
        ? openPromptsCta(countPromptsInBundle(nextStaging))
        : `Quick prep complete. Keep or Remove each item below, then Add to project.`
    );
  }

  async function runPrep(options?: { refine?: boolean; agents?: PrepPipelineAgentId[] }) {
    if (!hasScript) {
      setError("Paste your script in step 1 first.");
      setActiveStep(1);
      return;
    }

    setError(null);
    syncPrepTemplateFromPicker();
    stagingPatchGenRef.current += 1;
    stagingClearedRef.current = false;
    setActiveStep(2);
    runPrepSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const nativeReady = await refreshAgentStatus();

    if (nativeReady) {
      await runNativePrep({
        ...options,
        agents: options?.agents ?? selectedAgents,
      });
      return;
    }

    await runLocalPrepWithProgress();
  }

  function skipReviewToProduction() {
    setSkipReviewConfirmOpen(true);
  }

  function confirmSkipReviewToProduction() {
    setSkipReviewConfirmOpen(false);
    quickFinishToProduction();
  }

  function quickFinishToProduction() {
    const openFinish = () => {
      if (scriptToPromptActive) {
        onOpenPrompts?.() ?? onOpenProduction?.();
      } else {
        onOpenProduction?.();
      }
    };
    const finishLabel = scriptToPromptActive ? "Finish → Prompts" : "Finish";

    if (staging?.status === "review") {
      const toSave = approveAllStagingItems(staging);
      stagingClearedRef.current = true;
      updateState((p) => applyCrossTabIntelligence(commitAgentStaging(p, toSave), "full"));
      setStaging({ ...toSave, status: "committed" });
      setEditingCommitted(false);
      setReviewConfirmed(false);
      setPrepFocusPhase("review");
      showToast(`Added to project — opening ${finishLabel}.`);
      setActiveStep(3);
      openFinish();
      return;
    }
    if (sceneCount > 0) {
      acceptAllProjectScenes();
      saveStagingToProject();
      openFinish();
    }
  }

  async function rerunSection(agent: PrepPipelineAgentId) {
    if (!agentsEnabled) {
      showToast("Turn on AI prep to re-run individual sections.");
      return;
    }
    await runNativePrep({ agents: [agent] });
  }

  useEffect(() => {
    runPrepRef.current = runPrep;
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && running) {
        e.preventDefault();
        cancelPrepRun();
        return;
      }
      if (!(e.metaKey || e.ctrlKey) || e.key !== "Enter") return;
      if (!hasScript || running || activeStep !== 2 || showReviewPanel) return;
      if (!agentsEnabled && detectedHeadingCount === 0) return;
      e.preventDefault();
      void runPrepRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasScript, running, activeStep, showReviewPanel, agentsEnabled, detectedHeadingCount]);

  async function copyPrepPrompt() {
    const text = buildScriptToPrepAgentPrompt(
      dp.directorRules,
      dp.screenplay.rawText,
      dp.screenplay.title || projectName
    );
    try {
      await navigator.clipboard.writeText(text);
      showToast("Prompt copied — paste into Claude, then paste the reply below.");
    } catch {
      showToast("Could not copy to clipboard.");
    }
  }

  function applyManualResult() {
    const result = importScriptToPrepJson(manualPaste, dp.scenes.length);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    updateState((prev) =>
      applyScriptToPrep(prev, result.data, { mode: "replace", applyBudgetLines: true })
    );
    setManualPaste("");
    setShowManualSteps(false);
    showToast(`Added ${result.data.scenes.length} scenes to your project.`);
    setActiveStep(2);
  }

  useEffect(() => {
    if (stagingClearedRef.current) {
      if (!dp.agentStaging) {
        stagingClearedRef.current = false;
        setStaging(null);
      }
      return;
    }
    setStaging((prev) => {
      if (!dp.agentStaging) return null;
      if (prev?.runId !== dp.agentStaging.runId) return dp.agentStaging;
      const prevPending = stagingReviewStats(prev)?.pendingTotal ?? Infinity;
      const dpPending = stagingReviewStats(dp.agentStaging)?.pendingTotal ?? Infinity;
      if (dpPending < prevPending) return dp.agentStaging;
      if (prevPending < dpPending) return prev;
      return prev ?? dp.agentStaging;
    });
    if (!dp.agentStaging?.scenes.length && !stagingHasReviewContent(dp.agentStaging)) {
      setPrepFocusPhase("wizard");
    } else if (
      dp.agentStaging &&
      (dp.agentStaging.status === "review" || dp.agentStaging.status === "committed")
    ) {
      setPrepFocusPhase("review");
    }
  }, [dp.agentStaging]);

  function patchStaging(
    updater: (prev: AgentStagingBundle) => AgentStagingBundle,
    sideEffect?: (
      next: AgentStagingBundle,
      project: ProjectStatePayload
    ) => Partial<ProjectStatePayload["directorPrep"]>
  ) {
    setStaging((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      updateState((p) => {
        const extra = sideEffect?.(next, p) ?? {};
        return {
          ...p,
          directorPrep: {
            ...p.directorPrep,
            agentStaging: next,
            ...extra,
          },
        };
      });
      return next;
    });
  }

  function patchLocationSuggestion(
    suggestionId: string,
    patch: Partial<import("@/lib/pro/types").StagedLocationSuggestion>
  ) {
    patchStaging((current) => ({
      ...current,
      locations: current.locations.map((l) =>
        l.suggestionId === suggestionId ? { ...l, ...patch } : l
      ),
    }));
  }

  function setShootSuggestionStatus(
    locationId: string,
    shootId: string,
    status: "approved" | "rejected" | "pending"
  ) {
    patchStaging((current) => ({
      ...current,
      locations: current.locations.map((l) => {
        if (l.suggestionId !== locationId) return l;
        return {
          ...l,
          shootSuggestions: (l.shootSuggestions ?? []).map((s) =>
            s.id === shootId ? { ...s, status } : s
          ),
        };
      }),
    }));
  }

  function setStagingItemStatus(
    kind: "location" | "character" | "shot" | "budget" | "visual",
    suggestionId: string | null,
    status: "approved" | "rejected" | "pending"
  ) {
    patchStaging((current) => {
      if (kind === "location") {
        const loc = current.locations.find((l) => l.suggestionId === suggestionId);
        if (loc) return cascadeRejectLocation(current, loc, status);
        return current;
      }
      if (kind === "character") {
        return {
          ...current,
          characters: (current.characters ?? []).map((c) =>
            c.suggestionId === suggestionId ? { ...c, status } : c
          ),
        };
      }
      if (kind === "shot") {
        return {
          ...current,
          shotSequences: current.shotSequences.map((s) =>
            s.suggestionId === suggestionId ? { ...s, status } : s
          ),
        };
      }
      if (kind === "budget" && current.budget) {
        return { ...current, budget: { ...current.budget, status } };
      }
      if (kind === "visual" && current.visual) {
        return { ...current, visual: { ...current.visual, status } };
      }
      return current;
    });
  }

  function setStagingSceneStatus(
    suggestionId: string,
    status: "approved" | "rejected" | "pending"
  ) {
    patchStaging(
      (current) => {
        const scene = current.scenes.find((s) => s.suggestionId === suggestionId);
        if (!scene) return current;
        return {
          ...current,
          scenes: current.scenes.map((s) =>
            s.suggestionId === suggestionId ? { ...s, status } : s
          ),
        };
      },
      (next, p) => {
        if (status === "pending") return {};
        const scene = next.scenes.find((s) => s.suggestionId === suggestionId);
        if (!scene) return {};
        return {
          agentMemory: appendMemoryDecision(
            p.directorPrep.agentMemory,
            {
              agent: "script_analyzer",
              summary: `${status === "approved" ? "Kept" : "Removed"}: ${scene.scene.heading || scene.scene.oneLine}`,
              approved: status === "approved",
            },
            p.directorPrep.directorRules
          ),
        };
      }
    );
  }

  function rejectAllStaging() {
    patchStaging((current) => ({
      ...current,
      scenes: current.scenes.map((s) => ({ ...s, status: "rejected" as const })),
      locations: current.locations.map((l) => ({ ...l, status: "rejected" as const })),
      characters: (current.characters ?? []).map((c) => ({ ...c, status: "rejected" as const })),
      shotSequences: current.shotSequences.map((s) => ({ ...s, status: "rejected" as const })),
      budget: current.budget ? { ...current.budget, status: "rejected" as const } : null,
      visual: current.visual ? { ...current.visual, status: "rejected" as const } : null,
    }));
    showToast("All items marked Remove.");
  }

  function acceptAllStaging() {
    patchStaging(
      (current) => approveAllStagingItems(current),
      (next, p) => ({
        agentMemory: recordStagingDecisions(
          p.directorPrep.agentMemory,
          next,
          p.directorPrep.directorRules
        ),
      })
    );
    setReviewConfirmed(true);
    showToast(scriptToPromptActive ? "All kept — tap Add to project & open Prompts below." : "All items marked Keep.");
  }

  function commitScriptToPromptStaging(approved: AgentStagingBundle) {
    stagingClearedRef.current = true;
    setStaging(null);
    setEditingCommitted(false);
    setReviewConfirmed(false);
    setPrepFocusPhase("review");
    updateState((p) => buildScriptToPromptPackState(commitAgentStaging(p, approved)));
  }

  function runInstantDemo() {
    onSkipNextAutosave?.();
    const result = applyInstantDemoPrep(state, projectName);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    updateState(() => result.state);
    setActiveStep(2);
    onPrepStepChange("generate");
    flushSync(() => {
      onOpenPrompts?.() ?? onOpenProduction?.();
    });
    showToast(
      `Demo loaded — ${result.sceneCount} scenes, ${result.promptCount} prompts ready in Finish → Prompts.`
    );
  }

  function scriptToPromptQuickAdd() {
    if (!staging || staging.status !== "review" || quickAddBusy) return;
    setQuickAddBusy(true);
    onSkipNextAutosave?.();
    const approved = approveAllStagingItems(staging);
    const runId = staging.runId;

    flushSync(() => {
      onOpenPrompts?.() ?? onOpenProduction?.();
    });

    window.setTimeout(() => {
      try {
        commitScriptToPromptStaging(approved);
        scriptToPromptAutoApprovedRunRef.current = runId;
        showToast("Added to project. Opening Finish → Prompts.");
      } finally {
        setQuickAddBusy(false);
      }
    }, 0);
  }

  function saveStagingToProject() {
    if (!staging) {
      if (approvedCount === 0) {
        patchDirectorPrep((prev) => ({
          ...prev,
          scenes: prev.scenes.map((s) => ({ ...s, status: "approved" as const })),
        }));
      }
      return;
    }
    const toSave = staging.scenes.every((s) => s.status === "pending")
      ? approveAllStagingItems(staging)
      : staging;
    if (scriptToPromptActive) {
      onSkipNextAutosave?.();
      flushSync(() => {
        onOpenPrompts?.() ?? onOpenProduction?.();
      });
      window.setTimeout(() => {
        commitScriptToPromptStaging(toSave);
        showToast("Added to project. Opening Finish → Prompts.");
      }, 0);
      return;
    }
    stagingClearedRef.current = true;
    updateState((p) => {
      const next = commitAgentStaging(p, toSave);
      return applyCrossTabIntelligence(next, "full");
    });
    setStaging(null);
    setEditingCommitted(false);
    setReviewConfirmed(false);
    setPrepFocusPhase("review");
    showToast("Added to your project — Finish and World bible updated.");
  }

  function editPrepChoices() {
    setEditingCommitted(true);
    setReviewConfirmed(false);
    setPrepFocusPhase("review");
  }

  function acceptAllProjectScenes() {
    patchDirectorPrep((prev) => {
      let memory = prev.agentMemory;
      const scenes = prev.scenes.map((s) => ({ ...s, status: "approved" as const }));
      for (const scene of scenes) {
        memory = appendMemoryDecision(
          memory,
          {
            agent: "script_analyzer",
            summary: `Approved scene: ${scene.heading || scene.oneLine || `Scene ${scene.number}`}`,
            approved: true,
          },
          prev.directorRules
        );
      }
      return { ...prev, scenes, agentMemory: memory };
    });
    setActiveStep(3);
  }

  function resetPrepResultsState() {
    setStaging(null);
    setPrepFocusPhase("wizard");
    setReviewConfirmed(false);
    setEditingCommitted(false);
    setAgentSlots(createInitialAgentSlots());
    setActivePipeline(null);
    setAgentInsights({});
  }

  function resetPrepResults() {
    resetPrepResultsState();
    patchDirectorPrep((prev) => ({
      ...prev,
      agentStaging: null,
    }));
  }

  function handleFileUpload(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => {
      pushToast({ message: "Could not read that file. Try a .txt or .fountain file.", variant: "error" });
    };
    reader.onload = () => {
      const text = String(reader.result ?? "");
      if (!text.trim()) {
        pushToast({ message: "That file is empty.", variant: "error" });
        return;
      }
      resetPrepResultsState();
      patchDirectorPrep((prev) => ({
        ...prev,
        agentStaging: null,
        screenplay: {
          ...prev.screenplay,
          rawText: text.slice(0, SCREENPLAY_RAW_TEXT_MAX_CHARS),
          lastImportedAt: new Date().toISOString(),
        },
      }));
      setActiveStep(2);
      onPrepStepChange("generate");
      showToast(`Loaded ${file.name} — pick agents on Generate, then run prep.`);
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-4">
      {error && !running ? (
        <ProStatusBanner variant="error" message={error} onDismiss={() => setError(null)} />
      ) : null}

      {/* Step 1 — Script */}
      <WizardSection step={1} activeStep={activeStep}>
        {!hasScript && scriptToPromptActive ? (
          <ScriptToPromptStartHero
            onTryDemo={runInstantDemo}
            onPasteScript={() => scriptTextareaRef.current?.focus()}
            onUploadScript={() => fileInputRef.current?.click()}
            onChangeWorkflow={() => onOpenWorkflow?.()}
            demoBusy={quickAddBusy}
          />
        ) : null}

        <div className="mb-3 space-y-1">
          <p className="text-sm leading-snug text-pro-text">
            {scriptToPromptActive
              ? hasScript
                ? "Edit script and vision, then open Run prep."
                : "Or paste below — Fountain-style INT./EXT. headings."
              : "Paste script and vision, then run prep on Generate."}
          </p>
          <p className="text-xs leading-snug text-pro-text-secondary">
            {PRO_SCRIPT_PASTE_PRIVACY_CALLOUT}
          </p>
        </div>
        <label className="block text-sm text-pro-text-secondary">
          Screenplay
          <textarea
            ref={scriptTextareaRef}
            rows={14}
            className={`mt-2 max-md:min-h-[min(50vh,24rem)] max-md:!h-auto font-mono text-xs leading-relaxed md:h-auto ${FIELD_CLASS} placeholder:text-[#525252]`}
            placeholder="Paste your script here — INT. KITCHEN - NIGHT&#10;&#10;She reads the letter..."
            value={dp.screenplay.rawText}
            onChange={(e) =>
              patchDirectorPrep((prev) => ({
                ...prev,
                screenplay: { ...prev.screenplay, rawText: e.target.value },
              }))
            }
          />
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-pro-text-secondary">
          <span className={overCharLimit ? "text-pro-warning" : ""}>
            {charCount.toLocaleString()} / {SCREENPLAY_RAW_TEXT_MAX_CHARS.toLocaleString()} chars
          </span>
          {hasScript ? (
            <span
              className={
                detectedHeadingCount > 0 ? "font-medium text-emerald-400/90" : "text-pro-warning"
              }
            >
              {detectedHeadingCount > 0
                ? `${detectedHeadingCount} scene heading${detectedHeadingCount === 1 ? "" : "s"} detected`
                : "No scene headings detected — use INT. LOCATION - DAY (one per line)"}
            </span>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.fountain,text/plain"
            className="hidden"
            onChange={(e) => {
              handleFileUpload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {!(scriptToPromptActive && !hasScript) ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-white/[0.1] text-pro-text"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1.5 size-3.5" aria-hidden />
              Upload script
            </Button>
          ) : null}
          {scriptToPromptActive && hasScript ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-pro-accent/35 text-pro-accent-bright hover:bg-pro-accent/10"
              onClick={runInstantDemo}
            >
              Try 3-scene demo
            </Button>
          ) : null}
        </div>

        {hasScript && scriptToPromptActive ? (
          <div className="mt-4 flex justify-end border-t border-white/[0.06] pt-4">
            <Button
              type="button"
              size="sm"
              className="bg-pro-primary hover:brightness-110"
              disabled={localPrepBlocked && !agentsEnabled}
              onClick={() => {
                setActiveStep(2);
                onPrepStepChange("generate");
              }}
            >
              Continue → Run prep
            </Button>
          </div>
        ) : null}

        <details
          className={`mt-4 space-y-3 rounded-lg border border-white/[0.08] bg-pro-surface p-3 ${scriptToPromptActive ? "" : "open"}`}
          open={!scriptToPromptActive}
        >
          <summary className="cursor-pointer list-none text-sm font-medium text-pro-text marker:content-none [&::-webkit-details-marker]:hidden">
            {scriptToPromptActive
              ? "Advanced: long script, vision & look rules"
              : "Long script & analysis options"}
          </summary>
          <div className="space-y-3 pt-1">
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-2 text-sm text-pro-text-secondary">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={dp.prepRunSettings.longScriptMode}
                  onChange={(e) =>
                    patchDirectorPrep((prev) => ({
                      ...prev,
                      prepRunSettings: {
                        ...prev.prepRunSettings,
                        longScriptMode: e.target.checked,
                      },
                    }))
                  }
                />
                <span>
                  <span className="font-medium text-pro-text">Long script mode</span>
                  <span className="block text-xs text-pro-text-secondary">
                    Features / TV. Compresses head and tail so agents stay within context.
                  </span>
                </span>
              </label>
              <label className="block text-sm text-pro-text-secondary">
                Analyze only this excerpt (optional, e.g. Act 2)
                <textarea
                  rows={4}
                  className={`mt-1 font-mono text-xs ${FIELD_CLASS}`}
                  placeholder="Paste one act or sequence. Leave empty to use the full script above."
                  value={dp.prepRunSettings.analysisExcerpt}
                  onChange={(e) =>
                    patchDirectorPrep((prev) => ({
                      ...prev,
                      prepRunSettings: {
                        ...prev.prepRunSettings,
                        analysisExcerpt: e.target.value.slice(0, SCREENPLAY_RAW_TEXT_MAX_CHARS),
                      },
                    }))
                  }
                />
              </label>
            </div>

            {scriptToPromptActive ? (
              <div className="space-y-4 border-t border-white/[0.08] pt-4">
                <div>
                  <h3 className="text-sm font-medium text-pro-text">Look for prompt building</h3>
                  <p className="mt-1 text-xs text-pro-text-secondary">
                    These fields feed Finish → Prompts. Lock palette and references in Look → Photos
                    first.
                  </p>
                </div>
                <VisionFieldsEditor
                  rules={dp.directorRules}
                  scriptToPrompt={scriptToPromptActive}
                  onPatch={(fn) =>
                    patchDirectorPrep((prev) => ({ ...prev, directorRules: fn(prev.directorRules) }))
                  }
                />
                <label className="block text-sm text-pro-text-secondary">
                  Prompt pack instructions
                  <textarea
                    rows={2}
                    className={`mt-1 ${FIELD_CLASS}`}
                    placeholder="e.g. Default to Midjourney for masters, Higgsfield for motion tests; ban vertical crops…"
                    value={dp.directorRules.projectInstructions}
                    onChange={(e) =>
                      patchDirectorPrep((prev) => ({
                        ...prev,
                        directorRules: { ...prev.directorRules, projectInstructions: e.target.value },
                      }))
                    }
                  />
                  <span className="mt-1 block text-xs text-pro-text-secondary">
                    Optional constraints for agents and prompt building. Re-apply the template to reset
                    this field with the default pack workflow.
                  </span>
                </label>
                <label className="block text-sm text-pro-text-secondary">
                  Genre tags (comma-separated)
                  <input
                    className={`mt-1 ${FIELD_CLASS}`}
                    value={dp.directorRules.genreTags.join(", ")}
                    onChange={(e) =>
                      patchDirectorPrep((prev) => ({
                        ...prev,
                        directorRules: {
                          ...prev.directorRules,
                          genreTags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        },
                      }))
                    }
                  />
                </label>
                <div className="rounded-lg border border-white/[0.08] bg-black/20 px-3 py-3">
                  <p className="text-sm font-medium text-pro-text">Look references</p>
                  <p className="mt-1 text-xs text-pro-text-secondary">
                    Photos and palette live in{" "}
                    <strong className="text-pro-text">Look → Photos</strong>. They feed every prompt in
                    Finish → Prompts. Don&apos;t paste image data or links here.
                  </p>
                  {onGoToLook ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`${proBtn.outline} mt-3`}
                      onClick={onGoToLook}
                    >
                      Open Look → Photos
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </details>

        {!scriptToPromptActive ? (
          <div className="mt-8 space-y-4 border-t border-white/[0.08] pt-6">
            <div>
              <h3 className="text-sm font-medium text-pro-text">Vision & director&apos;s bible</h3>
              <p className="mt-1 text-xs text-pro-text-secondary">Style and references for prep agents.</p>
            </div>
            <VisionFieldsEditor
              rules={dp.directorRules}
              scriptToPrompt={scriptToPromptActive}
              onPatch={(fn) =>
                patchDirectorPrep((prev) => ({ ...prev, directorRules: fn(prev.directorRules) }))
              }
            />
            <label className="block text-sm text-pro-text-secondary">
              Instructions for this project
              <textarea
                rows={2}
                className={`mt-1 ${FIELD_CLASS}`}
                placeholder="e.g. Mix The Revenant wilderness grit with Nomadland intimacy…"
                value={dp.directorRules.projectInstructions}
                onChange={(e) =>
                  patchDirectorPrep((prev) => ({
                    ...prev,
                    directorRules: { ...prev.directorRules, projectInstructions: e.target.value },
                  }))
                }
              />
            </label>
            <label className="block text-sm text-pro-text-secondary">
              Genre tags (comma-separated)
              <input
                className={`mt-1 ${FIELD_CLASS}`}
                value={dp.directorRules.genreTags.join(", ")}
                onChange={(e) =>
                  patchDirectorPrep((prev) => ({
                    ...prev,
                    directorRules: {
                      ...prev.directorRules,
                      genreTags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    },
                  }))
                }
              />
            </label>
            <div className="rounded-lg border border-white/[0.08] bg-black/20 px-3 py-3">
              <p className="text-sm font-medium text-pro-text">Look references</p>
              <p className="mt-1 text-xs text-pro-text-secondary">
                Photos and film references live in{" "}
                <strong className="text-pro-text">Look → Photos</strong>. Agents find films from your
                vision above. Don&apos;t paste image data or links here.
              </p>
              {onGoToLook ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={`${proBtn.outline} mt-3`}
                  onClick={onGoToLook}
                >
                  Open Look → Photos
                </Button>
              ) : null}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-pro-text-secondary">
                Budget level
              </p>
              <ProSelect
                aria-label="Budget level"
                className="mt-2"
                value={dp.directorRules.budgetTier}
                options={[
                  { value: "indie", label: "Indie / micro" },
                  { value: "mid", label: "Mid-tier" },
                  { value: "high", label: "High / studio" },
                ]}
                onChange={(band) =>
                  patchDirectorPrep((prev) => ({
                    ...prev,
                    directorRules: {
                      ...prev.directorRules,
                      budgetTier: band as DirectorBudgetTier,
                    },
                  }))
                }
              />
            </div>
          </div>
        ) : null}

        {hasScript && !scriptToPromptActive ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-pro-elevated/60 px-4 py-3 ring-1 ring-white/[0.06]">
            <p className="text-sm text-pro-text-secondary">
              Script loaded. Open <span className="font-medium text-pro-text">Generate</span> to run
              prep and review results.
            </p>
            <Button
              type="button"
              size="sm"
              className="shrink-0 bg-pro-primary hover:brightness-110"
              disabled={localPrepBlocked && !agentsEnabled}
              onClick={() => {
                setActiveStep(2);
                onPrepStepChange("generate");
              }}
            >
              Continue to Generate
              <ChevronRight className="ml-1 size-4" aria-hidden />
            </Button>
          </div>
        ) : null}
        {!hasScript && !scriptToPromptActive ? (
          <ProEmptyState
            className="mt-4"
            title="Start with your screenplay"
            description="Paste Fountain-style text or upload a .txt or .fountain file. We never train on your script — it stays in your project."
          />
        ) : null}
      </WizardSection>

      {/* Step 2 — Generate */}
      <WizardSection step={2} activeStep={activeStep}>
        {!hasScript ? (
          <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-pro-elevated/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-pro-text-secondary">
              {scriptToPromptActive
                ? "Paste a script, try the demo, or go back to the Script tab."
                : "Paste or upload your screenplay to run prep."}
            </p>
            <Button
              type="button"
              size="sm"
              className="shrink-0 bg-pro-primary hover:brightness-110"
              onClick={() => {
                setActiveStep(1);
                onPrepStepChange("script");
              }}
            >
              <Upload className="mr-1.5 size-3.5" aria-hidden />
              Upload script
            </Button>
          </div>
        ) : null}

        {!showReviewPanel && hasScript ? (
          <p className="text-sm text-pro-text-secondary">
            Pick sections and run prep.
            <span className="hidden text-[#525252] md:inline"> ⌘ + Enter</span>
          </p>
        ) : null}

        {prepRunPhase === "blocked" ? (
          <ProStatusBanner
            variant="error"
            message="Quick prep needs scene lines in Step 1 — e.g. INT. KITCHEN - NIGHT (one per line)."
          />
        ) : !hasScript ? null : localPrepBlocked && !agentsEnabled ? (
          <ProStatusBanner
            variant="error"
            message="No scene headings detected. Add INT./EXT. lines in Step 1, or turn on AI prep for prose breakdown."
          />
        ) : showReviewPanel ? null : (
          <ProStatusBanner
            variant="info"
            message={
              agentsEnabled
                ? `AI prep ready · ${detectedHeadingCount > 0 ? `${detectedHeadingCount} scenes detected · ` : ""}${selectedAgents.length} sections selected`
                : `Quick prep ready · ${detectedHeadingCount} scene${detectedHeadingCount === 1 ? "" : "s"} · ${selectedAgents.length} sections · ~30s on your device`
            }
          />
        )}

        {showPrepSelector || showPrepProgress ? (
          <div ref={runPrepSectionRef} className={`${proSurface.sectionMuted} space-y-4`}>
            {showPrepSelector ? (
              scriptToPromptActive ? (
                <p className="text-sm text-pro-text-secondary">
                  We&apos;ll parse scene headings, lock a look bible, and build{" "}
                  <span className="text-pro-text">3–4 copy-ready prompts per scene</span> — no shot
                  lists or coverage grids.
                </p>
              ) : (
                <PrepAgentSelector
                  selected={selectedAgents}
                  onChange={setSelectedAgents}
                  disabled={running}
                  estimateLabel={runEstimate.minutesLabel}
                  costLabel={runEstimate.costLabel}
                />
              )
            ) : null}

            {showPrepSelector ? (
              <div className="hidden flex-wrap items-center justify-between gap-3 md:flex">
                <KeyboardShortcutTooltip shortcutId="run_prep">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full bg-pro-primary px-6 font-semibold shadow-lg shadow-pro-primary/25 hover:brightness-110 sm:w-auto"
                    disabled={!hasScript || running || localPrepBlocked || selectedAgents.length === 0}
                    onClick={() => void runPrep()}
                  >
                    {running ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                        Running…
                      </>
                    ) : localPrepBlocked ? (
                      <>Add scene lines first</>
                    ) : (
                      <>
                        <Sparkles className="mr-2 size-4" aria-hidden />
                        {agentsEnabled ? "Run AI prep" : "Run quick prep"}
                      </>
                    )}
                  </Button>
                </KeyboardShortcutTooltip>
              </div>
            ) : null}

            {showPrepProgress ? (
              <>
                <ProLoadingBar active={running} label={running ? progressMessage ?? "Prep running…" : undefined} />
                <AgentProgressPanel
                  slots={agentSlots}
                  activeOnly={activePipeline ?? selectedAgents}
                  estimatedLabel={running ? runEstimate.minutesLabel : undefined}
                  costLabel={running ? runEstimate.costLabel : undefined}
                  insights={agentInsights}
                  staging={staging}
                  onCancel={running && agentsEnabled ? cancelPrepRun : undefined}
                  runPhase={prepRunPhase}
                  prepMode={agentsEnabled ? "ai" : "quick"}
                  onRunAgain={undefined}
                />
              </>
            ) : null}
          </div>
        ) : null}

        {showReviewPanel && staging ? (
          <div ref={reviewSectionRef} className="space-y-3">
              <PrepReviewPanel
                key={staging.runId}
                staging={staging}
                promptPack={scriptToPromptActive}
                reviewConfirmed={reviewConfirmed}
                onReviewConfirmed={setReviewConfirmed}
                editingCommitted={editingCommitted}
                onEditChoices={editPrepChoices}
                running={running}
                onSceneStatus={setStagingSceneStatus}
                onLocationStatus={(id, status) => setStagingItemStatus("location", id, status)}
                onPatchLocation={patchLocationSuggestion}
                onShootSuggestionStatus={setShootSuggestionStatus}
                onCharacterStatus={(id, status) => setStagingItemStatus("character", id, status)}
                onShotStatus={(id, status) => setStagingItemStatus("shot", id, status)}
                onBudgetStatus={(status) =>
                  setStagingItemStatus("budget", staging.budget?.suggestionId ?? null, status)
                }
                onVisualStatus={(status) =>
                  setStagingItemStatus("visual", staging.visual?.suggestionId ?? null, status)
                }
                onKeepAll={acceptAllStaging}
                onRemoveAll={rejectAllStaging}
                onCommit={saveStagingToProject}
                onQuickAdd={scriptToPromptActive ? scriptToPromptQuickAdd : undefined}
                quickAddBusy={quickAddBusy}
                onOpenProduction={onOpenProduction}
                onOpenPrompts={onOpenPrompts}
                onSkipReviewProduction={
                  scriptToPromptActive
                    ? onOpenPrompts
                      ? skipReviewToProduction
                      : undefined
                    : onOpenProduction
                      ? skipReviewToProduction
                      : undefined
                }
                onGoToExport={
                  onGoToExport ??
                  (() => {
                    onPrepStepChange("download");
                  })
                }
                onBackToGenerate={restartPrepRun}
                onEditScript={() => {
                  setActiveStep(1);
                  onPrepStepChange("script");
                  requestAnimationFrame(() => {
                    scriptTextareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    scriptTextareaRef.current?.focus();
                  });
                }}
              />
          </div>
        ) : null}

        <div className={hideDesktopSidebar || scriptToPromptActive ? "hidden md:block xl:hidden" : undefined}>
          <PrepKeyboardHints agentsEnabled={agentsEnabled} />
        </div>

        <ProConfirmDialog
          open={skipReviewConfirmOpen}
          title="Skip review?"
          description="Everything from this prep run will be kept without checking each item."
          confirmLabel={
            scriptToPromptActive ? "Keep all & open Finish → Prompts" : "Keep all & open Finish"
          }
          onClose={() => setSkipReviewConfirmOpen(false)}
          onConfirm={confirmSkipReviewToProduction}
        >
          <p className="text-xs text-pro-text-secondary">
            You can change choices later with{" "}
            <span className="text-pro-text">Edit prep choices</span> on Run prep.
          </p>
        </ProConfirmDialog>

        {!scriptToPromptActive ? (
          <div className={hideDesktopSidebar ? "xl:hidden" : undefined}>
            <ProjectMemoryPanel memory={dp.agentMemory} appliedTemplateId={dp.appliedTemplateId} />
          </div>
        ) : null}

        {running && progressMessage ? (
          <ProStatusBanner variant="loading" message={progressMessage} />
        ) : null}

        {(showManualSteps || agentsEnabled) && !running && showPrepSelector ? (
          <details className={`${proSurface.sectionMuted} group`}>
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-pro-text-secondary marker:content-none [&::-webkit-details-marker]:hidden">
              Power users: auto-fill from Claude JSON
              <span className="ml-2 text-xs font-normal text-[#525252]">
                Optional — paste external agent output instead of Run prep
              </span>
            </summary>
            <div className="space-y-3 border-t border-white/[0.06] px-4 pb-4 pt-3">
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" className="bg-pro-primary hover:brightness-110" onClick={() => void copyPrepPrompt()}>
                Copy prep prompt
              </Button>
              <Button type="button" size="sm" variant="outline" className="border-white/[0.1] text-pro-text" asChild>
                <a href="https://claude.ai/new" target="_blank" rel="noopener noreferrer">
                  Open Claude
                </a>
              </Button>
            </div>
            <textarea
              rows={6}
              className={`font-mono text-xs ${FIELD_CLASS}`}
              placeholder='Paste Claude&apos;s JSON reply here…'
              value={manualPaste}
              onChange={(e) => setManualPaste(e.target.value)}
            />
            {manualPreview?.ok ? (
              <p className="text-sm text-emerald-300/90">
                Ready: {manualPreview.sceneCount} scenes · {manualPreview.shotSequenceCount} shot lists
              </p>
            ) : null}
            <Button
              type="button"
              size="sm"
              className="bg-pro-primary hover:brightness-110"
              disabled={!manualPreview?.ok}
              onClick={applyManualResult}
            >
              Add to project
            </Button>
            </div>
          </details>
        ) : null}

        {!hasScript && !sceneCount && !running ? (
          <ProEmptyState
            className="mt-4"
            title="No script yet"
            description="Paste or upload your screenplay in step 1, then return here to run prep."
            action={
              <Button type="button" size="sm" variant="outline" className="border-white/[0.1]" onClick={() => setActiveStep(1)}>
                Go to script step
              </Button>
            }
          />
        ) : null}
      </WizardSection>

      <ProPrepRunMobileBar
        visible={activeStep === 2 && showPrepSelector && hasScript && !localPrepBlocked}
        running={running}
        disabled={!hasScript || localPrepBlocked}
        agentsEnabled={agentsEnabled}
        localPrepBlocked={localPrepBlocked}
        onRun={() => void runPrep()}
      />

      {/* Step 3 — Prep report (S2P points to Finish → Export) */}
      <WizardSection step={3} activeStep={activeStep}>
        {approvedCount > 0 || sceneCount > 0 ? (
          <>
            {scriptToPromptActive ? (
              <>
                <p className="text-sm text-pro-text-secondary">
                  Your prompt pack downloads from{" "}
                  <strong className="text-pro-text">Finish → Export</strong> — the one file to keep
                  when you leave Pro.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {onGoToExport ? (
                    <Button
                      type="button"
                      className="bg-pro-primary hover:brightness-110"
                      onClick={onGoToExport}
                    >
                      Export
                    </Button>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="text-sm text-pro-text-secondary">
                <strong className="text-pro-text">Prep report</strong> is one quick Markdown summary here.
                Full downloads (FDX, CSV, storyboard, prompt pack) live in{" "}
                <strong className="text-pro-text">Finish → Export</strong>.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {!scriptToPromptActive ? (
                <ProExportDownloadButton
                  projectId={projectId}
                  projectName={projectName}
                  kind="preproduction-report"
                  label="Download prep report (.md)"
                  includeDrafts
                  successMessage="Prep report downloaded."
                />
              ) : null}
              {onOpenPrompts && scriptToPromptActive ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-white/[0.12] text-pro-text"
                  onClick={onOpenPrompts}
                >
                  Open Prompts
                </Button>
              ) : onGoToExport && scriptToPromptActive ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-white/[0.12] text-pro-text"
                  onClick={onGoToExport}
                >
                  More export formats
                </Button>
              ) : onOpenProduction && !scriptToPromptActive ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-white/[0.12] text-pro-text"
                  onClick={onOpenProduction}
                >
                  Open Finish
                </Button>
              ) : null}
            </div>
            {approvedCount > 0 ? (
              <p className="mt-3 text-sm text-emerald-300/90">
                {approvedCount} scene{approvedCount === 1 ? "" : "s"} in your project.
              </p>
            ) : null}
            {agentsEnabled ? (
            <div className="mt-6 rounded-xl border border-white/[0.08] bg-pro-surface p-4">
              <p className="text-sm font-medium text-white">Refine prep</p>
              <p className="mt-1 text-xs text-pro-text-secondary">
                Re-run specific sections with a short note (requires AI prep).
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  type="text"
                  value={refineHint}
                  onChange={(e) => {
                    setRefineHint(e.target.value);
                    setRefinePreviewOpen(false);
                  }}
                  placeholder="e.g. more cinematic, lower budget, more locations…"
                  className={`min-w-[200px] flex-1 ${FIELD_CLASS}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/[0.1] text-pro-text"
                  disabled={!refineHint.trim() || running || !agentsEnabled}
                  onClick={() => setRefinePreviewOpen(true)}
                >
                  Preview changes
                </Button>
              </div>
              {refinePreviewOpen && refinePreview ? (
                <div className="mt-3">
                  <RefinePreviewCard
                    preview={refinePreview}
                    minutesLabel={refineEstimate.minutesLabel}
                    costLabel={refineEstimate.costLabel}
                    running={running}
                    disabled={!agentsEnabled}
                    onDismiss={() => setRefinePreviewOpen(false)}
                    onConfirm={() => {
                      setActiveStep(2);
                      void runPrep({ refine: true });
                    }}
                  />
                </div>
              ) : refineHint.trim() && !refinePreviewOpen ? (
                <p className="mt-2 text-xs text-[#525252]">
                  Click <span className="text-pro-text-secondary">Preview changes</span> to see agents and impact
                  before running.
                </p>
              ) : null}
            </div>
            ) : null}
          </>
        ) : (
          <ProEmptyState
            title="Prep report unlocks after prep"
            description={
              scriptToPromptActive
                ? "Run prep, add to your project, and lock your look — then download your prompt pack from Finish → Export."
                : "Run prep, review your results, and add to your project — then grab a prep report here or full files in Finish → Export."
            }
            action={
              <Button type="button" size="sm" className="bg-pro-primary hover:brightness-110" onClick={() => setActiveStep(2)}>
                Go to Run prep
              </Button>
            }
          />
        )}
      </WizardSection>
    </div>
  );
}

function WizardSection({
  step,
  activeStep,
  headerAction,
  children,
}: {
  step: WizardStep;
  activeStep: WizardStep;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  if (activeStep !== step) return null;

  return (
    <section className={`${proSurface.sectionMuted} space-y-4 p-3 sm:p-6 md:p-6`}>
      {headerAction ? (
        <div className="flex justify-end max-md:w-full">{headerAction}</div>
      ) : null}
      {children}
    </section>
  );
}

