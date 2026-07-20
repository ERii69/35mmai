import {
  PROJECT_STATE_SCHEMA_VERSION,
  type DirectorPrepState,
  DirectorRulesState,
  PreProductionAgentMeta,
  AgentProjectMemory,
  ProjectStatePayload,
} from "@/lib/pro/types";
import { createDefaultPrepRunSettings } from "@/lib/pro/prep-run-settings";

export function createEmptyDirectorRules(): DirectorRulesState {
  return {
    styleNotes: "",
    preferredShots: "",
    budgetTier: "indie",
    toneAndRefs: "",
    genreTags: [],
    projectInstructions: "",
  };
}

export function createEmptyAgentMeta(): PreProductionAgentMeta {
  return {
    lastRunAt: null,
    executiveSummary: "",
    budgetSummaryText: "",
    visualMood: "",
  };
}

export function createEmptyAgentMemory(): AgentProjectMemory {
  return {
    decisions: [],
    compressedScriptSummary: "",
    lastScriptFingerprint: "",
    learnedPreferences: [],
  };
}

export function createEmptyDirectorPrep(): DirectorPrepState {
  return {
    directorRules: createEmptyDirectorRules(),
    screenplay: {
      title: "",
      draftLabel: "",
      pageEstimate: null,
      rawText: "",
      lastImportedAt: null,
    },
    scenes: [],
    snapshots: [],
    agentMeta: createEmptyAgentMeta(),
    agentStaging: null,
    agentMemory: createEmptyAgentMemory(),
    prepRunSettings: createDefaultPrepRunSettings(),
    appliedTemplateId: null,
    locationResearch: [],
  };
}

export function createEmptyProjectState(): ProjectStatePayload {
  return {
    schemaVersion: PROJECT_STATE_SCHEMA_VERSION,
    kit: [],
    workflow: { stageIndex: 0, completedPhases: [] },
    budget: {
      microTools: [],
      lowTools: [],
      selectedRole: null,
      selectedBudget: null,
      currency: "USD",
    },
    worldBible: {
      notes: "",
      characters: [],
      locations: [],
    },
    visualBible: {
      designSheetNotes: "",
      referenceUrls: [],
      palette: [],
      lensAndFraming: "",
      grainAndTexture: "",
      moodBoardReferences: [],
      negativePromptNotes: "",
      consistencyChecklist: [],
    },
    shotPlan: {
      sequences: [],
    },
    postChecklist: {
      items: [],
    },
    directorPrep: createEmptyDirectorPrep(),
  };
}
