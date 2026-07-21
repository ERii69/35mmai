"use client";

import { type ReactNode } from "react";
import { ProWorkspaceMoreMenu } from "@/components/pro/ProWorkspaceMoreMenu";
import { proNavPill, proNavPillDense, proNavScroll, proNavScrollFade } from "@/components/pro/ux/pro-surfaces";
import {
  LOOK_TABS,
  POST_TABS,
  SCRIPT_TO_PROMPT_PRODUCTION_MORE,
  SCRIPT_TO_PROMPT_PRODUCTION_PRIMARY,
  type LookTabId,
  type PostTabId,
  type PrepStepId,
  type ProductionTabId,
} from "@/lib/pro/workspace-modes";

type TabItem = { id: string; label: string };

function MobileSubTabRow({
  primaryTabs,
  moreTabs,
  activeId,
  onSelect,
  ariaLabel,
  moreFooter,
  moreActive,
}: {
  primaryTabs: TabItem[];
  moreTabs: TabItem[];
  activeId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
  moreFooter?: (close: () => void) => ReactNode;
  moreActive?: boolean;
}) {
  const moreActiveResolved = moreActive ?? moreTabs.some((t) => t.id === activeId);

  return (
    <div className="relative min-w-0 flex-1">
      <div className={`relative z-10 ${proNavScroll}`} role="tablist" aria-label={ariaLabel}>
        {primaryTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeId === t.id}
            onClick={() => onSelect(t.id)}
            className={`${proNavPillDense(activeId === t.id)} shrink-0 touch-manipulation whitespace-nowrap`}
          >
            {t.label}
          </button>
        ))}
        {moreTabs.length > 0 || moreFooter ? (
          <ProWorkspaceMoreMenu
            items={moreTabs}
            activeId={activeId}
            activeInMore={moreActiveResolved}
            onSelect={onSelect}
            footer={moreFooter}
          />
        ) : null}
      </div>
      <div className={`${proNavScrollFade} z-0`} aria-hidden />
    </div>
  );
}

const PREP_PRIMARY: PrepStepId[] = ["script", "generate"];
const PREP_MORE: PrepStepId[] = ["download"];
const LOOK_PRIMARY: LookTabId[] = ["photos", "mood-board"];
const LOOK_MORE: LookTabId[] = ["check", "details"];
const PRODUCE_PRIMARY: ProductionTabId[] = ["shots", "prompts", "export"];
const PRODUCE_MORE: ProductionTabId[] = ["world", "kit", "workflow", "budget"];

const MOOD_BOARD_MOBILE_LABEL = "Mood";

type PrepProps = {
  prepStep: PrepStepId;
  prepTabs: { id: PrepStepId; label: string }[];
  onPrepStepChange: (step: PrepStepId) => void;
  pipelineLayout?: boolean;
};

export function PrepSubTabsMobile({
  prepStep,
  prepTabs,
  onPrepStepChange,
  pipelineLayout = false,
}: PrepProps) {
  const primaryIds = pipelineLayout ? prepTabs.map((t) => t.id) : PREP_PRIMARY;
  const moreIds = pipelineLayout ? [] : PREP_MORE;
  const primaryTabs = prepTabs.filter((t) => primaryIds.includes(t.id));
  const moreTabs = prepTabs.filter((t) => moreIds.includes(t.id));

  return (
    <MobileSubTabRow
      primaryTabs={primaryTabs}
      moreTabs={moreTabs}
      activeId={prepStep}
      onSelect={(id) => onPrepStepChange(id as PrepStepId)}
      ariaLabel="Prep sections"
    />
  );
}

type LookProps = {
  lookTab: LookTabId;
  lookTabs: { id: LookTabId; label: string }[];
  onLookTabChange: (tab: LookTabId) => void;
};

export function LookSubTabsMobile({ lookTab, lookTabs, onLookTabChange }: LookProps) {
  const primaryTabs = lookTabs
    .filter((t) => LOOK_PRIMARY.includes(t.id))
    .map((t) =>
      t.id === "mood-board" ? { id: t.id, label: MOOD_BOARD_MOBILE_LABEL } : t
    );
  const moreTabs = LOOK_TABS.filter(
    (t) => LOOK_MORE.includes(t.id) && lookTabs.some((lt) => lt.id === t.id)
  );

  return (
    <MobileSubTabRow
      primaryTabs={primaryTabs}
      moreTabs={moreTabs}
      activeId={lookTab}
      onSelect={(id) => onLookTabChange(id as LookTabId)}
      ariaLabel="Look sections"
    />
  );
}

/** Desktop Look sub-nav — primary + More (matches Finish IA). */
export function LookSubTabsDesktop({ lookTab, lookTabs, onLookTabChange }: LookProps) {
  const primaryTabs = lookTabs.filter((t) => LOOK_PRIMARY.includes(t.id));
  const moreTabs = LOOK_TABS.filter(
    (t) => LOOK_MORE.includes(t.id) && lookTabs.some((lt) => lt.id === t.id)
  );

  return (
    <div className="relative">
      <div className={proNavScroll} role="tablist" aria-label="Look sections">
        {primaryTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={lookTab === t.id}
            onClick={() => onLookTabChange(t.id)}
            className={`${proNavPill(lookTab === t.id)} shrink-0 whitespace-nowrap touch-manipulation`}
          >
            {t.label}
          </button>
        ))}
        {moreTabs.length > 0 ? (
          <ProWorkspaceMoreMenu
            compact={false}
            items={moreTabs}
            activeId={lookTab}
            activeInMore={moreTabs.some((t) => t.id === lookTab)}
            onSelect={(id) => onLookTabChange(id as LookTabId)}
          />
        ) : null}
      </div>
      <div className={proNavScrollFade} aria-hidden />
    </div>
  );
}

type ProduceProps = {
  productionTab: ProductionTabId;
  productionTabs: { id: ProductionTabId; label: string }[];
  pipelineLayout?: boolean;
  onProductionTabChange: (tab: ProductionTabId) => void;
};

export function ProduceSubTabsMobile({
  productionTab,
  productionTabs,
  pipelineLayout = false,
  onProductionTabChange,
}: ProduceProps) {
  const primaryIds = pipelineLayout ? SCRIPT_TO_PROMPT_PRODUCTION_PRIMARY : PRODUCE_PRIMARY;
  const moreIds = pipelineLayout ? SCRIPT_TO_PROMPT_PRODUCTION_MORE : PRODUCE_MORE;
  const primaryTabs = productionTabs.filter((t) => primaryIds.includes(t.id));
  const moreTabs = productionTabs.filter((t) => moreIds.includes(t.id));

  return (
    <MobileSubTabRow
      primaryTabs={primaryTabs}
      moreTabs={moreTabs}
      activeId={productionTab}
      moreActive={moreTabs.some((t) => t.id === productionTab)}
      onSelect={(id) => onProductionTabChange(id as ProductionTabId)}
      ariaLabel="Finish sections"
    />
  );
}

/** Desktop produce/finish sub-nav — primary row + More (matches mobile IA). */
export function ProduceSubTabsDesktop({
  productionTab,
  productionTabs,
  pipelineLayout = false,
  onProductionTabChange,
}: ProduceProps) {
  const primaryIds = pipelineLayout ? SCRIPT_TO_PROMPT_PRODUCTION_PRIMARY : PRODUCE_PRIMARY;
  const moreIds = pipelineLayout ? SCRIPT_TO_PROMPT_PRODUCTION_MORE : PRODUCE_MORE;
  const primaryTabs = productionTabs.filter((t) => primaryIds.includes(t.id));
  const moreTabs = productionTabs.filter((t) => moreIds.includes(t.id));

  return (
    <div className="relative">
      <div className={proNavScroll} role="tablist" aria-label="Finish sections">
        {primaryTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={productionTab === t.id}
            onClick={() => onProductionTabChange(t.id)}
            className={`${proNavPill(productionTab === t.id)} shrink-0 whitespace-nowrap touch-manipulation`}
          >
            {t.label}
          </button>
        ))}
        {moreTabs.length > 0 ? (
          <ProWorkspaceMoreMenu
            compact={false}
            items={moreTabs}
            activeId={productionTab}
            activeInMore={moreTabs.some((t) => t.id === productionTab)}
            onSelect={(id) => onProductionTabChange(id as ProductionTabId)}
          />
        ) : null}
      </div>
      <div className={proNavScrollFade} aria-hidden />
    </div>
  );
}

const POST_PRIMARY: PostTabId[] = ["pipeline", "kit", "checklist"];
const POST_MORE: PostTabId[] = ["look-handoff", "deliverables"];

type PostProps = {
  postTab: PostTabId;
  onPostTabChange: (tab: PostTabId) => void;
};

export function PostSubTabsMobile({ postTab, onPostTabChange }: PostProps) {
  return (
    <MobileSubTabRow
      primaryTabs={POST_TABS.filter((t) => POST_PRIMARY.includes(t.id))}
      moreTabs={POST_TABS.filter((t) => POST_MORE.includes(t.id))}
      activeId={postTab}
      moreActive={POST_MORE.includes(postTab)}
      onSelect={(id) => onPostTabChange(id as PostTabId)}
      ariaLabel="Post sections"
    />
  );
}
