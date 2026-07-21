/** Top-level workspace modes (simplified navigation). */
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import type { ProjectStatePayload } from "@/lib/pro/types";

export type WorkspaceMode = "prep" | "look" | "production" | "post";

export type PrepStepId = "script" | "generate" | "download";

export type LookTabId = "photos" | "mood-board" | "check" | "details";

export type ProductionTabId =
  | "world"
  | "shots"
  | "prompts"
  | "kit"
  | "workflow"
  | "budget"
  | "export"
  | "finish";

export type PostTabId =
  | "pipeline"
  | "kit"
  | "look-handoff"
  | "deliverables"
  | "checklist";

export const WORKSPACE_MODES: { id: WorkspaceMode; label: string; hint: string }[] = [
  { id: "prep", label: "Prep", hint: "Script · run · review" },
  { id: "look", label: "Look", hint: "Photos · mood board" },
  { id: "production", label: "Finish", hint: "Shots · budget · kit" },
  { id: "post", label: "Post", hint: "Edit · grade · deliver" },
];

export const POST_TABS: { id: PostTabId; label: string }[] = [
  { id: "pipeline", label: "Pipeline" },
  { id: "kit", label: "Kit" },
  { id: "look-handoff", label: "Look handoff" },
  { id: "deliverables", label: "Deliverables" },
  { id: "checklist", label: "Sign-off" },
];

export const DEFAULT_POST_TAB: PostTabId = "pipeline";

export const PREP_TABS: { id: PrepStepId; label: string }[] = [
  { id: "script", label: "Script" },
  { id: "generate", label: "Generate" },
  { id: "download", label: "Prep report" },
];

/** Script → prompt: prep report under Script (Finish → Export is the deliverable). */
export const SCRIPT_TO_PROMPT_PREP_TABS: { id: PrepStepId; label: string }[] = [
  { id: "script", label: "Script" },
  { id: "generate", label: "Run prep" },
  { id: "download", label: "Prep report" },
];

export function prepTabsForState(state: ProjectStatePayload): { id: PrepStepId; label: string }[] {
  if (isScriptToPromptTemplate(state.directorPrep.appliedTemplateId)) {
    return SCRIPT_TO_PROMPT_PREP_TABS;
  }
  return PREP_TABS;
}

export const LOOK_TABS: { id: LookTabId; label: string }[] = [
  { id: "photos", label: "Photos" },
  { id: "mood-board", label: "Mood board" },
  { id: "check", label: "Check" },
  { id: "details", label: "Details" },
];

export const PRODUCTION_TABS: { id: ProductionTabId; label: string }[] = [
  { id: "shots", label: "Shots" },
  { id: "prompts", label: "Prompts" },
  { id: "budget", label: "Budget" },
  { id: "world", label: "World" },
  { id: "kit", label: "Kit" },
  { id: "workflow", label: "Phases" },
  { id: "export", label: "Export" },
  { id: "finish", label: "Finish" },
];

/**
 * Finish-phase tab order (script-to-prompt) — happy path first: prompts → export → sign-off.
 * Shots / Budget / World / Kit / Phases stay behind More / Change workflow (not required for S2P).
 */
export const SCRIPT_TO_PROMPT_PRODUCTION_TAB_ORDER: ProductionTabId[] = [
  "prompts",
  "export",
  "finish",
  "shots",
  "kit",
  "workflow",
  "world",
  "budget",
];

/** Display labels under the Finish phase (avoid duplicating the top-level Finish step name). */
export const SCRIPT_TO_PROMPT_PRODUCTION_TAB_LABELS: Partial<Record<ProductionTabId, string>> = {
  finish: "Sign-off",
  shots: "Beats",
};

/** Primary tabs — delivery path (desktop + mobile). */
export const SCRIPT_TO_PROMPT_PRODUCTION_PRIMARY: ProductionTabId[] = [
  "prompts",
  "export",
  "finish",
];

/** More — planning, beats rebuild, kit. */
export const SCRIPT_TO_PROMPT_PRODUCTION_MORE: ProductionTabId[] = [
  "shots",
  "kit",
  "workflow",
  "world",
  "budget",
];

export function productionTabsForState(
  state: ProjectStatePayload
): { id: ProductionTabId; label: string }[] {
  if (isScriptToPromptTemplate(state.directorPrep.appliedTemplateId)) {
    return SCRIPT_TO_PROMPT_PRODUCTION_TAB_ORDER.map((id) => {
      const tab = PRODUCTION_TABS.find((t) => t.id === id);
      if (!tab) return null;
      return {
        id,
        label: SCRIPT_TO_PROMPT_PRODUCTION_TAB_LABELS[id] ?? tab.label,
      };
    }).filter((t): t is { id: ProductionTabId; label: string } => t != null);
  }
  return PRODUCTION_TABS.filter((t) => t.id !== "finish");
}

export function defaultProductionTabForState(state: ProjectStatePayload): ProductionTabId {
  if (isScriptToPromptTemplate(state.directorPrep.appliedTemplateId)) return "prompts";
  return "shots";
}

/** Legacy hash `prep-vision` maps to Script (vision fields live there). */
export function normalizePrepStepId(raw: string): PrepStepId | null {
  const id = raw === "vision" ? "script" : raw;
  if (id === "script" || id === "generate" || id === "download") return id;
  return null;
}

export function prepStepToWizardStep(id: PrepStepId): 1 | 2 | 3 {
  const map: Record<PrepStepId, 1 | 2 | 3> = {
    script: 1,
    generate: 2,
    download: 3,
  };
  return map[id];
}

export function wizardStepToPrepStep(step: 1 | 2 | 3): PrepStepId {
  return PREP_TABS[step - 1]!.id;
}

export function derivePrepStepFromState(state: ProjectStatePayload): PrepStepId {
  const dp = state.directorPrep;
  if (dp.scenes.some((s) => s.status === "approved")) {
    return "download";
  }
  if (dp.scenes.length > 0 || dp.agentStaging?.status === "review") return "generate";
  return "script";
}

/** Map legacy playbook tab ids to mode + optional production sub-tab. */
export function resolveWorkspaceNavigation(tab: string): {
  mode: WorkspaceMode;
  productionTab?: ProductionTabId;
  prepStep?: PrepStepId;
  lookTab?: LookTabId;
} {
  if (tab === "director") return { mode: "prep" };
  if (tab === "visual") return { mode: "look" };
  if (tab === "post" || tab === "production-post") return { mode: "post" };
  if (tab.startsWith("prep-")) {
    const step = normalizePrepStepId(tab.slice("prep-".length));
    if (step) return { mode: "prep", prepStep: step };
  }
  if (tab.startsWith("look-")) {
    const look = tab.slice("look-".length) as LookTabId;
    if (LOOK_TABS.some((t) => t.id === look)) return { mode: "look", lookTab: look };
  }
  const productionTabs: ProductionTabId[] = [
    "world",
    "shots",
    "prompts",
    "kit",
    "workflow",
    "budget",
    "export",
    "finish",
  ];
  if (productionTabs.includes(tab as ProductionTabId)) {
    return { mode: "production", productionTab: tab as ProductionTabId };
  }
  return { mode: "prep" };
}
