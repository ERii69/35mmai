"use client";

import { useEffect, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseScriptToPromptShotLine } from "@/lib/pro/build-script-to-prompt-shots";
import { openPromptsCta, promptPackSummaryLine, promptsForSceneLabel } from "@/lib/pro/script-to-prompt-copy";
import { countPromptsInStaging } from "@/lib/pro/synthesize-visual-beats";
import { formatDisplayHeading } from "@/lib/pro/format-display-heading";
import { filterShotsForReview } from "@/lib/pro/staging-review-sync";
import {
  canCommitStaging,
  removeSceneConsequence,
  stagingReviewStats,
} from "@/lib/pro/staging-review-stats";
import type {
  AgentStagingBundle,
  AgentSuggestionStatus,
  StagedBudgetSuggestion,
  StagedCharacterSuggestion,
  StagedLocationSuggestion,
  StagedShotSequenceSuggestion,
  StagedVisualSuggestion,
} from "@/lib/pro/types";
import { LocationResearchCard } from "@/components/pro/LocationResearchCard";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import { KeepRemoveButtons } from "@/components/pro/ux/KeepRemoveButtons";

export type { PrepReviewTab } from "@/lib/pro/staging-review-stats";

type Props = {
  staging: AgentStagingBundle;
  reviewConfirmed: boolean;
  onReviewConfirmed: (v: boolean) => void;
  editingCommitted: boolean;
  onEditChoices: () => void;
  running: boolean;
  onSceneStatus: (suggestionId: string, status: AgentSuggestionStatus) => void;
  onLocationStatus: (suggestionId: string, status: AgentSuggestionStatus) => void;
  onPatchLocation: (suggestionId: string, patch: Partial<StagedLocationSuggestion>) => void;
  onShootSuggestionStatus: (
    locationId: string,
    shootId: string,
    status: AgentSuggestionStatus
  ) => void;
  onCharacterStatus: (suggestionId: string, status: AgentSuggestionStatus) => void;
  onShotStatus: (suggestionId: string, status: AgentSuggestionStatus) => void;
  onBudgetStatus: (status: AgentSuggestionStatus) => void;
  onVisualStatus: (status: AgentSuggestionStatus) => void;
  onKeepAll: () => void;
  onRemoveAll: () => void;
  onCommit: () => void;
  onQuickAdd?: () => void;
  quickAddBusy?: boolean;
  onOpenProduction?: () => void;
  onOpenPrompts?: () => void;
  onSkipReviewProduction?: () => void;
  onGoToExport?: () => void;
  onBackToGenerate?: () => void;
  onEditScript?: () => void;
  promptPack?: boolean;
};

export function PrepReviewPanel({
  staging,
  reviewConfirmed,
  onReviewConfirmed,
  editingCommitted,
  onEditChoices,
  running,
  onSceneStatus,
  onLocationStatus,
  onPatchLocation,
  onShootSuggestionStatus,
  onCharacterStatus,
  onShotStatus,
  onBudgetStatus,
  onVisualStatus,
  onKeepAll,
  onRemoveAll,
  onCommit,
  onQuickAdd,
  quickAddBusy = false,
  onOpenProduction,
  onOpenPrompts,
  onSkipReviewProduction,
  onGoToExport,
  onBackToGenerate,
  onEditScript,
  promptPack = false,
}: Props) {
  const [showItemReview, setShowItemReview] = useState(false);

  useEffect(() => {
    setShowItemReview(false);
  }, [staging.runId]);
  const committed = staging.status === "committed" && !editingCommitted;
  const editable = staging.status === "review" || editingCommitted;
  const promptPackFastPath = promptPack && !committed && editable && !showItemReview;
  const showPromptPackStickyBar =
    promptPack && onQuickAdd && !committed && editable && !showItemReview;
  const cardEditable = editable && !promptPackFastPath;
  const commitCheck = canCommitStaging(staging, { reviewConfirmed });
  const reviewStats = stagingReviewStats(staging);
  const characters = staging.characters ?? [];
  const promptCount = countPromptsInStaging(staging.shotSequences);
  const hasShots = staging.shotSequences.length > 0;
  const visibleShots = filterShotsForReview(staging);
  const { showToast } = useProToast();

  function handleCommitClick() {
    if (promptPack && onQuickAdd) {
      onQuickAdd();
      return;
    }
    if (!commitCheck.ok) {
      showToast({
        message: commitCheck.reason ?? "Finish Keep or Remove on each item first.",
        variant: "info",
      });
      return;
    }
    onCommit();
  }

  const promptPackSummary = promptPack
    ? promptPackSummaryLine({
        promptCount,
        sceneCount: reviewStats?.scenes.kept ?? staging.scenes.length,
        hasLook: Boolean(reviewStats?.look.kept ?? staging.visual),
        locationCount: reviewStats?.locations.kept ?? 0,
      })
    : "";

  const promptPackAddBar =
    promptPack && onQuickAdd && !committed && editable ? (
      <button
        type="button"
        disabled={quickAddBusy}
        className="h-11 w-full rounded-lg bg-pro-primary text-sm font-semibold text-white shadow-md shadow-pro-primary/15 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
        onClick={onQuickAdd}
      >
        {quickAddBusy ? "Adding…" : openPromptsCta(promptCount)}
      </button>
    ) : null;

  return (
    <section
      className={`space-y-4 ${showPromptPackStickyBar ? "pb-28 md:pb-4" : promptPack && onQuickAdd && !committed && editable ? "pb-28" : ""}`}
      aria-label="Review prep results"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-pro-text">
            {committed
              ? "Added to project"
              : promptPack
                ? "Review prompt prep"
                : "Keep or remove"}
          </h3>
          {!committed ? (
            <p className="mt-1 text-xs text-pro-text-secondary">
              {promptPack
                ? "Everything is kept automatically. One tap adds to your project and opens Prompts."
                : "Tap Keep or Remove on each item, then add below."}
            </p>
          ) : (
            <p className="mt-1 text-xs text-pro-text-secondary">Prep is in your project. Edit choices or run prep again.</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {committed ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/[0.12] bg-pro-elevated text-pro-text hover:bg-pro-elevated"
              onClick={onEditChoices}
            >
              Edit prep choices
            </Button>
          ) : null}
          {onBackToGenerate ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/[0.12] bg-pro-elevated text-pro-text hover:bg-pro-elevated"
              onClick={onBackToGenerate}
            >
              <RotateCcw className="mr-1.5 size-3.5" aria-hidden />
              Run prep again
            </Button>
          ) : null}
        </div>
      </div>

      {promptPackFastPath ? (
        <div className="flex flex-col gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-emerald-100">{promptPackSummary}</p>
            <p className="mt-0.5 text-xs text-emerald-100/70">
              Copy-ready lines from your script and look.
            </p>
            <button
              type="button"
              className="mt-1.5 text-xs font-medium text-pro-primary underline-offset-2 hover:underline"
              onClick={() => setShowItemReview(true)}
            >
              Review items individually
            </button>
          </div>
          <button
            type="button"
            disabled={quickAddBusy}
            className="h-10 shrink-0 rounded-lg bg-pro-primary px-5 text-sm font-semibold text-white shadow-md shadow-pro-primary/15 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70 sm:min-w-[9.5rem]"
            onClick={onQuickAdd}
          >
            {quickAddBusy ? "Adding…" : openPromptsCta(promptCount)}
          </button>
        </div>
      ) : null}

      {reviewStats && reviewStats.pendingTotal > 0 && !committed && !promptPack ? (
        <div className="rounded-xl bg-pro-warning/10 px-4 py-3 ring-1 ring-pro-warning/25">
          <p className="text-sm font-medium text-pro-warning">
            {reviewStats.pendingTotal} item{reviewStats.pendingTotal === 1 ? "" : "s"} still need Keep or Remove
          </p>
          <p className="mt-1 text-xs text-pro-warning/80">
            Cards turn green when kept. Then check Ready to add and tap Add to project at the bottom.
          </p>
          {promptPack ? (
            <p className="mt-1 text-xs text-pro-primary">
              Script to prompt: after add, open Finish → Prompts.
            </p>
          ) : null}
        </div>
      ) : null}

      {reviewStats && reviewStats.pendingTotal === 0 && !committed && editable && !promptPackFastPath ? (
        <div className="rounded-xl bg-emerald-500/10 px-4 py-3 ring-1 ring-emerald-500/25">
          <p className="text-sm font-medium text-emerald-100">
            {promptPack ? "Prompt prep ready" : "All items reviewed"}
          </p>
          <p className="mt-1 text-xs text-emerald-100/80">
            {promptPack
              ? "Tap Add to project & open Prompts above, or check Ready to add below."
              : "Check Ready to add below, then tap Add to project."}
          </p>
        </div>
      ) : null}

      {!promptPackFastPath ? (
      <div className="space-y-6">
        {staging.scenes.length > 0 ? (
          <section>
            <SectionHeader>Scenes</SectionHeader>
            <ul className="space-y-3">
              {staging.scenes.length > 0 ? (
                staging.scenes.map((s) => (
                  <ReviewCard
                    key={s.suggestionId}
                    title={formatReviewHeading(s.scene.heading || `Scene ${s.scene.number}`)}
                    subtitle={s.scene.oneLine}
                    badge={s.scene.number}
                    status={s.status}
                    removeHint={
                      cardEditable && s.status === "pending"
                        ? removeSceneConsequence(staging, s.scene.number)
                        : null
                    }
                    onKeep={cardEditable ? () => onSceneStatus(s.suggestionId, "approved") : undefined}
                    onRemove={
                      cardEditable ? () => onSceneStatus(s.suggestionId, "rejected") : undefined
                    }
                    onUndo={
                      cardEditable ? () => onSceneStatus(s.suggestionId, "pending") : undefined
                    }
                  />
                ))
              ) : (
                <EmptyTab message="No scenes in this run." />
              )}
            </ul>
          </section>
        ) : null}

        {characters.length > 0 ? (
          <section>
            <SectionHeader>Characters</SectionHeader>
            <ul className="space-y-3">
              {characters.map((char) => (
                <CharacterReviewCard
                  key={char.suggestionId}
                  character={char}
                  editable={cardEditable}
                  onKeep={() => onCharacterStatus(char.suggestionId, "approved")}
                  onRemove={() => onCharacterStatus(char.suggestionId, "rejected")}
                  onUndo={() => onCharacterStatus(char.suggestionId, "pending")}
                />
              ))}
            </ul>
          </section>
        ) : null}

        {staging.locations.length > 0 || staging.researchNotes.trim() ? (
          <section>
            <SectionHeader>{promptPack ? "Scene settings" : "Locations"}</SectionHeader>
            {promptPack ? (
              <p className="mb-3 text-xs text-pro-text-secondary">
                Settings pulled from scene headings. Keep the ones that belong in your look and
                prompt pack. No map scouting in this template.
              </p>
            ) : null}
            <ul className="space-y-3">
              {staging.locations.length > 0 ? (
                staging.locations.map((loc) => (
                  <LocationResearchCard
                    key={loc.suggestionId}
                    staging={staging}
                    location={loc}
                    promptPack={promptPack}
                    editable={cardEditable}
                    onKeep={() => onLocationStatus(loc.suggestionId, "approved")}
                    onRemove={() => onLocationStatus(loc.suggestionId, "rejected")}
                    onUndo={() => onLocationStatus(loc.suggestionId, "pending")}
                    onPatch={(patch) => onPatchLocation(loc.suggestionId, patch)}
                    onShootStatus={(shootId, status) =>
                      onShootSuggestionStatus(loc.suggestionId, shootId, status)
                    }
                  />
                ))
              ) : (
                <EmptyTab message={promptPack ? "No scene settings in this run." : "No locations in this run."} />
              )}
            </ul>
          </section>
        ) : null}

        {hasShots ? (
          <section>
            <SectionHeader>{promptPack ? "Visual beats" : "Shot lists"}</SectionHeader>
            {promptPack ? (
              <p className="mb-2 text-xs text-pro-text-secondary">
                {promptCount} copy-ready prompts across {staging.shotSequences.length} scene
                {staging.shotSequences.length === 1 ? "" : "s"} — opens in Finish → Prompts.
              </p>
            ) : null}
            {visibleShots.length < staging.shotSequences.length ? (
              <p className="mb-2 text-xs text-pro-text-secondary">Some lists hidden — linked scene or location removed.</p>
            ) : null}
            <ul className="space-y-3">
              {staging.shotSequences.length > 0 ? (
                staging.shotSequences.map((seq) => (
                  <ShotReviewCard
                    key={seq.suggestionId}
                    sequence={seq}
                    promptPack={promptPack}
                    editable={cardEditable}
                    hiddenByLink={
                      seq.status !== "rejected" &&
                      !visibleShots.some((v) => v.suggestionId === seq.suggestionId)
                    }
                    onKeep={() => onShotStatus(seq.suggestionId, "approved")}
                    onRemove={() => onShotStatus(seq.suggestionId, "rejected")}
                    onUndo={() => onShotStatus(seq.suggestionId, "pending")}
                  />
                ))
              ) : (
                <EmptyTab message={promptPack ? "No visual beats in this run." : "No shot lists in this run."} />
              )}
            </ul>
          </section>
        ) : null}

        {staging.budget ? (
          <section>
            <SectionHeader>Budget</SectionHeader>
            <BudgetReviewCard
              budget={staging.budget}
              editable={cardEditable}
              onKeep={() => onBudgetStatus("approved")}
              onRemove={() => onBudgetStatus("rejected")}
              onUndo={() => onBudgetStatus("pending")}
            />
          </section>
        ) : null}

        {staging.visual ? (
          <section>
            <SectionHeader>Look &amp; mood</SectionHeader>
            <VisualReviewCard
              visual={staging.visual}
              editable={cardEditable}
              onKeep={() => onVisualStatus("approved")}
              onRemove={() => onVisualStatus("rejected")}
              onUndo={() => onVisualStatus("pending")}
            />
          </section>
        ) : null}
      </div>
      ) : null}

      {showPromptPackStickyBar && promptPackAddBar ? (
        <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 border-t border-white/[0.08] bg-pro-base/95 px-4 py-2 backdrop-blur-md md:hidden">
          {promptPackAddBar}
        </div>
      ) : null}

      {!running && editable && !promptPackFastPath && !(promptPack && onQuickAdd) ? (
        <div className="space-y-4 border-t border-white/[0.08] pt-4">
          {commitCheck.reason && !commitCheck.ok ? (
            <div className="rounded-lg border border-pro-warning/25 bg-pro-warning/10 px-3 py-2">
              <p className="text-xs font-medium text-pro-warning">{commitCheck.reason}</p>
              <p className="mt-1 text-xs text-pro-text-secondary">
                Use <span className="text-pro-text">Keep all</span> below, or tap Keep / Remove on each
                card above.
              </p>
            </div>
          ) : null}

          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-pro-text-secondary">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-white/20 bg-pro-elevated accent-pro-primary"
              checked={reviewConfirmed}
              onChange={(e) => onReviewConfirmed(e.target.checked)}
            />
            <span>Ready to add to project</span>
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="h-9 rounded-lg border border-white/[0.1] bg-pro-elevated text-sm font-medium text-pro-text transition hover:bg-pro-elevated"
              onClick={onKeepAll}
            >
              Keep all
            </button>
            <button
              type="button"
              className="h-9 rounded-lg border border-white/[0.1] bg-pro-elevated text-sm font-medium text-pro-text-secondary transition hover:bg-pro-elevated hover:text-pro-text"
              onClick={onRemoveAll}
            >
              Remove all
            </button>
          </div>

          <button
            type="button"
            className={`h-11 w-full rounded-xl text-sm font-semibold transition ${
              commitCheck.ok
                ? "bg-pro-primary text-white shadow-lg shadow-pro-primary/20 hover:brightness-110"
                : "border border-white/[0.1] bg-pro-elevated text-pro-text-secondary hover:border-white/[0.12] hover:text-pro-text"
            }`}
            onClick={handleCommitClick}
          >
            {editingCommitted || staging.status === "committed"
              ? "Update project"
              : promptPack
                ? openPromptsCta(promptCount)
                : "Add to project"}
          </button>

          {onSkipReviewProduction ? (
            <button
              type="button"
              className="h-9 w-full rounded-lg text-sm text-pro-text-secondary underline-offset-2 transition hover:text-pro-text-secondary hover:underline"
              onClick={onSkipReviewProduction}
            >
              Skip review → {promptPack ? "Finish → Prompts" : "Finish"}
            </button>
          ) : null}
        </div>
      ) : null}

      {!running && committed ? (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.08] pt-4">
          {onGoToExport ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-white/[0.12] bg-transparent text-pro-text hover:bg-pro-elevated"
              onClick={onGoToExport}
            >
              Export
            </Button>
          ) : null}
          {(onOpenPrompts ?? onOpenProduction) ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-white/[0.12] bg-pro-elevated text-pro-text hover:bg-pro-elevated"
              onClick={onOpenPrompts ?? onOpenProduction}
            >
              {promptPack ? "Open Finish → Prompts" : "Open Finish"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function SectionHeader({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs font-medium text-pro-text-secondary">{children}</p>;
}

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-pro-muted/40 px-4 py-6 text-center text-sm text-pro-text-secondary ring-1 ring-white/[0.04]">
      {message}
    </div>
  );
}

function ReviewCard({
  title,
  subtitle,
  badge,
  status,
  removeHint,
  onKeep,
  onRemove,
  onUndo,
}: {
  title: string;
  subtitle?: string;
  badge?: number;
  status: AgentSuggestionStatus;
  removeHint?: string | null;
  onKeep?: () => void;
  onRemove?: () => void;
  onUndo?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const longSubtitle = (subtitle?.length ?? 0) > 160;
  const removed = status === "rejected";

  return (
    <li
      className={`rounded-xl px-4 py-4 text-sm ring-1 ${
        status === "approved"
          ? "bg-pro-elevated ring-emerald-600/25"
          : removed
            ? "bg-pro-muted/50 ring-white/[0.06]"
            : "bg-pro-elevated ring-white/[0.06]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            {badge != null ? (
              <span className="shrink-0 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-pro-text-secondary">
                {badge}
              </span>
            ) : null}
            <span
              className={`font-semibold text-pro-text ${removed ? "line-through decoration-pro-text-secondary opacity-60" : ""}`}
            >
              {title || "Untitled"}
            </span>
          </div>
          {subtitle ? (
            <>
              <p
                className={`mt-1.5 text-xs leading-relaxed text-pro-text-secondary ${
                  !expanded && longSubtitle ? "line-clamp-3" : ""
                }`}
              >
                {subtitle}
              </p>
              {longSubtitle ? (
                <button
                  type="button"
                  className="mt-1 text-[10px] font-medium uppercase tracking-wide text-pro-primary hover:underline"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? "Show less" : "Show full text"}
                </button>
              ) : null}
            </>
          ) : null}
          {removeHint ? (
            <p className="mt-1.5 text-[11px] text-pro-text-secondary/80">{removeHint}</p>
          ) : null}
        </div>
        {onKeep && onRemove ? (
          <KeepRemoveButtons
            status={status}
            onKeep={onKeep}
            onRemove={onRemove}
            onUndo={onUndo}
          />
        ) : null}
      </div>
    </li>
  );
}

function CharacterReviewCard({
  character,
  editable,
  onKeep,
  onRemove,
  onUndo,
}: {
  character: StagedCharacterSuggestion;
  editable: boolean;
  onKeep: () => void;
  onRemove: () => void;
  onUndo: () => void;
}) {
  return (
    <ReviewCard
      title={character.name}
      subtitle={character.notes || "Speaking role from script"}
      status={character.status}
      onKeep={editable ? onKeep : undefined}
      onRemove={editable ? onRemove : undefined}
      onUndo={editable ? onUndo : undefined}
    />
  );
}

function ShotReviewCard({
  sequence,
  promptPack = false,
  editable,
  hiddenByLink,
  onKeep,
  onRemove,
  onUndo,
}: {
  sequence: StagedShotSequenceSuggestion;
  promptPack?: boolean;
  editable: boolean;
  hiddenByLink?: boolean;
  onKeep: () => void;
  onRemove: () => void;
  onUndo: () => void;
}) {
  const removed = sequence.status === "rejected";
  const promptLines = promptPack
    ? sequence.notes
        .split("\n")
        .map((line) => parseScriptToPromptShotLine(line))
        .filter((line) => !line.skip && line.label.trim())
    : [];

  if (hiddenByLink && !removed) {
    return (
      <li className="rounded-xl bg-pro-muted/30 px-4 py-3 text-xs text-pro-text-secondary ring-1 ring-white/[0.04]">
        <span className="line-through opacity-70">{formatReviewHeading(sequence.title)}</span>
        <span className="ml-2">hidden (scene or location removed)</span>
      </li>
    );
  }

  return (
    <li
      className={`rounded-xl px-4 py-4 text-sm ring-1 ${
        sequence.status === "approved"
          ? "bg-pro-elevated ring-emerald-600/25"
          : removed
            ? "bg-pro-muted/50 ring-white/[0.06]"
            : "bg-pro-elevated ring-white/[0.06]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            {sequence.sceneNumber != null ? (
              <span className="shrink-0 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-pro-text-secondary">
                {sequence.sceneNumber}
              </span>
            ) : null}
            <span
              className={`font-semibold text-pro-text ${removed ? "line-through decoration-pro-text-secondary opacity-60" : ""}`}
            >
              {promptPack && sequence.sceneNumber != null
                ? promptsForSceneLabel(sequence.sceneNumber)
                : formatReviewHeading(sequence.title)}
            </span>
          </div>
          {promptPack && promptLines.length > 0 ? (
            <div
              className={`mt-2 max-h-64 space-y-3 overflow-auto ${removed ? "opacity-50" : ""}`}
            >
              {promptLines.map((line, i) => (
                <div key={i} className={i > 0 ? "border-t border-white/[0.06] pt-3" : undefined}>
                  {line.shotType ? (
                    <span className="mb-1 inline-block rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-pro-primary">
                      {line.shotType.replace(/_/g, " ")}
                    </span>
                  ) : null}
                  <p className="text-xs leading-relaxed text-pro-text">{line.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <pre
              className={`mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-pro-text-secondary ${removed ? "opacity-50" : ""}`}
            >
              {sequence.notes}
            </pre>
          )}
        </div>
        {editable ? (
          <KeepRemoveButtons
            status={sequence.status}
            onKeep={onKeep}
            onRemove={onRemove}
            onUndo={onUndo}
          />
        ) : null}
      </div>
    </li>
  );
}

function BudgetReviewCard({
  budget,
  editable,
  onKeep,
  onRemove,
  onUndo,
}: {
  budget: StagedBudgetSuggestion;
  editable: boolean;
  onKeep: () => void;
  onRemove: () => void;
  onUndo: () => void;
}) {
  const removed = budget.status === "rejected";

  return (
    <li
      className={`rounded-xl px-4 py-4 text-sm ring-1 ${
        budget.status === "approved"
          ? "bg-pro-elevated ring-emerald-600/25"
          : removed
            ? "bg-pro-muted/50 ring-white/[0.06]"
            : "bg-pro-elevated ring-white/[0.06]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`min-w-0 flex-1 ${removed ? "opacity-60" : ""}`}>
          <p
            className={`font-semibold text-pro-text ${removed ? "line-through decoration-pro-text-secondary" : ""}`}
          >
            {budget.tier.charAt(0).toUpperCase()}
            {budget.tier.slice(1)} tier budget
          </p>
          <div className="mt-2 max-w-none text-xs leading-relaxed text-pro-text-secondary">
            {budget.summary.split("\n").map((line, i) => (
              <p key={i} className={line.startsWith("- ") ? "ml-2" : "mt-1 first:mt-0"}>
                {line.replace(/\*\*/g, "")}
              </p>
            ))}
          </div>
        </div>
        {editable ? (
          <KeepRemoveButtons
            status={budget.status}
            onKeep={onKeep}
            onRemove={onRemove}
            onUndo={onUndo}
          />
        ) : null}
      </div>
    </li>
  );
}

function VisualReviewCard({
  visual,
  editable,
  onKeep,
  onRemove,
  onUndo,
}: {
  visual: StagedVisualSuggestion;
  editable: boolean;
  onKeep: () => void;
  onRemove: () => void;
  onUndo: () => void;
}) {
  const removed = visual.status === "rejected";
  const notes = visual.designNotes?.trim() ?? "";
  const notesLong = notes.length > 140 || notes.includes("\n");

  return (
    <li
      className={`rounded-xl px-3 py-3 text-sm ring-1 ${
        visual.status === "approved"
          ? "bg-pro-elevated ring-emerald-600/25"
          : removed
            ? "bg-pro-muted/50 ring-white/[0.06]"
            : "bg-pro-elevated ring-white/[0.06]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`min-w-0 flex-1 space-y-2 ${removed ? "opacity-60" : ""}`}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p
              className={`text-sm font-semibold text-pro-text ${removed ? "line-through decoration-pro-text-secondary" : ""}`}
            >
              Look &amp; mood
            </p>
            {visual.mood ? (
              <span className="inline-block max-w-full truncate rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-pro-text-secondary">
                {visual.mood}
              </span>
            ) : null}
            {visual.palette.length > 0 ? (
              <div className="inline-flex flex-wrap items-center gap-1">
                {visual.palette.map((hex) => (
                  <span
                    key={hex}
                    className="inline-block size-4 rounded ring-1 ring-white/20"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            ) : null}
          </div>
          {(visual.lensAndFraming || visual.lightingApproach) && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-pro-text-secondary">
              {visual.lensAndFraming ? (
                <span>
                  <span className="font-medium text-pro-text">Lens</span> {visual.lensAndFraming}
                </span>
              ) : null}
              {visual.lightingApproach ? (
                <span>
                  <span className="font-medium text-pro-text">Light</span> {visual.lightingApproach}
                </span>
              ) : null}
            </div>
          )}
          {notes ? (
            notesLong ? (
              <details className="group rounded-lg bg-white/[0.03] ring-1 ring-white/[0.06]">
                <summary className="cursor-pointer list-none px-2.5 py-1.5 text-xs font-medium text-pro-text-secondary marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="group-open:hidden">Design notes · expand</span>
                  <span className="hidden group-open:inline">Design notes</span>
                </summary>
                <p className="max-h-40 overflow-y-auto whitespace-pre-wrap px-2.5 pb-2 text-xs leading-relaxed text-pro-text-secondary">
                  {notes}
                </p>
              </details>
            ) : (
              <p className="text-xs leading-relaxed text-pro-text-secondary">{notes}</p>
            )
          ) : null}
        </div>
        {editable ? (
          <KeepRemoveButtons
            status={visual.status}
            onKeep={onKeep}
            onRemove={onRemove}
            onUndo={onUndo}
          />
        ) : null}
      </div>
    </li>
  );
}

function formatReviewHeading(raw: string): string {
  return raw
    .replace(/\s*[—–]\s*/g, " · ")
    .replace(/\s+-\s+/g, " · ")
    .replace(/\s+/g, " ")
    .trim();
}

