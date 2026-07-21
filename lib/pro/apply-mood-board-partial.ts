import type { MoodBoardReference, ProjectStatePayload, StagedVisualSuggestion } from "@/lib/pro/types";

export type MoodBoardSection = "mood" | "palette" | "references" | "designNotes" | "lens" | "grain";

export type MoodBoardPartialOptions = {
  /** Replace one reference tile by id (used by per-tile regenerate). */
  replaceReferenceId?: string;
};

/** Merge only selected mood-board fields into visual bible. */
export function applyMoodBoardPartial(
  state: ProjectStatePayload,
  visual: Pick<
    StagedVisualSuggestion,
    | "mood"
    | "palette"
    | "designNotes"
    | "referenceUrls"
    | "moodBoardReferences"
    | "lensAndFraming"
    | "grainAndTexture"
    | "lightingApproach"
  >,
  sections: MoodBoardSection[],
  opts?: MoodBoardPartialOptions
): ProjectStatePayload {
  const now = new Date().toISOString();
  let visualBible = { ...state.visualBible };
  let agentMeta = { ...state.directorPrep.agentMeta, lastRunAt: now };

  if (sections.includes("mood") && visual.mood.trim()) {
    agentMeta = { ...agentMeta, visualMood: visual.mood.trim() };
  }
  if (sections.includes("designNotes") && visual.designNotes.trim()) {
    visualBible = {
      ...visualBible,
      designSheetNotes: [visualBible.designSheetNotes.trim(), visual.designNotes.trim()]
        .filter(Boolean)
        .join("\n\n"),
    };
  }
  if (sections.includes("lens") && visual.lensAndFraming?.trim()) {
    visualBible = { ...visualBible, lensAndFraming: visual.lensAndFraming.trim() };
  }
  if (sections.includes("grain") && visual.grainAndTexture?.trim()) {
    visualBible = { ...visualBible, grainAndTexture: visual.grainAndTexture.trim() };
  }
  if (sections.includes("designNotes")) {
    if (visual.lensAndFraming?.trim() && !sections.includes("lens")) {
      visualBible = { ...visualBible, lensAndFraming: visual.lensAndFraming.trim() };
    }
    if (visual.grainAndTexture?.trim() && !sections.includes("grain")) {
      visualBible = { ...visualBible, grainAndTexture: visual.grainAndTexture.trim() };
    }
  }
  if (sections.includes("palette") && visual.palette.length) {
    visualBible = { ...visualBible, palette: visual.palette };
  }
  if (sections.includes("references")) {
    if (visual.referenceUrls.length) {
      const refs = [...visualBible.referenceUrls];
      for (const r of visual.referenceUrls) {
        if (!refs.includes(r)) refs.push(r);
      }
      visualBible = { ...visualBible, referenceUrls: refs.slice(0, 24) };
    }
    const incoming = visual.moodBoardReferences ?? [];
    if (incoming.length) {
      if (opts?.replaceReferenceId) {
        const idx = visualBible.moodBoardReferences.findIndex((r) => r.id === opts.replaceReferenceId);
        const replacement = incoming[0];
        if (idx >= 0 && replacement) {
          const next = [...visualBible.moodBoardReferences];
          next[idx] = { ...replacement, id: next[idx]!.id };
          visualBible = { ...visualBible, moodBoardReferences: next };
        } else {
          visualBible = { ...visualBible, moodBoardReferences: incoming.slice(0, 8) };
        }
      } else {
        visualBible = { ...visualBible, moodBoardReferences: incoming.slice(0, 8) };
      }
    }
  }

  return {
    ...state,
    visualBible,
    directorPrep: { ...state.directorPrep, agentMeta },
  };
}
