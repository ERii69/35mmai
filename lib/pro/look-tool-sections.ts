import type { ProjectStatePayload } from "@/lib/pro/types";

/** Mood-board areas mapped to external AI tools. */
export type LookToolSection = "mood" | "lens" | "grain" | "palette";

export const LOOK_TOOL_SECTION_LABELS: Record<LookToolSection, string> = {
  mood: "Mood & references",
  lens: "Lens & framing",
  grain: "Grain & texture",
  palette: "Palette & grade",
};

export const LOOK_TOOL_SECTION_HINTS: Record<LookToolSection, string> = {
  mood: "Find or generate stills that match this tone",
  lens: "Apply camera profile and lens language from your bible",
  grain: "Finish, grain, and texture cleanup",
  palette: "Grade toward your palette swatches",
};

function hasMoodContent(state: ProjectStatePayload): boolean {
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  const tone = state.directorPrep.directorRules.toneAndRefs.trim();
  const refs = state.visualBible.moodBoardReferences.length;
  const filmRefs = state.visualBible.referenceUrls.filter((u) => !u.startsWith("data:image")).length;
  return mood.length > 0 || tone.length > 0 || refs > 0 || filmRefs > 0;
}

function hasLensContent(state: ProjectStatePayload): boolean {
  return state.visualBible.lensAndFraming.trim().length > 0;
}

function hasGrainContent(state: ProjectStatePayload): boolean {
  return state.visualBible.grainAndTexture.trim().length > 0;
}

function hasPaletteContent(state: ProjectStatePayload): boolean {
  return state.visualBible.palette.length > 0;
}

export function getFilledLookSections(state: ProjectStatePayload): LookToolSection[] {
  const out: LookToolSection[] = [];
  if (hasMoodContent(state)) out.push("mood");
  if (hasLensContent(state)) out.push("lens");
  if (hasGrainContent(state)) out.push("grain");
  if (hasPaletteContent(state)) out.push("palette");
  return out;
}

/** Strip appears when the mood board has at least two defined look areas. */
export function shouldShowLookToolStrip(state: ProjectStatePayload): boolean {
  return getFilledLookSections(state).length >= 2;
}
