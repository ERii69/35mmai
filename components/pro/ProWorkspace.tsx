"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveProjectState } from "@/app/actions/pro/project-state";
import { ProExportPanel } from "@/components/pro/ProExportPanel";
import { BudgetPanel } from "@/components/pro/BudgetPanel";
import { KitPanel } from "@/components/pro/KitPanel";
import { FinishPanel } from "@/components/pro/FinishPanel";
import { PostPanel } from "@/components/pro/PostPanel";
import { PromptsPanel } from "@/components/pro/PromptsPanel";
import { WorkflowPanel } from "@/components/pro/WorkflowPanel";
import { DirectorPrepPanel, ProPrepAdvancedButton } from "@/components/pro/DirectorPrepPanel";
import { ReferenceLibrary } from "@/components/pro/ReferenceLibrary";
import { ShotsPanel } from "@/components/pro/ShotsPanel";
import { WorldPanel } from "@/components/pro/WorldPanel";
import { VisualLookTools } from "@/components/pro/VisualLookTools";
import { VisualBibleDetailsPanel } from "@/components/pro/VisualBibleDetailsPanel";
import { ProSaveSizeBanner } from "@/components/pro/ProSaveSizeBanner";
import { ProWorkspaceSaveBar } from "@/components/pro/ProWorkspaceHeader";
import { ProWorkspaceKitDock } from "@/components/pro/ProWorkspaceKitDock";
import { ProWorkspacePhaseStepper } from "@/components/pro/ProWorkspacePhaseStepper";
import { ProductionPrepBanner } from "@/components/pro/ProductionPrepBanner";
import { ProWorkflowControl } from "@/components/pro/ProWorkflowControl";
import { ProWorkflowHub } from "@/components/pro/ProWorkflowHub";
import { WorkspaceMilestoneHints } from "@/components/pro/WorkspaceMilestoneHints";
import { useProAppNav } from "@/components/pro/ProAppNavContext";
import { PRO_OPEN_WORKFLOW_SWITCHER_EVENT } from "@/lib/pro/pro-nav-events";
import { workflowDisplayName } from "@/lib/pro/workflow-choices";
import { resolveUnifiedStepNavigation } from "@/lib/pro/unified-step-navigation";
import type { UnifiedPipelineStep } from "@/lib/pro/workspace-step-progress";
import { migrateShotPlanLegacy } from "@/lib/pro/migrate-shot-plan-legacy";
import { prepareProjectStateForCloudSave } from "@/lib/pro/slim-project-state";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import {
  DEFAULT_POST_TAB,
  defaultProductionTabForState,
  LOOK_TABS,
  normalizePrepStepId,
  POST_TABS,
  prepTabsForState,
  productionTabsForState,
  PRODUCTION_TABS,
  resolveWorkspaceNavigation,
  type LookTabId,
  type PostTabId,
  type PrepStepId,
  type WorkspaceMode,
  type ProductionTabId,
} from "@/lib/pro/workspace-modes";
import {
  lookTabsForState,
  usesScriptToPromptPipeline,
} from "@/lib/pro/workspace-pipeline";
import type { WorkspaceTabId } from "@/lib/pro/playbook-steps";
import type { ProjectStatePayload } from "@/lib/pro/types";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type Props = {
  projectId: string;
  projectName: string;
  initialState: ProjectStatePayload;
  initialUpdatedAt: string;
  claudeAgentsEnabled: boolean;
  openWorkflowInitially?: boolean;
};

/** v1 conflict policy: last-write-wins on each save (no merge). */
export function ProWorkspace({
  projectId,
  projectName,
  initialState,
  initialUpdatedAt,
  claudeAgentsEnabled,
  openWorkflowInitially = false,
}: Props) {
  const { setWorkflowLabel } = useProAppNav();
  const [state, setState] = useState<ProjectStatePayload>(() => migrateShotPlanLegacy(initialState));
  const [mode, setMode] = useState<WorkspaceMode>("prep");
  const [prepStep, setPrepStep] = useState<PrepStepId>("script");
  const [lookTab, setLookTab] = useState<LookTabId>("photos");
  const [prepInReview, setPrepInReview] = useState(false);
  const [productionTab, setProductionTab] = useState<ProductionTabId>(() =>
    defaultProductionTabForState(initialState)
  );
  const [postTab, setPostTab] = useState<PostTabId>(DEFAULT_POST_TAB);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(openWorkflowInitially);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState(initialUpdatedAt);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  const skipNextAutosaveRef = useRef(true);
  const persistGenerationRef = useRef(0);
  const panelRef = useRef<HTMLElement>(null);
  const workspaceChromeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const syncFromLocationHash = useCallback(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    if (hash === "templates-exports" || hash === "production-export") {
      setMode("production");
      setProductionTab("export");
      return;
    }
    if (hash.startsWith("prep-")) {
      const step = normalizePrepStepId(hash.slice("prep-".length));
      if (step) {
        setMode("prep");
        setPrepStep(step);
      }
      return;
    }
    if (hash.startsWith("look-")) {
      const tab = hash.slice("look-".length) as LookTabId;
      if (LOOK_TABS.some((t) => t.id === tab)) {
        setMode("look");
        setLookTab(tab);
      }
      return;
    }
    if (hash === "production-post") {
      setMode("post");
      setPostTab(DEFAULT_POST_TAB);
      return;
    }
    if (hash.startsWith("post-")) {
      const tab = hash.slice("post-".length) as PostTabId;
      if (POST_TABS.some((t) => t.id === tab)) {
        setMode("post");
        setPostTab(tab);
      }
      return;
    }
    if (hash === "prep" || hash === "look" || hash === "production" || hash === "post") {
      setMode(hash as WorkspaceMode);
      if (hash === "post") setPostTab(DEFAULT_POST_TAB);
      return;
    }
    if (!hash.startsWith("production-")) return;
    const tab = hash.slice("production-".length) as ProductionTabId;
    if (PRODUCTION_TABS.some((t) => t.id === tab)) {
      setMode("production");
      setProductionTab(tab);
    }
  }, []);

  useEffect(() => {
    syncFromLocationHash();
    const onHashChange = () => syncFromLocationHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [syncFromLocationHash]);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash !== "templates-exports" && hash !== "production-export") return;
    if (mode !== "production" || productionTab !== "export") return;
    window.requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [mode, productionTab]);

  const goToProductionTab = useCallback((tab: ProductionTabId) => {
    setMode("production");
    setProductionTab(tab);
    window.location.hash = `production-${tab}`;
  }, []);

  const scrollPanelOnMobile = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      window.requestAnimationFrame(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  const goToPrepStep = useCallback(
    (step: PrepStepId) => {
      setMode("prep");
      setPrepStep(step);
      window.location.hash = `prep-${step}`;
      scrollPanelOnMobile();
    },
    [scrollPanelOnMobile]
  );

  const goToLookTab = useCallback(
    (tab: LookTabId) => {
      setMode("look");
      setLookTab(tab);
      window.location.hash = `look-${tab}`;
      scrollPanelOnMobile();
    },
    [scrollPanelOnMobile]
  );

  const handlePhaseChange = useCallback(
    (step: UnifiedPipelineStep) => {
      const nav = resolveUnifiedStepNavigation(step, state);
      setMode(nav.mode);
      if (nav.prepStep) {
        setPrepStep(nav.prepStep);
        window.location.hash = `prep-${nav.prepStep}`;
      } else if (nav.lookTab) {
        setLookTab(nav.lookTab);
        window.location.hash = `look-${nav.lookTab}`;
      } else if (nav.productionTab) {
        setProductionTab(nav.productionTab);
        window.location.hash = `production-${nav.productionTab}`;
      }
      scrollPanelOnMobile();
    },
    [state, scrollPanelOnMobile]
  );

  useEffect(() => {
    function openWorkflow() {
      setWorkflowOpen(true);
    }
    window.addEventListener(PRO_OPEN_WORKFLOW_SWITCHER_EVENT, openWorkflow);
    return () => window.removeEventListener(PRO_OPEN_WORKFLOW_SWITCHER_EVENT, openWorkflow);
  }, []);

  useEffect(() => {
    const label = workflowDisplayName(state.directorPrep.appliedTemplateId);
    setWorkflowLabel(label);
    return () => setWorkflowLabel(null);
  }, [state.directorPrep.appliedTemplateId, setWorkflowLabel]);

  /** Keep Prompts sticky bar flush under the live workspace chrome height. */
  useEffect(() => {
    const el = workspaceChromeRef.current;
    if (!el) return;
    const host =
      (el.closest("[style*='--pro-app-header-height']") as HTMLElement | null) ??
      document.documentElement;

    function publish() {
      const node = workspaceChromeRef.current;
      if (!node) return;
      host.style.setProperty("--pro-workspace-chrome-height", `${node.offsetHeight}px`);
    }

    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
      host.style.removeProperty("--pro-workspace-chrome-height");
    };
  }, [mode, prepStep, lookTab, productionTab, postTab, state.directorPrep.appliedTemplateId]);

  const goToPost = useCallback(
    (tab: PostTabId = DEFAULT_POST_TAB) => {
      setMode("post");
      setPostTab(tab);
      window.location.hash = `post-${tab}`;
      scrollPanelOnMobile();
    },
    [scrollPanelOnMobile]
  );

  const goToPostTab = useCallback(
    (tab: PostTabId) => {
      setMode("post");
      setPostTab(tab);
      window.location.hash = `post-${tab}`;
      scrollPanelOnMobile();
    },
    [scrollPanelOnMobile]
  );

  const navigateNextStep = useCallback(
    (
      nextMode: WorkspaceMode,
      opts?: {
        productionTab?: ProductionTabId;
        prepStep?: PrepStepId;
        lookTab?: LookTabId;
      }
    ) => {
      if (nextMode === "prep" && opts?.prepStep) {
        goToPrepStep(opts.prepStep);
        return;
      }
      if (nextMode === "look" && opts?.lookTab) {
        goToLookTab(opts.lookTab);
        return;
      }
      if (nextMode === "production" && opts?.productionTab) {
        goToProductionTab(opts.productionTab);
        return;
      }
      if (nextMode === "post") {
        goToPostTab(DEFAULT_POST_TAB);
      }
    },
    [goToPrepStep, goToLookTab, goToProductionTab, goToPostTab]
  );

  const goToExportTab = useCallback(() => {
    setMode("production");
    setProductionTab("export");
    window.location.hash = "production-export";
    scrollPanelOnMobile();
  }, [scrollPanelOnMobile]);

  const goToTab = useCallback((nextTab: WorkspaceTabId, stepId?: string) => {
    const nav = resolveWorkspaceNavigation(nextTab);
    setMode(nav.mode);
    if (nav.prepStep) setPrepStep(nav.prepStep);
    if (nav.lookTab) setLookTab(nav.lookTab);
    if (nav.productionTab) {
      setProductionTab(nav.productionTab);
      window.location.hash = `production-${nav.productionTab}`;
    } else if (nav.prepStep) {
      window.location.hash = `prep-${nav.prepStep}`;
    } else if (nav.lookTab) {
      window.location.hash = `look-${nav.lookTab}`;
    } else {
      window.location.hash = nav.mode;
    }
    window.setTimeout(() => {
      const stepEl = stepId ? document.getElementById(`playbook-step-${stepId}`) : null;
      if (stepEl) {
        stepEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  }, []);

  const persist = useCallback(async (scheduledGeneration: number) => {
    if (scheduledGeneration !== persistGenerationRef.current) return;

    setSaveStatus("saving");
    setSaveError(null);
    let slimmed = stateRef.current;
    try {
      slimmed = await prepareProjectStateForCloudSave(stateRef.current);
    } catch {
      /* save with best-effort slim; server validates size */
    }
    if (scheduledGeneration !== persistGenerationRef.current) return;

    const res = await saveProjectState(projectId, slimmed);
    if (!res.ok) {
      setSaveStatus("error");
      setSaveError(res.error);
      return;
    }
    if (scheduledGeneration !== persistGenerationRef.current) return;

    skipNextAutosaveRef.current = true;
    stateRef.current = slimmed;
    setState(slimmed);
    setSaveStatus("saved");
    setLastSavedAt(res.data.updated_at);
  }, [projectId]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return;
    }
    persistGenerationRef.current += 1;
    const scheduledGeneration = persistGenerationRef.current;
    setSaveStatus("idle");
    debounceRef.current = setTimeout(() => {
      void persist(scheduledGeneration);
    }, 1500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [state, persist]);

  function updateState(patch: (prev: ProjectStatePayload) => ProjectStatePayload) {
    setState((prev) => patch(prev));
  }

  function handleTemplateApplied(next: ProjectStatePayload, updatedAt: string) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    persistGenerationRef.current += 1;
    skipNextAutosaveRef.current = true;
    const merged = migrateShotPlanLegacy(next);
    stateRef.current = merged;
    setState(merged);
    setLastSavedAt(updatedAt);
    setSaveStatus("saved");
    setSaveError(null);
  }

  const saveLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? `Saved`
        : saveStatus === "error"
          ? "Save failed"
          : "Unsaved changes";

  const openKitTab = useCallback(() => goToProductionTab("kit"), [goToProductionTab]);

  const visibleProductionTabs = productionTabsForState(state);
  const visiblePrepTabs = prepTabsForState(state);
  const visibleLookTabs = lookTabsForState(state, LOOK_TABS);
  const usesPipeline = usesScriptToPromptPipeline(state);

  useEffect(() => {
    if (visibleProductionTabs.some((t) => t.id === productionTab)) return;
    goToProductionTab(defaultProductionTabForState(state));
  }, [visibleProductionTabs, productionTab, state, goToProductionTab]);

  useEffect(() => {
    if (mode !== "prep") return;
    if (visiblePrepTabs.some((t) => t.id === prepStep)) return;
    goToPrepStep("script");
  }, [visiblePrepTabs, prepStep, mode, goToPrepStep]);

  useEffect(() => {
    if (mode !== "look") return;
    if (visibleLookTabs.some((t) => t.id === lookTab)) return;
    goToLookTab(visibleLookTabs[0]?.id ?? "photos");
  }, [visibleLookTabs, lookTab, mode, goToLookTab]);

  const prepGenerateMobile = mode === "prep" && prepStep === "generate" && !prepInReview;
  const shotsMobileBar = mode === "production" && productionTab === "shots";
  const hideKitDockMobile =
    usesPipeline || prepGenerateMobile || prepInReview || shotsMobileBar;

  const hasMobileActionDock = prepGenerateMobile || shotsMobileBar || prepInReview;
  const hasKitFabMobile = !hideKitDockMobile;
  /** Only reserve bottom space when a real dock/FAB is on screen — avoid empty padding. */
  const contentPadding = hasMobileActionDock
    ? "pb-[calc(11rem+env(safe-area-inset-bottom))] md:pb-0"
    : hasKitFabMobile
      ? "pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0"
      : "pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0";

  return (
    <div
      className={`space-y-3 md:space-y-3 md:pb-0 ${usesPipeline ? "" : "md:pr-[calc(18rem+1rem)] lg:pr-[calc(20rem+1rem)]"} ${contentPadding}`}
    >
      <div
        ref={workspaceChromeRef}
        className="sticky top-[var(--pro-app-header-height,calc(3.25rem+env(safe-area-inset-top)))] z-30 -mx-4 border-b border-white/[0.06] bg-pro-base/95 px-4 pb-1 backdrop-blur-md sm:mx-0 sm:px-0 md:pb-2"
      >
        <ProWorkspacePhaseStepper
          state={state}
          mode={mode}
          prepStep={prepStep}
          lookTab={lookTab}
          productionTab={productionTab}
          productionTabs={visibleProductionTabs}
          prepTabs={visiblePrepTabs}
          lookTabs={visibleLookTabs}
          postTab={postTab}
          onPostTabChange={goToPostTab}
          onPhaseChange={handlePhaseChange}
          onPrepStepChange={goToPrepStep}
          onLookTabChange={goToLookTab}
          onProductionTabChange={goToProductionTab}
          headerTrailing={
            <div className="flex items-center gap-1">
              <ProWorkflowControl
                appliedTemplateId={state.directorPrep.appliedTemplateId}
                onOpen={() => setWorkflowOpen(true)}
                className="shrink-0"
              />
              {mode === "prep" ? (
                <ProPrepAdvancedButton onClick={() => setAdvancedOpen(true)} />
              ) : null}
              <div className="md:hidden">
                <ProWorkspaceSaveBar
                  iconOnly
                  saveStatus={saveStatus}
                  saveLabel={saveLabel}
                  saveError={saveError}
                  lastSavedAt={lastSavedAt}
                  onSaveNow={() => void persist(persistGenerationRef.current)}
                />
              </div>
              <div className="hidden md:block">
                <ProWorkspaceSaveBar
                  saveStatus={saveStatus}
                  saveLabel={saveLabel}
                  saveError={saveError}
                  lastSavedAt={lastSavedAt}
                  onSaveNow={() => void persist(persistGenerationRef.current)}
                />
              </div>
            </div>
          }
        />
      </div>

      {saveError ? (
        <ProSaveSizeBanner
          message={saveError}
          state={state}
          onDismiss={() => {
            setSaveError(null);
            setSaveStatus("idle");
          }}
          onAddToProject={() => goToPrepStep("generate")}
          onSaveNow={() => void persist(persistGenerationRef.current)}
        />
      ) : null}

      <WorkspaceMilestoneHints
        projectId={projectId}
        state={state}
        mode={mode}
        prepStep={prepStep}
        lookTab={lookTab}
        productionTab={productionTab}
        onNavigate={navigateNextStep}
      />

      <ProWorkflowHub
        projectId={projectId}
        state={state}
        onApplied={handleTemplateApplied}
        open={workflowOpen}
        onOpenChange={setWorkflowOpen}
        hideTrigger
      />

      <ProWorkspaceKitDock
        state={state}
        updateState={updateState}
        onOpenFullKit={openKitTab}
        hideDesktop={usesPipeline}
        hideMobileFab={hideKitDockMobile}
      />

      <section
        ref={panelRef}
        id="workspace-panel"
        className={`scroll-mt-[calc(var(--pro-app-header-height,3.25rem)+var(--pro-workspace-chrome-height,5.5rem)+0.5rem)] rounded-2xl ${proSurface.sectionMuted} p-3 sm:p-6 md:p-6`}
      >
        <div>
        {mode === "prep" ? (
          <DirectorPrepPanel
            projectId={projectId}
            projectName={projectName}
            state={state}
            claudeAgentsEnabled={claudeAgentsEnabled}
            updateState={updateState}
            onTemplateApplied={handleTemplateApplied}
            onGoToTab={goToTab}
            prepStep={prepStep}
            onPrepStepChange={goToPrepStep}
            onReviewPhaseChange={setPrepInReview}
            onOpenProduction={() => {
              setMode("production");
              goToProductionTab(usesPipeline ? "prompts" : "shots");
              window.setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
            }}
            onOpenPrompts={() => {
              goToProductionTab("prompts");
              window.setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
            }}
            onGoToExport={goToExportTab}
            onGoToLook={() => {
              setMode("look");
              goToLookTab("photos");
            }}
            onSkipNextAutosave={() => {
              skipNextAutosaveRef.current = true;
            }}
            onGoToPost={() => goToPost()}
            usesPipeline={usesPipeline}
            advancedOpen={advancedOpen}
            onAdvancedOpenChange={setAdvancedOpen}
            onOpenWorkflow={() => setWorkflowOpen(true)}
          />
        ) : null}
        {mode === "look" ? (
          <div className="space-y-6">
            <VisualPanel
              projectId={projectId}
              state={state}
              updateState={updateState}
              claudeAgentsEnabled={claudeAgentsEnabled}
              lookTab={lookTab}
              onGoToPrep={() => goToPrepStep("script")}
              onGoToLookTab={goToLookTab}
              onGoToKit={() => goToProductionTab("kit")}
              onGoToShots={() => goToProductionTab("shots")}
            />
          </div>
        ) : null}
        {mode === "production" && productionTab === "prompts" ? (
          <PromptsPanel
            projectId={projectId}
            projectName={projectName}
            state={state}
            updateState={updateState}
            onGoToTab={goToProductionTab}
            onGoToPrepGenerate={() => {
              handlePhaseChange("script");
              goToPrepStep("generate");
            }}
          />
        ) : null}
        {mode === "production" && productionTab === "world" ? (
          <WorldPanel
            projectId={projectId}
            state={state}
            agentsEnabled={claudeAgentsEnabled}
            updateState={updateState}
            onGoToScript={() => goToPrepStep("script")}
          />
        ) : null}
        {mode === "production" && productionTab === "shots" ? (
          <div className="space-y-4">
            <ShotsPanel
              projectId={projectId}
              state={state}
              updateState={updateState}
              agentsEnabled={claudeAgentsEnabled}
              onPersist={() => persist(persistGenerationRef.current)}
              onGoToTab={goToProductionTab}
            />
          </div>
        ) : null}
        {mode === "production" && productionTab === "kit" ? (
          <div className="space-y-4">
            <ProductionPrepBanner state={state} updateState={updateState} />
            <KitPanel state={state} updateState={updateState} />
          </div>
        ) : null}
        {mode === "production" && productionTab === "workflow" ? (
          <WorkflowPanel
            state={state}
            updateState={updateState}
            onGoToKitTab={() => goToProductionTab("kit")}
            onGoToPost={() => goToPost()}
          />
        ) : null}
        {mode === "production" && productionTab === "finish" ? (
          <FinishPanel
            state={state}
            updateState={updateState}
            onGoToExport={() => goToProductionTab("export")}
          />
        ) : null}
        {mode === "production" && productionTab === "budget" ? (
          <div className="space-y-4">
            <ProductionPrepBanner state={state} updateState={updateState} />
            <BudgetPanel state={state} updateState={updateState} />
          </div>
        ) : null}
        {mode === "post" ? (
          <PostPanel
            state={state}
            postTab={postTab}
            updateState={updateState}
            onGoToLook={() => goToLookTab("mood-board")}
            onGoToPostKitTab={() => goToPostTab("kit")}
          />
        ) : null}
        {mode === "production" && productionTab === "export" ? (
          <ProExportPanel
            projectId={projectId}
            projectName={projectName}
            state={state}
            saveStatus={saveStatus}
            onSaveNow={() => void persist(persistGenerationRef.current)}
          />
        ) : null}
        </div>
      </section>
    </div>
  );
}

function VisualPanel({
  projectId,
  state,
  updateState,
  claudeAgentsEnabled,
  lookTab,
  onGoToPrep,
  onGoToLookTab,
  onGoToKit,
  onGoToShots,
}: {
  projectId: string;
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  claudeAgentsEnabled: boolean;
  lookTab: LookTabId;
  onGoToPrep?: () => void;
  onGoToLookTab: (tab: LookTabId) => void;
  onGoToKit?: () => void;
  onGoToShots?: () => void;
}) {
  const vb = state.visualBible;

  if (lookTab === "photos") {
    return (
      <ReferenceLibrary
        id="reference-photos"
        projectId={projectId}
        state={state}
        updateState={updateState}
        agentsEnabled={claudeAgentsEnabled}
      />
    );
  }

  if (lookTab === "details") {
    return (
      <VisualBibleDetailsPanel
        visualBible={vb}
        onPatch={(fn) =>
          updateState((p) => ({ ...p, visualBible: fn(p.visualBible) }))
        }
      />
    );
  }

  return (
    <VisualLookTools
      projectId={projectId}
      state={state}
      updateState={updateState}
      agentsEnabled={claudeAgentsEnabled}
      lookTab={lookTab}
      onEditManual={() => onGoToLookTab("details")}
      onGoToPrep={onGoToPrep}
      onGoToKit={onGoToKit}
      onGoToShots={onGoToShots}
      onGoToPhotos={() => onGoToLookTab("photos")}
      onGoToLookTab={onGoToLookTab}
    />
  );
}