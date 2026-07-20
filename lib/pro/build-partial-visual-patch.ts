import type { ProjectStatePayload, StagedVisualSuggestion } from "@/lib/pro/types";
import type { MoodBoardSection } from "@/lib/pro/apply-mood-board-partial";

/** Minimal staged visual patch for a single mood-board section update. */
export function buildPartialVisualPatch(
  state: ProjectStatePayload,
  section: MoodBoardSection,
  fields: Partial<Pick<StagedVisualSuggestion, "lensAndFraming" | "grainAndTexture" | "mood" | "palette" | "moodBoardReferences">>
): StagedVisualSuggestion {
  const vb = state.visualBible;
  return {
    suggestionId: `partial-${section}-${Date.now()}`,
    status: "approved",
    confidence: 1,
    mood: fields.mood ?? state.directorPrep.agentMeta.visualMood,
    palette: fields.palette ?? vb.palette,
    designNotes: "",
    referenceUrls: vb.referenceUrls,
    moodBoardReferences: fields.moodBoardReferences ?? vb.moodBoardReferences,
    lensAndFraming: fields.lensAndFraming ?? vb.lensAndFraming,
    grainAndTexture: fields.grainAndTexture ?? vb.grainAndTexture,
  };
}
