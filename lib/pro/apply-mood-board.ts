import type { ProjectStatePayload, StagedVisualSuggestion } from "@/lib/pro/types";

type VisualPatch = Pick<
  StagedVisualSuggestion,
  | "mood"
  | "palette"
  | "designNotes"
  | "referenceUrls"
  | "moodBoardReferences"
  | "lensAndFraming"
  | "grainAndTexture"
  | "lightingApproach"
>;

/** Merge agent or local mood-board output into workspace visual bible. */
export function applyMoodBoardToState(
  state: ProjectStatePayload,
  visual: VisualPatch
): ProjectStatePayload {
  const now = new Date().toISOString();
  const refUrls = [...state.visualBible.referenceUrls];
  for (const r of visual.referenceUrls) {
    const t = r.trim();
    if (!t) continue;
    if (!refUrls.includes(t)) refUrls.push(t);
  }

  const designParts = [
    state.visualBible.designSheetNotes.trim(),
    visual.designNotes.trim(),
    visual.mood.trim() ? `## Mood\n${visual.mood.trim()}` : "",
  ].filter(Boolean);

  const defaultChecklist = [
    { id: "vb-palette", label: "Palette locked for all exterior scenes", done: false },
    { id: "vb-lens", label: "Lens / framing rules match shot list", done: false },
    { id: "vb-grain", label: "Grain & texture consistent in references", done: false },
  ];

  const checklist =
    state.visualBible.consistencyChecklist.length > 0
      ? state.visualBible.consistencyChecklist
      : defaultChecklist;

  return {
    ...state,
    visualBible: {
      ...state.visualBible,
      designSheetNotes: designParts.join("\n\n"),
      palette: visual.palette.length ? visual.palette : state.visualBible.palette,
      lensAndFraming:
        visual.lensAndFraming?.trim() || state.visualBible.lensAndFraming,
      grainAndTexture:
        visual.grainAndTexture?.trim() || state.visualBible.grainAndTexture,
      moodBoardReferences:
        visual.moodBoardReferences?.length
          ? visual.moodBoardReferences
          : state.visualBible.moodBoardReferences,
      referenceUrls: refUrls.slice(0, 24),
      consistencyChecklist: checklist,
    },
    directorPrep: {
      ...state.directorPrep,
      agentMeta: {
        ...state.directorPrep.agentMeta,
        lastRunAt: now,
        visualMood: visual.mood.trim() || state.directorPrep.agentMeta.visualMood,
      },
    },
  };
}
