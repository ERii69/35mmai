"use client";

import { Check, FileUp } from "lucide-react";
import {
  LookSubTabsDesktop,
  LookSubTabsMobile,
  PostSubTabsMobile,
  PrepSubTabsMobile,
  ProduceSubTabsDesktop,
  ProduceSubTabsMobile,
} from "@/components/pro/ProWorkspaceSubTabsMobile";
import { proFocus, proNavPill, proNavPillDense, proNavScroll, proNavScrollFade } from "@/components/pro/ux/pro-surfaces";
import { usesScriptToPromptPipeline } from "@/lib/pro/workspace-pipeline";
import {
  prepSubTabsForPhase,
  scriptPhaseHint,
} from "@/lib/pro/unified-step-navigation";
import {
  UNIFIED_WORKSPACE_STEPS,
  unifiedActiveStep,
  unifiedStepStatuses,
  type UnifiedPipelineStep,
} from "@/lib/pro/workspace-step-progress";
import {
  POST_TABS,
  type LookTabId,
  type PostTabId,
  type PrepStepId,
  type ProductionTabId,
  type WorkspaceMode,
} from "@/lib/pro/workspace-modes";
import type { ProjectStatePayload } from "@/lib/pro/types";
import { useMdUp } from "@/lib/pro/use-md-up";
import type { ReactNode } from "react";

const navItem = "shrink-0 whitespace-nowrap touch-manipulation";

type SubTab = { id: string; label: string };

function WorkspaceSubTabRow({
  tabs,
  activeId,
  onSelect,
  ariaLabel,
}: {
  tabs: SubTab[];
  activeId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
}) {
  if (tabs.length === 0) return null;

  return (
    <div className="relative">
      <div className={proNavScroll} role="tablist" aria-label={ariaLabel}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeId === t.id}
            onClick={() => onSelect(t.id)}
            className={`${proNavPill(activeId === t.id)} ${navItem} !py-1.5 text-xs md:text-sm`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={proNavScrollFade} aria-hidden />
    </div>
  );
}

function PhaseStepper({
  activeStep,
  statuses,
  onSelect,
}: {
  activeStep: UnifiedPipelineStep;
  statuses: ReturnType<typeof unifiedStepStatuses>;
  onSelect: (step: UnifiedPipelineStep) => void;
}) {
  return (
    <div className="flex w-full items-start" role="tablist" aria-label="Project workflow">
      {UNIFIED_WORKSPACE_STEPS.map((step, index) => {
        const status = statuses[step.id];
        const active = activeStep === step.id;
        const complete = status === "complete";
        const suggested = status === "suggested";
        const prevComplete =
          index > 0 &&
          (statuses[UNIFIED_WORKSPACE_STEPS[index - 1]!.id] === "complete" ||
            UNIFIED_WORKSPACE_STEPS[index - 1]!.id === activeStep);
        const lineActive = prevComplete || active || complete;

        return (
          <div key={step.id} className="contents">
            {index > 0 ? (
              <div
                className={`h-px min-w-4 flex-1 self-center ${
                  lineActive ? "bg-pro-primary/45" : "bg-white/[0.12]"
                }`}
                aria-hidden
              />
            ) : null}
            <button
              type="button"
              role="tab"
              aria-selected={active}
              title={step.hint}
              onClick={() => onSelect(step.id)}
              className={`group relative flex min-h-11 min-w-11 shrink-0 flex-col items-center justify-center gap-0.5 px-1 touch-manipulation md:min-h-10 md:min-w-10 md:gap-1 md:px-2 ${proFocus}`}
            >
              <span
                className={`flex size-4 items-center justify-center rounded-full ring-2 transition md:size-6 ${
                  active
                    ? "bg-pro-primary ring-pro-primary/30"
                    : complete
                      ? "bg-pro-primary/20 ring-pro-primary/25"
                      : suggested
                        ? "animate-pulse bg-pro-primary/15 ring-pro-primary/40"
                        : "bg-pro-muted ring-white/[0.12] group-hover:ring-white/20"
                }`}
              >
                {complete && !active ? (
                  <Check className="size-2.5 text-pro-primary md:size-3.5" aria-hidden />
                ) : (
                  <span
                    className={`size-1.5 rounded-full md:size-2.5 ${
                      active ? "bg-white" : suggested ? "bg-pro-primary" : "bg-white/25"
                    }`}
                    aria-hidden
                  />
                )}
              </span>
              <span
                className={`text-[10px] font-medium leading-none md:text-xs ${
                  active
                    ? "text-pro-text"
                    : suggested
                      ? "text-pro-primary"
                      : complete
                        ? "text-pro-text-secondary"
                        : "text-pro-text-secondary/70"
                }`}
              >
                {step.label}
              </span>
              {suggested && !active ? (
                <span
                  className="absolute -right-0.5 top-0 size-2 rounded-full bg-pro-primary ring-2 ring-pro-base"
                  aria-hidden
                />
              ) : null}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ScriptPhaseSubNav({
  prepStep,
  prepTabs,
  hasScript,
  usesPipeline,
  onPrepStepChange,
  mdUp,
}: {
  prepStep: PrepStepId;
  prepTabs: { id: PrepStepId; label: string }[];
  hasScript: boolean;
  usesPipeline: boolean;
  onPrepStepChange: (step: PrepStepId) => void;
  /** When false, mount mobile only; when true, desktop only. null → mobile-first (SSR). */
  mdUp: boolean | null;
}) {
  const subTabs = prepSubTabsForPhase(prepTabs);
  const onScript = prepStep === "script";
  const scriptLabel = hasScript ? "Edit script" : "Upload script";
  const showMobile = mdUp !== true;
  const showDesktop = mdUp === true;

  return (
    <>
      {showMobile ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPrepStepChange("script")}
            className={`${proNavPillDense(onScript)} inline-flex shrink-0 items-center gap-1.5 touch-manipulation whitespace-nowrap`}
          >
            <FileUp className="size-3.5" aria-hidden />
            {scriptLabel}
          </button>
          <PrepSubTabsMobile
            prepStep={prepStep}
            prepTabs={subTabs}
            onPrepStepChange={onPrepStepChange}
            pipelineLayout={usesPipeline}
          />
        </div>
      ) : null}
      {showDesktop ? (
        <div className="relative">
          <div className={proNavScroll} role="tablist" aria-label="Script workflow">
            <button
              type="button"
              role="tab"
              aria-selected={onScript}
              onClick={() => onPrepStepChange("script")}
              className={`${proNavPill(onScript)} ${navItem} inline-flex items-center gap-1.5 !py-1.5 text-xs md:text-sm`}
            >
              <FileUp className="size-3.5" aria-hidden />
              {scriptLabel}
            </button>
            {subTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={prepStep === t.id}
                onClick={() => onPrepStepChange(t.id)}
                className={`${proNavPill(prepStep === t.id)} ${navItem} !py-1.5 text-xs md:text-sm`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className={proNavScrollFade} aria-hidden />
        </div>
      ) : null}
    </>
  );
}

type Props = {
  state: ProjectStatePayload;
  mode: WorkspaceMode;
  prepStep: PrepStepId;
  lookTab: LookTabId;
  productionTab: ProductionTabId;
  productionTabs: { id: ProductionTabId; label: string }[];
  prepTabs: { id: PrepStepId; label: string }[];
  lookTabs: { id: LookTabId; label: string }[];
  postTab?: PostTabId;
  onPostTabChange?: (tab: PostTabId) => void;
  onPhaseChange: (step: UnifiedPipelineStep) => void;
  onPrepStepChange: (step: PrepStepId) => void;
  onLookTabChange: (tab: LookTabId) => void;
  onProductionTabChange: (tab: ProductionTabId) => void;
  headerTrailing?: ReactNode;
};

export function ProWorkspacePhaseStepper({
  state,
  mode,
  prepStep,
  lookTab,
  productionTab,
  productionTabs,
  prepTabs,
  lookTabs,
  postTab = "pipeline",
  onPostTabChange,
  onPhaseChange,
  onPrepStepChange,
  onLookTabChange,
  onProductionTabChange,
  headerTrailing,
}: Props) {
  const usesPipeline = usesScriptToPromptPipeline(state);
  const activeStep = unifiedActiveStep(mode, state);
  const statuses = unifiedStepStatuses(state, mode, prepStep, lookTab, productionTab);
  const activeMeta = UNIFIED_WORKSPACE_STEPS.find((s) => s.id === activeStep);
  const hasScript = state.directorPrep.screenplay.rawText.trim().length > 0;
  const mdUp = useMdUp();
  const showMobileNav = mdUp !== true;
  const showDesktopNav = mdUp === true;

  return (
    <div className="space-y-1 md:space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <PhaseStepper activeStep={activeStep} statuses={statuses} onSelect={onPhaseChange} />
        </div>
        {headerTrailing ? <div className="shrink-0">{headerTrailing}</div> : null}
      </div>

      {activeStep === "script" ? (
        <p className="hidden text-[11px] leading-snug text-pro-text-secondary md:block md:text-xs">
          {scriptPhaseHint(prepStep, hasScript)}
        </p>
      ) : activeMeta ? (
        <p className="hidden text-[11px] leading-snug text-pro-text-secondary md:block md:text-xs">
          {activeMeta.hint}
        </p>
      ) : null}

      {activeStep === "script" ? (
        <ScriptPhaseSubNav
          prepStep={prepStep}
          prepTabs={prepTabs}
          hasScript={hasScript}
          usesPipeline={usesPipeline}
          onPrepStepChange={onPrepStepChange}
          mdUp={mdUp}
        />
      ) : null}

      {activeStep === "look" ? (
        <>
          {showMobileNav ? (
            <LookSubTabsMobile
              lookTab={lookTab}
              lookTabs={lookTabs}
              onLookTabChange={onLookTabChange}
            />
          ) : null}
          {showDesktopNav ? (
            <LookSubTabsDesktop
              lookTab={lookTab}
              lookTabs={lookTabs}
              onLookTabChange={onLookTabChange}
            />
          ) : null}
        </>
      ) : null}

      {activeStep === "finish" && mode === "production" ? (
        <>
          {showMobileNav ? (
            <ProduceSubTabsMobile
              productionTab={productionTab}
              productionTabs={productionTabs}
              pipelineLayout={usesPipeline}
              onProductionTabChange={onProductionTabChange}
            />
          ) : null}
          {showDesktopNav ? (
            <ProduceSubTabsDesktop
              productionTab={productionTab}
              productionTabs={productionTabs}
              pipelineLayout={usesPipeline}
              onProductionTabChange={onProductionTabChange}
            />
          ) : null}
        </>
      ) : null}

      {activeStep === "finish" && mode === "post" && onPostTabChange ? (
        <>
          {showMobileNav ? (
            <PostSubTabsMobile postTab={postTab} onPostTabChange={onPostTabChange} />
          ) : null}
          {showDesktopNav ? (
            <WorkspaceSubTabRow
              tabs={POST_TABS}
              activeId={postTab}
              onSelect={(id) => onPostTabChange(id as PostTabId)}
              ariaLabel="Post sections"
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
