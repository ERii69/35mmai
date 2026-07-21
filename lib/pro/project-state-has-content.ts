import { createEmptyProjectState } from "@/lib/pro/project-state-defaults";
import type { ProjectStatePayload } from "@/lib/pro/types";

/** True when the workspace has user-visible content worth warning before template overwrite. */
export function projectStateHasContent(state: ProjectStatePayload): boolean {
  const empty = createEmptyProjectState();

  if (state.kit.length > 0) return true;
  if (state.workflow.stageIndex !== empty.workflow.stageIndex) return true;

  const b = state.budget;
  if (b.microTools.length > 0 || b.lowTools.length > 0) return true;
  if (b.selectedRole || b.selectedBudget) return true;
  if (b.currency !== empty.budget.currency) return true;

  const w = state.worldBible;
  if (w.notes.trim() || w.characters.length > 0 || w.locations.length > 0) return true;

  const v = state.visualBible;
  if (
    v.designSheetNotes.trim() ||
    v.referenceUrls.length > 0 ||
    v.palette.length > 0 ||
    v.lensAndFraming.trim() ||
    v.grainAndTexture.trim() ||
    v.negativePromptNotes.trim() ||
    v.consistencyChecklist.length > 0
  ) {
    return true;
  }

  if (state.shotPlan.sequences.length > 0) return true;
  if (state.postChecklist.items.length > 0) return true;

  const dp = state.directorPrep;
  const emptyDp = empty.directorPrep;
  const rules = dp.directorRules;
  const emptyRules = emptyDp.directorRules;
  if (
    rules.styleNotes.trim() ||
    rules.preferredShots.trim() ||
    rules.toneAndRefs.trim() ||
    rules.budgetTier !== emptyRules.budgetTier ||
    rules.genreTags.length > 0
  ) {
    return true;
  }

  const sp = dp.screenplay;
  if (
    sp.title.trim() ||
    sp.draftLabel.trim() ||
    sp.rawText.trim() ||
    sp.pageEstimate !== null ||
    sp.lastImportedAt
  ) {
    return true;
  }

  if (dp.scenes.length > 0 || dp.snapshots.length > 0) return true;

  return false;
}

/** True when Director's Prep alone has user-visible work (for Prep template collapse). */
export function directorPrepHasContent(state: ProjectStatePayload): boolean {
  const dp = state.directorPrep;
  const emptyDp = createEmptyProjectState().directorPrep;
  const rules = dp.directorRules;
  const emptyRules = emptyDp.directorRules;

  if (
    rules.styleNotes.trim() ||
    rules.preferredShots.trim() ||
    rules.toneAndRefs.trim() ||
    rules.budgetTier !== emptyRules.budgetTier ||
    rules.genreTags.length > 0
  ) {
    return true;
  }

  const sp = dp.screenplay;
  if (
    sp.title.trim() ||
    sp.draftLabel.trim() ||
    sp.rawText.trim() ||
    sp.pageEstimate !== null ||
    sp.lastImportedAt
  ) {
    return true;
  }

  if (dp.scenes.length > 0 || dp.snapshots.length > 0) return true;
  if (dp.agentStaging?.scenes.length) return true;

  return false;
}
