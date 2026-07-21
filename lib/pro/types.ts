/** Current `project_state.state` document version. Bump when shape changes. */
export const PROJECT_STATE_SCHEMA_VERSION = 4;

/**
 * Max serialized JSON size for cloud save (bytes).
 * Phase 1 cap — must stay at or below `next.config.ts` serverActions.bodySizeLimit (2mb).
 * Long-term: move reference stills to Supabase Storage (see docs/project-state-size-limits.md).
 */
export const PROJECT_STATE_MAX_BYTES = 2 * 1024 * 1024;

/** Total byte budget for embedded reference stills inside JSON on save (before Storage migration). */
export const PROJECT_STATE_PHOTO_BUDGET_BYTES = 500_000;

/** ~30 pages plain text — enforced on save (see validateProjectStatePayload). */
export const SCREENPLAY_RAW_TEXT_MAX_CHARS = 120_000;

/** Max visual reference strings per scene row. */
export const SCENE_MAX_VISUAL_REFS = 3;

/** Max saved director-prep snapshots per project. */
export const DIRECTOR_PREP_MAX_SNAPSHOTS = 10;

export type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  archived_at: string | null;
  last_opened_at: string;
  created_at: string;
  updated_at: string;
};

export type WorkflowState = {
  stageIndex: number;
  /** Phase indices (0–3) marked complete by the filmmaker. */
  completedPhases?: number[];
};

export type BudgetState = {
  microTools: unknown[];
  lowTools: unknown[];
  selectedRole: string | null;
  selectedBudget: string | null;
  currency: string;
};

export type WorldBibleState = {
  notes: string;
  characters: string[];
  locations: string[];
};

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  /** Actionable guidance shown under the step label. */
  hint?: string;
};

export type VisualBibleState = {
  designSheetNotes: string;
  referenceUrls: string[];
  /** Hex or descriptive color notes, one per line in UI. */
  palette: string[];
  lensAndFraming: string;
  grainAndTexture: string;
  /** Structured mood board reference tiles (lighting ideas, film refs, etc.). */
  moodBoardReferences: MoodBoardReference[];
  /** Guidance for external AI tools — not in-app generation. */
  negativePromptNotes: string;
  consistencyChecklist: ChecklistItem[];
};

export type ShotType =
  | "wide"
  | "medium"
  | "close_up"
  | "extreme_close_up"
  | "dolly"
  | "pan"
  | "tilt"
  | "handheld"
  | "aerial"
  | "establishing"
  | "other";

export type ShotProductionStatus = "planned" | "storyboarded" | "shot" | "approved";

export type PlannedShot = {
  id: string;
  shotType: ShotType;
  label: string;
  /** Palette / mood line from visual bible for this shot. */
  visualBibleNote: string;
  /** Estimated duration on set (seconds). */
  durationSeconds: number;
  /** URL from visual bible refs or custom. */
  visualRefUrl: string;
  cameraNotes: string;
  lightingNotes: string;
  status: ShotProductionStatus;
  /** Links to `directorPrep.scenes[].id` when known. */
  sceneId: string | null;
  /** Copy-ready prompt for external AI tools (Midjourney, Higgsfield, LTX, etc.). */
  aiGenerationPrompt?: string;
  aiNegativePrompt?: string;
  /** Catalog tool rank this prompt was formatted for. */
  recommendedToolRank?: number;
};

export type ShotSequence = {
  id: string;
  title: string;
  notes: string;
  sceneNumber: number | null;
  shots: PlannedShot[];
};

export type ShotPlanState = {
  sequences: ShotSequence[];
};

export type PostChecklistState = {
  items: ChecklistItem[];
  /** Notes for colorists — how to match approved look references. */
  gradeHandoffNotes?: string;
  /** Platform / delivery sign-off rows (separate from pipeline checklist). */
  deliverableChecks?: ChecklistItem[];
};

export type DirectorBudgetTier = "indie" | "mid" | "high";

export type DirectorRulesState = {
  styleNotes: string;
  preferredShots: string;
  budgetTier: DirectorBudgetTier;
  toneAndRefs: string;
  genreTags: string[];
  /** Free-form instructions for this prep run (e.g. tone mix, constraints). */
  projectInstructions: string;
};

export type ScreenplayState = {
  title: string;
  draftLabel: string;
  pageEstimate: number | null;
  rawText: string;
  /** ISO timestamp when script text was last pasted or imported. */
  lastImportedAt: string | null;
};

export type SceneRowStatus = "draft" | "approved";

export type SceneIntExt = "INT" | "EXT" | "INT/EXT" | "";

export type SceneDayNight = "DAY" | "NIGHT" | "DAWN" | "DUSK" | "";

export type SceneRow = {
  id: string;
  number: number;
  heading: string;
  oneLine: string;
  intExt: SceneIntExt;
  dayNight: SceneDayNight;
  visualRefs: string[];
  shotNotes: string;
  status: SceneRowStatus;
  linkedSequenceId: string | null;
};

export type DirectorPrepSnapshot = {
  id: string;
  label: string;
  createdAt: string;
  directorRules: DirectorRulesState;
  scenes: SceneRow[];
};

/** Cached output from the Script-to-Pre-Production Agent (external AI paste). */
export type PreProductionAgentMeta = {
  lastRunAt: string | null;
  executiveSummary: string;
  budgetSummaryText: string;
  visualMood: string;
};

export type AgentSuggestionStatus = "pending" | "approved" | "rejected";

export type StagedSceneSuggestion = {
  suggestionId: string;
  status: AgentSuggestionStatus;
  /** 0–100 heuristic from the sub-agent. */
  confidence: number;
  scene: SceneRow;
};

export type StagedShotSequenceSuggestion = {
  suggestionId: string;
  status: AgentSuggestionStatus;
  confidence: number;
  sceneNumber: number | null;
  title: string;
  notes: string;
};

export type LocationPin = {
  label: string;
  mapQuery: string;
  lat: number | null;
  lng: number | null;
};

export type LocationShootSuggestion = {
  id: string;
  title: string;
  why: string;
  mapQuery: string;
  status: AgentSuggestionStatus;
};

/** Committed location research from approved prep staging. */
export type LocationResearchRecord = {
  id: string;
  scriptName: string;
  sceneNumbers: number[];
  notes: string;
  pinnedPlace: LocationPin | null;
  shootSuggestions: Array<{
    id: string;
    title: string;
    why: string;
    mapQuery: string;
  }>;
  rulesAndLimitations: string[];
  updatedAt: string;
};

export type StagedLocationSuggestion = {
  suggestionId: string;
  status: AgentSuggestionStatus;
  confidence: number;
  name: string;
  notes: string;
  /** Scenes that use this location (quick prep / research). */
  sceneNumbers?: number[];
  /** Primary map search query for this script location. */
  mapQuery?: string;
  pinnedPlace?: LocationPin | null;
  shootSuggestions?: LocationShootSuggestion[];
  rulesAndLimitations?: string[];
};

export type StagedCharacterSuggestion = {
  suggestionId: string;
  status: AgentSuggestionStatus;
  confidence: number;
  name: string;
  notes: string;
};

export type StagedBudgetSuggestion = {
  suggestionId: string;
  status: AgentSuggestionStatus;
  confidence: number;
  tier: DirectorBudgetTier;
  summary: string;
  monthlyToolingUsdLow: number | null;
  monthlyToolingUsdHigh: number | null;
};

export type MoodBoardReference = {
  id: string;
  title: string;
  description: string;
  technicalNotes: string;
  whyItFits: string;
  filmReference: string;
};

export type VisualConsistencySeverity = "low" | "medium" | "high";

export type StagedVisualSuggestion = {
  suggestionId: string;
  status: AgentSuggestionStatus;
  confidence: number;
  mood: string;
  palette: string[];
  designNotes: string;
  referenceUrls: string[];
  /** Structured mood board entries from Visual Bible agent. */
  moodBoardReferences?: MoodBoardReference[];
  lensAndFraming?: string;
  grainAndTexture?: string;
  lightingApproach?: string;
};

/** Pending agent output awaiting per-item approval before commit. */
export type AgentStagingBundle = {
  runId: string;
  status: "review" | "committed";
  createdAt: string;
  executiveSummary: string;
  /** Offloaded long research — not stuffed into every sub-agent context. */
  researchNotes: string;
  scenes: StagedSceneSuggestion[];
  shotSequences: StagedShotSequenceSuggestion[];
  locations: StagedLocationSuggestion[];
  characters: StagedCharacterSuggestion[];
  budget: StagedBudgetSuggestion | null;
  visual: StagedVisualSuggestion | null;
  refineHint: string | null;
};

export type AgentMemoryDecision = {
  id: string;
  at: string;
  agent: string;
  summary: string;
  approved: boolean;
};

/** Cross-session project memory for context engineering. */
export type AgentProjectMemory = {
  decisions: AgentMemoryDecision[];
  compressedScriptSummary: string;
  lastScriptFingerprint: string;
  /** Distilled prefs for agents (auto-updated from approvals). */
  learnedPreferences: string[];
};

export type AgentProgressStep =
  | "script_analyzer"
  | "research"
  | "shot_list"
  | "budget"
  | "visual_bible"
  | "complete"
  | "error";

export type DirectorPrepState = {
  directorRules: DirectorRulesState;
  screenplay: ScreenplayState;
  scenes: SceneRow[];
  snapshots: DirectorPrepSnapshot[];
  agentMeta: PreProductionAgentMeta;
  agentStaging: AgentStagingBundle | null;
  agentMemory: AgentProjectMemory;
  prepRunSettings: PrepRunSettings;
  /** Last Director's Prep template applied (for UI label). */
  appliedTemplateId: string | null;
  /** Structured location research committed from prep review. */
  locationResearch: LocationResearchRecord[];
};

export type PrepRunSettings = {
  /** Features / TV — stronger compression + longer context window. */
  longScriptMode: boolean;
  /** Analyze only this excerpt (e.g. Act 2). Empty = full script. */
  analysisExcerpt: string;
};

/** Persisted workspace document stored in `project_state.state`. */
export type ProjectStatePayload = {
  schemaVersion: number;
  kit: unknown[];
  workflow: WorkflowState;
  budget: BudgetState;
  worldBible: WorldBibleState;
  visualBible: VisualBibleState;
  shotPlan: ShotPlanState;
  postChecklist: PostChecklistState;
  directorPrep: DirectorPrepState;
};

export type ProjectStateRow = {
  project_id: string;
  schema_version: number;
  state: ProjectStatePayload;
  updated_at: string;
};
