import {
  DIRECTOR_PREP_MAX_SNAPSHOTS,
  PROJECT_STATE_MAX_BYTES,
  PROJECT_STATE_SCHEMA_VERSION,
  SCENE_MAX_VISUAL_REFS,
  SCREENPLAY_RAW_TEXT_MAX_CHARS,
  type AgentStagingBundle,
  type AgentSuggestionStatus,
  type DirectorBudgetTier,
  type DirectorPrepState,
  type DirectorRulesState,
  type ProjectStatePayload,
  type SceneDayNight,
  type SceneIntExt,
  type SceneRow,
  type SceneRowStatus,
  type MoodBoardReference,
} from "@/lib/pro/types";
import {
  createEmptyDirectorPrep,
  createEmptyDirectorRules,
  createEmptyProjectState,
  createEmptyAgentMemory,
} from "@/lib/pro/project-state-defaults";
import { sanitizeReferenceUrls } from "@/lib/pro/suggest-look-references";
import { migrateShotPlanLegacy } from "@/lib/pro/migrate-shot-plan-legacy";
import { normalizeShotSequence } from "@/lib/pro/shot-plan";
import { memoryWithLearnedPreferences } from "@/lib/pro/synthesize-project-memory";
import { slimProjectStateForPersistence, analyzeProjectStateSize, projectStateTooLargeMessage } from "@/lib/pro/slim-project-state";
import { DEFAULT_DIRECTOR_PREP_TEMPLATE_ID } from "@/lib/pro/templates";
import { normalizePrepRunSettings } from "@/lib/pro/prep-run-settings";
import {
  type LocationPin,
  type LocationResearchRecord,
  type LocationShootSuggestion,
  type StagedLocationSuggestion,
} from "@/lib/pro/types";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function normalizeChecklistItems(
  raw: unknown,
  fallback: { id: string; label: string; done: boolean; hint?: string }[]
) {
  if (!Array.isArray(raw)) return fallback;
  return raw
    .filter(isPlainObject)
    .map((item, i) => {
      const hint = typeof item.hint === "string" && item.hint.trim() ? item.hint.trim() : undefined;
      return {
        id: typeof item.id === "string" ? item.id : `chk-${i}`,
        label: typeof item.label === "string" ? item.label : "",
        done: Boolean(item.done),
        ...(hint ? { hint } : {}),
      };
    });
}

const BUDGET_TIERS = new Set<DirectorBudgetTier>(["indie", "mid", "high"]);
const SCENE_STATUSES = new Set<SceneRowStatus>(["draft", "approved"]);
const INT_EXT_VALUES = new Set<SceneIntExt>(["INT", "EXT", "INT/EXT", ""]);
const DAY_NIGHT_VALUES = new Set<SceneDayNight>(["DAY", "NIGHT", "DAWN", "DUSK", ""]);

function normalizeBudgetTier(raw: unknown): DirectorBudgetTier {
  if (typeof raw === "string" && BUDGET_TIERS.has(raw as DirectorBudgetTier)) {
    return raw as DirectorBudgetTier;
  }
  return "indie";
}

const AGENT_STATUSES = new Set<AgentSuggestionStatus>(["pending", "approved", "rejected"]);

function normalizeSuggestionStatus(raw: unknown): AgentSuggestionStatus {
  if (typeof raw === "string" && AGENT_STATUSES.has(raw as AgentSuggestionStatus)) {
    return raw as AgentSuggestionStatus;
  }
  return "pending";
}

function normalizeLatLng(raw: unknown): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  return raw;
}

function normalizeLocationPin(raw: unknown): LocationPin | null {
  if (!isPlainObject(raw)) return null;
  const label = typeof raw.label === "string" ? raw.label : "";
  const mapQuery = typeof raw.mapQuery === "string" ? raw.mapQuery : label;
  if (!label.trim() && !mapQuery.trim()) return null;
  return {
    label: label.trim() || mapQuery.trim(),
    mapQuery: mapQuery.trim() || label.trim(),
    lat: normalizeLatLng(raw.lat),
    lng: normalizeLatLng(raw.lng),
  };
}

function normalizeShootSuggestion(raw: unknown, index: number): LocationShootSuggestion | null {
  if (!isPlainObject(raw)) return null;
  const title = typeof raw.title === "string" ? raw.title : "";
  const why = typeof raw.why === "string" ? raw.why : "";
  const mapQuery = typeof raw.mapQuery === "string" ? raw.mapQuery : "";
  if (!title.trim() && !why.trim() && !mapQuery.trim()) return null;
  return {
    id: typeof raw.id === "string" ? raw.id : `shoot-${index}`,
    title,
    why,
    mapQuery,
    status: normalizeSuggestionStatus(raw.status),
  };
}

function normalizeStagedLocation(raw: unknown, index: number): StagedLocationSuggestion {
  const l = isPlainObject(raw) ? raw : {};
  const name = typeof l.name === "string" ? l.name : "";
  const mapQuery = typeof l.mapQuery === "string" ? l.mapQuery : undefined;
  const pinnedPlace =
    l.pinnedPlace === null ? null : normalizeLocationPin(l.pinnedPlace) ?? undefined;
  const shootSuggestions = Array.isArray(l.shootSuggestions)
    ? l.shootSuggestions
        .map((s, i) => normalizeShootSuggestion(s, i))
        .filter((s): s is LocationShootSuggestion => s != null)
    : undefined;
  return {
    suggestionId: typeof l.suggestionId === "string" ? l.suggestionId : `loc-${index}`,
    status: normalizeSuggestionStatus(l.status),
    confidence:
      typeof l.confidence === "number" && Number.isFinite(l.confidence)
        ? Math.min(100, Math.max(0, Math.round(l.confidence)))
        : 70,
    name,
    notes: typeof l.notes === "string" ? l.notes : "",
    sceneNumbers: Array.isArray(l.sceneNumbers)
      ? l.sceneNumbers
          .filter((n): n is number => typeof n === "number" && Number.isFinite(n))
          .map((n) => Math.max(1, Math.floor(n)))
      : undefined,
    mapQuery,
    pinnedPlace,
    shootSuggestions,
    rulesAndLimitations: asStringArray(l.rulesAndLimitations),
  };
}

function normalizeLocationResearchRecord(raw: unknown, index: number): LocationResearchRecord | null {
  if (!isPlainObject(raw)) return null;
  const scriptName = typeof raw.scriptName === "string" ? raw.scriptName.trim() : "";
  if (!scriptName) return null;
  const pinnedPlace =
    raw.pinnedPlace === null ? null : normalizeLocationPin(raw.pinnedPlace);
  const shootSuggestions = Array.isArray(raw.shootSuggestions)
    ? raw.shootSuggestions
        .filter(isPlainObject)
        .map((s, i) => ({
          id: typeof s.id === "string" ? s.id : `shoot-${i}`,
          title: typeof s.title === "string" ? s.title : "",
          why: typeof s.why === "string" ? s.why : "",
          mapQuery: typeof s.mapQuery === "string" ? s.mapQuery : "",
        }))
        .filter((s) => s.title.trim() || s.why.trim() || s.mapQuery.trim())
    : [];
  return {
    id: typeof raw.id === "string" ? raw.id : `loc-rec-${index}`,
    scriptName,
    sceneNumbers: Array.isArray(raw.sceneNumbers)
      ? raw.sceneNumbers
          .filter((n): n is number => typeof n === "number" && Number.isFinite(n))
          .map((n) => Math.max(1, Math.floor(n)))
      : [],
    notes: typeof raw.notes === "string" ? raw.notes : "",
    pinnedPlace,
    shootSuggestions,
    rulesAndLimitations: asStringArray(raw.rulesAndLimitations),
    updatedAt:
      typeof raw.updatedAt === "string" ? raw.updatedAt : new Date(0).toISOString(),
  };
}

function normalizeLocationResearch(raw: unknown): LocationResearchRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row, i) => normalizeLocationResearchRecord(row, i))
    .filter((row): row is LocationResearchRecord => row != null);
}

function normalizeAgentMemory(raw: unknown) {
  const base = createEmptyAgentMemory();
  if (!isPlainObject(raw)) return base;
  const decisions = Array.isArray(raw.decisions)
    ? raw.decisions.filter(isPlainObject).map((d, i) => ({
        id: typeof d.id === "string" ? d.id : `dec-${i}`,
        at: typeof d.at === "string" ? d.at : new Date(0).toISOString(),
        agent: typeof d.agent === "string" ? d.agent : "unknown",
        summary: typeof d.summary === "string" ? d.summary : "",
        approved: Boolean(d.approved),
      }))
    : base.decisions;
  const mem = {
    decisions: decisions.slice(-50),
    compressedScriptSummary:
      typeof raw.compressedScriptSummary === "string"
        ? raw.compressedScriptSummary
        : base.compressedScriptSummary,
    lastScriptFingerprint:
      typeof raw.lastScriptFingerprint === "string"
        ? raw.lastScriptFingerprint
        : base.lastScriptFingerprint,
    learnedPreferences: asStringArray(raw.learnedPreferences),
  };
  return mem;
}

function normalizeAgentStaging(raw: unknown): AgentStagingBundle | null {
  if (!isPlainObject(raw)) return null;
  if (raw.status !== "review" && raw.status !== "committed") return null;

  const scenes = Array.isArray(raw.scenes)
    ? raw.scenes.filter(isPlainObject).map((s, i) => ({
        suggestionId: typeof s.suggestionId === "string" ? s.suggestionId : `sg-${i}`,
        status: normalizeSuggestionStatus(s.status),
        confidence:
          typeof s.confidence === "number" && Number.isFinite(s.confidence)
            ? Math.min(100, Math.max(0, Math.round(s.confidence)))
            : 70,
        scene: normalizeSceneRow(isPlainObject(s.scene) ? s.scene : {}, i),
      }))
    : [];

  const shotSequences = Array.isArray(raw.shotSequences)
    ? raw.shotSequences.filter(isPlainObject).map((s, i) => ({
        suggestionId: typeof s.suggestionId === "string" ? s.suggestionId : `shot-${i}`,
        status: normalizeSuggestionStatus(s.status),
        confidence:
          typeof s.confidence === "number" && Number.isFinite(s.confidence)
            ? Math.min(100, Math.max(0, Math.round(s.confidence)))
            : 70,
        sceneNumber:
          typeof s.sceneNumber === "number" && Number.isFinite(s.sceneNumber)
            ? Math.max(1, Math.floor(s.sceneNumber))
            : null,
        title: typeof s.title === "string" ? s.title : "",
        notes: typeof s.notes === "string" ? s.notes : "",
      }))
    : [];

  const locations = Array.isArray(raw.locations)
    ? raw.locations.filter(isPlainObject).map((l, i) => normalizeStagedLocation(l, i))
    : [];

  const characters = Array.isArray(raw.characters)
    ? raw.characters.filter(isPlainObject).map((c, i) => ({
        suggestionId: typeof c.suggestionId === "string" ? c.suggestionId : `char-${i}`,
        status: normalizeSuggestionStatus(c.status),
        confidence:
          typeof c.confidence === "number" && Number.isFinite(c.confidence)
            ? Math.min(100, Math.max(0, Math.round(c.confidence)))
            : 70,
        name: typeof c.name === "string" ? c.name : "",
        notes: typeof c.notes === "string" ? c.notes : "",
      }))
    : [];

  let budget: AgentStagingBundle["budget"] = null;
  if (isPlainObject(raw.budget)) {
    const b = raw.budget;
    budget = {
      suggestionId: typeof b.suggestionId === "string" ? b.suggestionId : "budget-1",
      status: normalizeSuggestionStatus(b.status),
      confidence:
        typeof b.confidence === "number" && Number.isFinite(b.confidence)
          ? Math.min(100, Math.max(0, Math.round(b.confidence)))
          : 70,
      tier: normalizeBudgetTier(b.tier),
      summary: typeof b.summary === "string" ? b.summary : "",
      monthlyToolingUsdLow:
        typeof b.monthlyToolingUsdLow === "number" && Number.isFinite(b.monthlyToolingUsdLow)
          ? b.monthlyToolingUsdLow
          : null,
      monthlyToolingUsdHigh:
        typeof b.monthlyToolingUsdHigh === "number" && Number.isFinite(b.monthlyToolingUsdHigh)
          ? b.monthlyToolingUsdHigh
          : null,
    };
  }

  let visual: AgentStagingBundle["visual"] = null;
  if (isPlainObject(raw.visual)) {
    const v = raw.visual;
    visual = {
      suggestionId: typeof v.suggestionId === "string" ? v.suggestionId : "visual-1",
      status: normalizeSuggestionStatus(v.status),
      confidence:
        typeof v.confidence === "number" && Number.isFinite(v.confidence)
          ? Math.min(100, Math.max(0, Math.round(v.confidence)))
          : 70,
      mood: typeof v.mood === "string" ? v.mood : "",
      palette: asStringArray(v.palette),
      designNotes: typeof v.designNotes === "string" ? v.designNotes : "",
      referenceUrls: asStringArray(v.referenceUrls).slice(0, 24),
    };
  }

  return {
    runId: typeof raw.runId === "string" ? raw.runId : `run-${Date.now()}`,
    status: raw.status,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    executiveSummary: typeof raw.executiveSummary === "string" ? raw.executiveSummary : "",
    researchNotes: typeof raw.researchNotes === "string" ? raw.researchNotes : "",
    scenes,
    shotSequences,
    locations,
    characters,
    budget,
    visual,
    refineHint: typeof raw.refineHint === "string" ? raw.refineHint : null,
  };
}

function normalizeMoodBoardReferences(raw: unknown): MoodBoardReference[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isPlainObject)
    .map((r, i) => ({
      id: typeof r.id === "string" ? r.id : `mbr-${i}`,
      title: typeof r.title === "string" ? r.title : `Reference ${i + 1}`,
      description: typeof r.description === "string" ? r.description : "",
      technicalNotes: typeof r.technicalNotes === "string" ? r.technicalNotes : "",
      whyItFits: typeof r.whyItFits === "string" ? r.whyItFits : "",
      filmReference: typeof r.filmReference === "string" ? r.filmReference : "",
    }))
    .slice(0, 8);
}

function normalizeDirectorRules(raw: unknown): DirectorRulesState {
  const base = createEmptyDirectorRules();
  if (!isPlainObject(raw)) return base;
  return {
    styleNotes: typeof raw.styleNotes === "string" ? raw.styleNotes : base.styleNotes,
    preferredShots:
      typeof raw.preferredShots === "string" ? raw.preferredShots : base.preferredShots,
    budgetTier: normalizeBudgetTier(raw.budgetTier),
    toneAndRefs: typeof raw.toneAndRefs === "string" ? raw.toneAndRefs : base.toneAndRefs,
    genreTags: asStringArray(raw.genreTags),
    projectInstructions:
      typeof raw.projectInstructions === "string"
        ? raw.projectInstructions
        : base.projectInstructions,
  };
}

function normalizeSceneRow(raw: unknown, index: number): SceneRow {
  const obj = isPlainObject(raw) ? raw : {};
  const intExtRaw = typeof obj.intExt === "string" ? obj.intExt : "";
  const dayNightRaw = typeof obj.dayNight === "string" ? obj.dayNight : "";
  const statusRaw = typeof obj.status === "string" ? obj.status : "draft";
  const visualRefs = asStringArray(obj.visualRefs).slice(0, SCENE_MAX_VISUAL_REFS);

  return {
    id: typeof obj.id === "string" ? obj.id : `scene-${index + 1}`,
    number:
      typeof obj.number === "number" && Number.isFinite(obj.number)
        ? Math.max(1, Math.floor(obj.number))
        : index + 1,
    heading: typeof obj.heading === "string" ? obj.heading : "",
    oneLine: typeof obj.oneLine === "string" ? obj.oneLine : "",
    intExt: INT_EXT_VALUES.has(intExtRaw as SceneIntExt) ? (intExtRaw as SceneIntExt) : "",
    dayNight: DAY_NIGHT_VALUES.has(dayNightRaw as SceneDayNight)
      ? (dayNightRaw as SceneDayNight)
      : "",
    visualRefs,
    shotNotes: typeof obj.shotNotes === "string" ? obj.shotNotes : "",
    status: SCENE_STATUSES.has(statusRaw as SceneRowStatus)
      ? (statusRaw as SceneRowStatus)
      : "draft",
    linkedSequenceId:
      typeof obj.linkedSequenceId === "string" ? obj.linkedSequenceId : null,
  };
}

function normalizeDirectorPrep(raw: unknown): DirectorPrepState {
  const base = createEmptyDirectorPrep();
  if (!isPlainObject(raw)) return base;

  const rulesRaw = isPlainObject(raw.directorRules) ? raw.directorRules : {};
  const screenplayRaw = isPlainObject(raw.screenplay) ? raw.screenplay : {};

  let rawText =
    typeof screenplayRaw.rawText === "string" ? screenplayRaw.rawText : base.screenplay.rawText;
  if (rawText.length > SCREENPLAY_RAW_TEXT_MAX_CHARS) {
    rawText = rawText.slice(0, SCREENPLAY_RAW_TEXT_MAX_CHARS);
  }

  const pageEstimate =
    typeof screenplayRaw.pageEstimate === "number" &&
    Number.isFinite(screenplayRaw.pageEstimate) &&
    screenplayRaw.pageEstimate >= 0
      ? Math.floor(screenplayRaw.pageEstimate)
      : null;

  const scenes = Array.isArray(raw.scenes)
    ? raw.scenes.map((row, i) => normalizeSceneRow(row, i))
    : base.scenes;

  const snapshots = Array.isArray(raw.snapshots)
    ? raw.snapshots
        .filter(isPlainObject)
        .slice(0, DIRECTOR_PREP_MAX_SNAPSHOTS)
        .map((snap, i) => {
          const snapScenes = Array.isArray(snap.scenes)
            ? snap.scenes.map((row, j) => normalizeSceneRow(row, j))
            : [];
          return {
            id: typeof snap.id === "string" ? snap.id : `snap-${i}`,
            label: typeof snap.label === "string" ? snap.label : `Snapshot ${i + 1}`,
            createdAt:
              typeof snap.createdAt === "string" ? snap.createdAt : new Date(0).toISOString(),
            directorRules: normalizeDirectorRules(snap.directorRules),
            scenes: snapScenes,
          };
        })
    : base.snapshots;

  const agentMetaRaw = isPlainObject(raw.agentMeta) ? raw.agentMeta : {};
  const agentMeta = {
    lastRunAt:
      typeof agentMetaRaw.lastRunAt === "string" ? agentMetaRaw.lastRunAt : base.agentMeta.lastRunAt,
    executiveSummary:
      typeof agentMetaRaw.executiveSummary === "string"
        ? agentMetaRaw.executiveSummary
        : base.agentMeta.executiveSummary,
    budgetSummaryText:
      typeof agentMetaRaw.budgetSummaryText === "string"
        ? agentMetaRaw.budgetSummaryText
        : base.agentMeta.budgetSummaryText,
    visualMood:
      typeof agentMetaRaw.visualMood === "string" ? agentMetaRaw.visualMood : base.agentMeta.visualMood,
  };

  const agentMemory = normalizeAgentMemory(raw.agentMemory);
  const agentStaging = normalizeAgentStaging(raw.agentStaging);
  const prepRunSettings = normalizePrepRunSettings(raw.prepRunSettings);
  const locationResearch = normalizeLocationResearch(raw.locationResearch);

  return {
    directorRules: normalizeDirectorRules(rulesRaw),
    screenplay: {
      title: typeof screenplayRaw.title === "string" ? screenplayRaw.title : base.screenplay.title,
      draftLabel:
        typeof screenplayRaw.draftLabel === "string"
          ? screenplayRaw.draftLabel
          : base.screenplay.draftLabel,
      pageEstimate,
      rawText,
      lastImportedAt:
        typeof screenplayRaw.lastImportedAt === "string"
          ? screenplayRaw.lastImportedAt
          : base.screenplay.lastImportedAt,
    },
    scenes,
    snapshots,
    agentMeta,
    agentStaging,
    agentMemory,
    prepRunSettings,
    appliedTemplateId:
      typeof raw.appliedTemplateId === "string" && raw.appliedTemplateId.trim()
        ? raw.appliedTemplateId.trim()
        : DEFAULT_DIRECTOR_PREP_TEMPLATE_ID,
    locationResearch,
  };
}

/**
 * Normalize unknown JSON into a valid payload (merge over defaults).
 * Migrates v2 documents missing `directorPrep` to schema v3.
 */
export function normalizeProjectState(raw: unknown): ProjectStatePayload {
  const base = createEmptyProjectState();
  if (!isPlainObject(raw)) return base;

  const kit = Array.isArray(raw.kit) ? raw.kit : base.kit;

  const workflowRaw = isPlainObject(raw.workflow) ? raw.workflow : {};
  const stageIndex =
    typeof workflowRaw.stageIndex === "number" && Number.isFinite(workflowRaw.stageIndex)
      ? Math.max(0, Math.floor(workflowRaw.stageIndex))
      : base.workflow.stageIndex;
  const completedPhases = Array.isArray(workflowRaw.completedPhases)
    ? workflowRaw.completedPhases
        .filter((n): n is number => typeof n === "number" && Number.isFinite(n))
        .map((n) => Math.max(0, Math.floor(n)))
    : base.workflow.completedPhases ?? [];

  const budgetRaw = isPlainObject(raw.budget) ? raw.budget : {};
  const budget = {
    microTools: Array.isArray(budgetRaw.microTools) ? budgetRaw.microTools : base.budget.microTools,
    lowTools: Array.isArray(budgetRaw.lowTools) ? budgetRaw.lowTools : base.budget.lowTools,
    selectedRole:
      typeof budgetRaw.selectedRole === "string" ? budgetRaw.selectedRole : base.budget.selectedRole,
    selectedBudget:
      typeof budgetRaw.selectedBudget === "string"
        ? budgetRaw.selectedBudget
        : base.budget.selectedBudget,
    currency: typeof budgetRaw.currency === "string" ? budgetRaw.currency : base.budget.currency,
  };

  const worldRaw = isPlainObject(raw.worldBible) ? raw.worldBible : {};
  const worldBible = {
    notes: typeof worldRaw.notes === "string" ? worldRaw.notes : base.worldBible.notes,
    characters: asStringArray(worldRaw.characters),
    locations: asStringArray(worldRaw.locations),
  };

  const visualRaw = isPlainObject(raw.visualBible) ? raw.visualBible : {};
  const visualBible = {
    designSheetNotes:
      typeof visualRaw.designSheetNotes === "string"
        ? visualRaw.designSheetNotes
        : base.visualBible.designSheetNotes,
    referenceUrls: sanitizeReferenceUrls(asStringArray(visualRaw.referenceUrls)),
    palette: asStringArray(visualRaw.palette),
    lensAndFraming:
      typeof visualRaw.lensAndFraming === "string"
        ? visualRaw.lensAndFraming
        : base.visualBible.lensAndFraming,
    grainAndTexture:
      typeof visualRaw.grainAndTexture === "string"
        ? visualRaw.grainAndTexture
        : base.visualBible.grainAndTexture,
    moodBoardReferences: normalizeMoodBoardReferences(visualRaw.moodBoardReferences),
    negativePromptNotes:
      typeof visualRaw.negativePromptNotes === "string"
        ? visualRaw.negativePromptNotes
        : base.visualBible.negativePromptNotes,
    consistencyChecklist: normalizeChecklistItems(
      visualRaw.consistencyChecklist,
      base.visualBible.consistencyChecklist
    ),
  };

  const shotRaw = isPlainObject(raw.shotPlan) ? raw.shotPlan : {};
  const sequences = Array.isArray(shotRaw.sequences)
    ? shotRaw.sequences
        .filter(isPlainObject)
        .map((s, i) => normalizeShotSequence(s, i))
    : base.shotPlan.sequences;

  const postRaw = isPlainObject(raw.postChecklist) ? raw.postChecklist : {};
  const normalizeChecklistRow = (item: unknown, i: number) => {
    const row = isPlainObject(item) ? item : {};
    return {
      id: typeof row.id === "string" ? row.id : `post-${i}`,
      label: typeof row.label === "string" ? row.label : "",
      done: Boolean(row.done),
      hint: typeof row.hint === "string" ? row.hint : undefined,
    };
  };
  const items = Array.isArray(postRaw.items)
    ? postRaw.items.map(normalizeChecklistRow)
    : base.postChecklist.items;
  const gradeHandoffNotes =
    typeof postRaw.gradeHandoffNotes === "string" ? postRaw.gradeHandoffNotes : base.postChecklist.gradeHandoffNotes;
  const deliverableChecks = Array.isArray(postRaw.deliverableChecks)
    ? postRaw.deliverableChecks.map(normalizeChecklistRow)
    : base.postChecklist.deliverableChecks;

  const directorPrep = normalizeDirectorPrep(raw.directorPrep);

  return slimProjectStateForPersistence(
    migrateShotPlanLegacy({
      schemaVersion: PROJECT_STATE_SCHEMA_VERSION,
      kit,
      workflow: { stageIndex, completedPhases },
      budget,
      worldBible,
      visualBible,
      shotPlan: { sequences },
      postChecklist: { items, gradeHandoffNotes, deliverableChecks },
      directorPrep: {
        ...directorPrep,
        agentMemory: memoryWithLearnedPreferences(
          directorPrep.agentMemory,
          directorPrep.directorRules,
          directorPrep.appliedTemplateId
        ),
      },
    })
  );
}

export type ValidateProjectStateResult =
  | { ok: true; state: ProjectStatePayload }
  | { ok: false; error: string };

export function validateProjectStatePayload(raw: unknown): ValidateProjectStateResult {
  try {
    JSON.stringify(raw ?? {});
  } catch {
    return { ok: false, error: "State is not valid JSON." };
  }

  if (isPlainObject(raw)) {
    const screenplayRaw = isPlainObject(raw.directorPrep)
      ? isPlainObject(raw.directorPrep.screenplay)
        ? raw.directorPrep.screenplay
        : null
      : null;
    const rawText =
      screenplayRaw && typeof screenplayRaw.rawText === "string" ? screenplayRaw.rawText : "";
    if (rawText.length > SCREENPLAY_RAW_TEXT_MAX_CHARS) {
      return {
        ok: false,
        error: `Script text exceeds ${SCREENPLAY_RAW_TEXT_MAX_CHARS.toLocaleString()} characters (~30 pages). Shorten before saving.`,
      };
    }
  }

  const state = normalizeProjectState(raw);
  if (state.schemaVersion !== PROJECT_STATE_SCHEMA_VERSION) {
    return { ok: false, error: "Unsupported state schema version." };
  }

  const slimmed = slimProjectStateForPersistence(state);
  let slimSerialized: string;
  try {
    slimSerialized = JSON.stringify(slimmed);
  } catch {
    return { ok: false, error: "State is not valid JSON." };
  }

  if (slimSerialized.length > PROJECT_STATE_MAX_BYTES) {
    const breakdown = analyzeProjectStateSize(slimmed);
    return {
      ok: false,
      error: projectStateTooLargeMessage(breakdown),
    };
  }

  return { ok: true, state: slimmed };
}
