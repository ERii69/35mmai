"use client";

import { useMemo, useState } from "react";
import { ImageIcon, Loader2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LookFlowGuide } from "@/components/pro/LookFlowGuide";
import { LookCheckSection, type LookCheckStatus } from "@/components/pro/LookCheckSection";
import { applyMoodBoardPartial, type MoodBoardSection, type MoodBoardPartialOptions } from "@/lib/pro/apply-mood-board-partial";
import type { MoodBoardRegenerateContext } from "@/components/pro/MoodBoardGrid";
import { applyMoodBoardToState } from "@/lib/pro/apply-mood-board";
import { applyCrossTabIntelligence } from "@/lib/pro/cross-tab-sync";
import { applyVisualRefsToShots } from "@/lib/pro/apply-visual-refs-to-shots";
import { buildLocalMoodBoard } from "@/lib/pro/build-local-mood-board";
import {
  ensureShotPlanFromScript,
  shotPlanHasCoverage,
} from "@/lib/pro/ensure-shot-plan-from-script";
import { matchVisualBibleToShotPlan } from "@/lib/pro/shot-plan-enrichment";
import { LookToolStrip } from "@/components/pro/LookToolStrip";
import { MoodBoardGrid } from "@/components/pro/MoodBoardGrid";
import { proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import {
  checkVisualConsistency,
  type VisualConsistencyIssue,
} from "@/lib/pro/visual-consistency-check";
import { ProEmptyState } from "@/components/pro/ux/ProEmptyState";
import { ProStatusBanner } from "@/components/pro/ux/ProStatusBanner";
import { ProLoadingBar } from "@/components/pro/ux/ProLoadingBar";
import type { LookTabId } from "@/lib/pro/workspace-modes";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import type { ProjectStatePayload, StagedVisualSuggestion } from "@/lib/pro/types";

type Props = {
  projectId: string;
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  agentsEnabled: boolean;
  lookTab: LookTabId;
  onEditManual?: () => void;
  onGoToPrep?: () => void;
  onGoToKit?: () => void;
  onGoToShots?: () => void;
  onGoToPhotos?: () => void;
  onGoToLookTab?: (tab: LookTabId) => void;
};

function hasVisualBibleContent(state: ProjectStatePayload): boolean {
  const vb = state.visualBible;
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  return (
    mood.length > 0 ||
    vb.palette.length > 0 ||
    vb.lensAndFraming.trim().length > 0 ||
    vb.designSheetNotes.trim().length > 0 ||
    vb.referenceUrls.length > 0
  );
}

export function VisualLookTools({
  projectId,
  state,
  updateState,
  agentsEnabled,
  lookTab,
  onEditManual,
  onGoToPrep,
  onGoToKit,
  onGoToShots,
  onGoToPhotos,
  onGoToLookTab,
}: Props) {
  const { showToast: pushToast } = useProToast();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [consistencyLoading, setConsistencyLoading] = useState(false);
  const [banner, setBanner] = useState<{ variant: "success" | "error" | "info"; message: string } | null>(
    null
  );
  const [preview, setPreview] = useState<StagedVisualSuggestion | null>(null);
  const [lookCheckStatus, setLookCheckStatus] = useState<LookCheckStatus>("idle");
  const [checkIssues, setCheckIssues] = useState<VisualConsistencyIssue[]>([]);
  const [loadingSection, setLoadingSection] = useState<MoodBoardSection | null>(null);
  const [referenceOffset, setReferenceOffset] = useState(0);
  const [lensGrainVariant, setLensGrainVariant] = useState(0);

  const heuristicIssues = useMemo(() => checkVisualConsistency(state), [state]);
  const lookEmpty = !hasVisualBibleContent(state);
  const moodBoardLoading = status === "loading";
  const hasPhotos = state.visualBible.referenceUrls.length > 0;
  const canApplyLook =
    shotPlanHasCoverage(state) ||
    state.directorPrep.scenes.length > 0 ||
    state.directorPrep.screenplay.rawText.trim().length > 0;
  const scriptToPrompt = isScriptToPromptTemplate(state.directorPrep.appliedTemplateId);
  const shotsNavLabel = scriptToPrompt ? "Finish → Beats" : "Finish → Shots";
  const kitNavLabel = "Finish → Kit";

  function scrollToPhotos() {
    if (onGoToPhotos) {
      onGoToPhotos();
      return;
    }
    document.getElementById("reference-photos")?.scrollIntoView({ behavior: "smooth" });
  }

  function goToMoodBoard() {
    onGoToLookTab?.("mood-board");
  }

  function openManualEdit() {
    onEditManual?.();
  }

  function showSuccess(message: string) {
    setBanner({ variant: "success", message });
    setStatus("done");
    pushToast({ message, variant: "success" });
  }

  function showError(message: string) {
    setBanner({ variant: "error", message });
    setStatus("error");
  }

  function applyLookToShots() {
    if (!canApplyLook) {
      showError("Add a script in Prep first, then generate scenes before applying your look.");
      onGoToPrep?.();
      return;
    }

    const ensured = ensureShotPlanFromScript(state);
    if (!shotPlanHasCoverage(ensured.state)) {
      showError(
        `No shot list yet — run Prep on Generate or open ${shotsNavLabel} to build coverage first.`
      );
      onGoToShots?.();
      return;
    }

    const photoCount = state.visualBible.referenceUrls.filter((u) => u.startsWith("data:image")).length;
    const shotCountBefore = state.shotPlan.sequences.flatMap((s) => s.shots).length;

    updateState((p) => {
      let next = p;
      if (!shotPlanHasCoverage(next)) {
        next = ensureShotPlanFromScript(next).state;
      }
      const withRefs = applyVisualRefsToShots(next);
      return applyCrossTabIntelligence(matchVisualBibleToShotPlan(withRefs), "look");
    });
    setLookCheckStatus("idle");

    const shotCountAfter = Math.max(
      shotCountBefore,
      ensured.state.shotPlan.sequences.flatMap((s) => s.shots).length
    );
    const createdPlan = !shotPlanHasCoverage(state) && shotCountAfter > 0;

    showSuccess(
      [
        createdPlan ? "Shot plan created from prep" : "Look applied to shots",
        `${shotCountAfter} shot${shotCountAfter === 1 ? "" : "s"} updated with palette, mood, lens, and lighting notes`,
        photoCount > 0 ? `${photoCount} reference photo${photoCount === 1 ? "" : "s"} linked` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    );
  }

  async function generateMoodBoard(sections?: MoodBoardSection[], context?: MoodBoardRegenerateContext) {
    const isLensOrGrain =
      sections?.length === 1 && (sections[0] === "lens" || sections[0] === "grain");
    const stills = state.visualBible.referenceUrls.filter((u) => u.startsWith("data:image"));

    if (isLensOrGrain && stills.length === 0) {
      showError("Upload reference photos in Step 1 first — lens and grain are read from your stills.");
      scrollToPhotos();
      return;
    }

    setStatus("loading");
    setLoadingSection(sections?.[0] ?? null);
    setBanner(null);
    if (!sections?.length) setPreview(null);

    const nextOffset = context?.referenceTitle ? referenceOffset + 1 : referenceOffset;
    const nextLensGrainVariant = isLensOrGrain ? lensGrainVariant + 1 : lensGrainVariant;

    try {
      const res = await fetch(`/api/pro/visual/${projectId}/mood-board`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections,
          referenceUrls: state.visualBible.referenceUrls,
          referenceTitle: context?.referenceTitle,
          templateOffset: context?.templateOffset ?? nextOffset,
          lensGrainVariant: nextLensGrainVariant,
          refineHint: context?.referenceTitle
            ? undefined
            : sections?.length
              ? `Regenerate only: ${sections.join(", ")} for the visual bible.`
              : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        visual?: StagedVisualSuggestion;
        source?: string;
        warning?: string;
      };

      if (!res.ok || !data.ok || !data.visual) {
        if (res.status === 429) {
          throw new Error(data.error ?? "Daily AI limit reached — use quick prep");
        }
        throw new Error(data.error ?? `Mood board failed (${res.status})`);
      }

      if (isLensOrGrain) setLensGrainVariant(nextLensGrainVariant);
      setPreview(null);
      if (context?.referenceTitle) setReferenceOffset(nextOffset);

      updateState((p) => {
        const partialOpts: MoodBoardPartialOptions | undefined = context?.replaceReferenceId
          ? { replaceReferenceId: context.replaceReferenceId }
          : undefined;
        const patched = sections?.length
          ? applyMoodBoardPartial(p, data.visual!, sections, partialOpts)
          : applyMoodBoardToState(p, data.visual!);
        return applyCrossTabIntelligence(patched, "look");
      });

      const sourceLabel =
        data.source === "vision"
          ? "read from your photos"
          : data.source === "agent"
            ? "Visual Bible agent"
            : agentsEnabled
              ? "local fallback"
              : "local synthesis";

      const sectionLabel = isLensOrGrain
        ? sections![0] === "lens"
          ? "Lens & framing"
          : "Grain & texture"
        : context?.referenceTitle
          ? `"${context.referenceTitle}" updated`
          : sections?.length
            ? sections.join(", ")
            : "Mood board";

      showSuccess(
        isLensOrGrain
          ? `${sectionLabel} updated (${sourceLabel}).`
          : sections?.length || context?.referenceTitle
            ? `${sectionLabel} (${sourceLabel}).`
            : data.warning
              ? `Mood board ready (${sourceLabel}). ${data.warning}`
              : `Mood board ready — ${sourceLabel}. Click tiles to explore, then apply to shots.`
      );
    } catch (e) {
      showError(e instanceof Error ? e.message : "Could not generate mood board.");
      setStatus("idle");
    } finally {
      setLoadingSection(null);
    }
  }

  async function runDeepConsistencyCheck() {
    setConsistencyLoading(true);
    setLookCheckStatus("running");
    setBanner(null);

    const localIssues = checkVisualConsistency(state);
    if (localIssues.length > 0) {
      setCheckIssues(localIssues);
      setLookCheckStatus("issues");
    }

    try {
      const res = await fetch(`/api/pro/visual/${projectId}/consistency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        summary?: string;
        conflicts?: VisualConsistencyIssue[];
        warning?: string;
      };
      if (!res.ok || !data.ok) {
        if (res.status === 429) {
          throw new Error(data.error ?? "Daily AI limit reached — use quick prep");
        }
        throw new Error(data.error ?? "Consistency check failed");
      }
      const apiIssues = data.conflicts ?? [];
      const merged = [...apiIssues];
      for (const h of heuristicIssues) {
        if (!merged.some((m) => m.sceneNumber === h.sceneNumber && m.message === h.message)) {
          merged.push(h);
        }
      }
      setCheckIssues(merged);

      if (merged.length > 0) {
        setLookCheckStatus("issues");
        setBanner({
          variant: "info",
          message: `${merged.length} scene${merged.length === 1 ? "" : "s"} may not match your look — see Step 3 below.`,
        });
        setStatus("done");
      } else {
        setLookCheckStatus("clear");
        setCheckIssues([]);
        setBanner(null);
        setStatus("done");
      }
    } catch (e) {
      setLookCheckStatus("idle");
      showError(e instanceof Error ? e.message : "Consistency check failed.");
    } finally {
      setConsistencyLoading(false);
    }
  }

  function handleFlowStep(step: "photos" | "build" | "apply") {
    if (step === "photos") scrollToPhotos();
    if (step === "build") void generateMoodBoard();
    if (step === "apply") applyLookToShots();
  }

  const displayVisual: StagedVisualSuggestion | null = useMemo(() => {
    if (preview) return preview;
    if (!hasVisualBibleContent(state)) return null;

    const staged = state.directorPrep.agentStaging?.visual;
    const storedRefs = state.visualBible.moodBoardReferences;
    const fallbackRefs = buildLocalMoodBoard(state).moodBoardReferences;

    return {
      suggestionId: "workspace",
      status: "approved",
      confidence: 1,
      mood: state.directorPrep.agentMeta.visualMood,
      palette: state.visualBible.palette,
      lensAndFraming: state.visualBible.lensAndFraming,
      grainAndTexture: state.visualBible.grainAndTexture,
      designNotes: state.visualBible.designSheetNotes,
      referenceUrls: state.visualBible.referenceUrls,
      moodBoardReferences: storedRefs.length
        ? storedRefs
        : staged?.moodBoardReferences?.length
          ? staged.moodBoardReferences
          : fallbackRefs,
    };
  }, [preview, state]);

  return (
    <div className={`${proSurface.section} space-y-6`}>
      {lookTab === "mood-board" ? (
        <>
      <LookFlowGuide
        state={state}
        scriptToPrompt={isScriptToPromptTemplate(state.directorPrep.appliedTemplateId)}
        onStep={handleFlowStep}
      />

      {banner ? (
        <ProStatusBanner
          variant={banner.variant}
          message={banner.message}
          onDismiss={() => setBanner(null)}
        />
      ) : null}

      {/* Mood board tiles + primary actions */}
      <section className="space-y-4" aria-labelledby="mood-board-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-pro-primary">Step 2</p>
            <h3 id="mood-board-heading" className="mt-0.5 text-lg font-semibold text-pro-text">
              Mood board
            </h3>
            <p className="mt-1 text-sm text-pro-text-secondary">
              {lookEmpty
                ? hasPhotos
                  ? "Your photos are ready — build tiles from your references."
                  : "Start with reference photos above, then build your mood board."
                : "Click a tile for details · ↻ regenerates one section"}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:shrink-0">
            <Button
              type="button"
              size="sm"
              className={`${proBtn.primary} w-full sm:w-auto`}
              disabled={status === "loading"}
              onClick={() => void generateMoodBoard()}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
                  Building…
                </>
              ) : (
                <>
                  <ImageIcon className="mr-1.5 size-3.5" aria-hidden />
                  {lookEmpty ? "Build mood board" : "Rebuild mood board"}
                </>
              )}
            </Button>
            {!lookEmpty ? (
              <Button
                type="button"
                size="sm"
                className={`${proBtn.apply} w-full sm:w-auto`}
                title={`Copies palette, mood, lens, and lighting onto shot cards in ${shotsNavLabel}`}
                onClick={applyLookToShots}
              >
                Apply look to shots
              </Button>
            ) : null}
          </div>
        </div>

        <ProLoadingBar
          active={status === "loading"}
          label={status === "loading" ? "Building mood board…" : undefined}
        />

        {displayVisual ? (
          <MoodBoardGrid
            visual={displayVisual}
            referenceUrls={state.visualBible.referenceUrls}
            loading={moodBoardLoading}
            loadingSection={loadingSection}
            agentsEnabled={agentsEnabled}
            hasPhotoStills={state.visualBible.referenceUrls.some((u) => u.startsWith("data:image"))}
            onRegenerate={(sections, context) => void generateMoodBoard(sections, context)}
            onUploadClick={scrollToPhotos}
            onEditManual={openManualEdit}
          />
        ) : lookEmpty && !moodBoardLoading ? (
          <ProEmptyState
            icon={<Palette className="size-10" aria-hidden />}
            title="No mood board yet"
            description={
              hasPhotos
                ? "Photos uploaded — click Build mood board to generate your look tiles."
                : "Upload 2–6 reference stills, then build your mood board."
            }
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {!hasPhotos ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={proBtn.outline}
                    onClick={scrollToPhotos}
                  >
                    Upload photos
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  className={proBtn.primary}
                  disabled={moodBoardLoading}
                  onClick={() => void generateMoodBoard()}
                >
                  Build mood board
                </Button>
              </div>
            }
          />
        ) : null}

        {!lookEmpty ? <LookToolStrip state={state} updateState={updateState} onGoToKit={onGoToKit} /> : null}
      </section>
        </>
      ) : null}

      {lookTab === "check" ? (
        !lookEmpty && canApplyLook ? (
        <LookCheckSection
          state={state}
          status={consistencyLoading ? "running" : lookCheckStatus}
          issues={checkIssues.length > 0 ? checkIssues : heuristicIssues}
          agentsEnabled={agentsEnabled}
          onRunCheck={() => void runDeepConsistencyCheck()}
          onApplyToShots={applyLookToShots}
          onGoToPhotos={scrollToPhotos}
          onGoToPrep={onGoToPrep}
        />
        ) : (
          <ProEmptyState
            title={!lookEmpty ? "Add shots in Finish first" : "Build your mood board first"}
            description={
              !lookEmpty
                ? `Open ${shotsNavLabel} to generate a shot plan, then compare scenes to your look.`
                : "Upload photos and build a mood board before running a match check."
            }
            action={
              <Button
                type="button"
                size="sm"
                className={proBtn.primary}
                onClick={() => (lookEmpty ? goToMoodBoard() : onGoToShots?.())}
              >
                {lookEmpty ? "Go to mood board" : `Open ${shotsNavLabel}`}
              </Button>
            }
          />
        )
      ) : null}
    </div>
  );
}
