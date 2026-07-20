import { enrichPlannedShot, enrichShotPlanState } from "@/lib/pro/shot-plan-enrichment";
import { inferShotsFromNotes } from "@/lib/pro/generate-shot-plan-from-prep";
import { defaultCoverageShots } from "@/lib/pro/shot-plan";
import type { PlannedShot, ProjectStatePayload, ShotSequence } from "@/lib/pro/types";

function enrichShots(shots: PlannedShot[], state: ProjectStatePayload, sceneId: string | null) {
  return shots.map((s) => enrichPlannedShot(s, state, sceneId));
}

/** Ensure legacy sequences (title + notes only) get structured shots for the visual UI. */
export function migrateShotPlanLegacy(state: ProjectStatePayload): ProjectStatePayload {
  const visualNote = [
    state.visualBible.palette.slice(0, 3).join(", "),
    state.directorPrep.agentMeta.visualMood.trim(),
  ]
    .filter(Boolean)
    .join(" · ")
    .slice(0, 140);

  let changed = false;
  const sequences: ShotSequence[] = state.shotPlan.sequences.map((seq) => {
    const scene =
      seq.sceneNumber != null
        ? state.directorPrep.scenes.find((s) => s.number === seq.sceneNumber)
        : state.directorPrep.scenes.find((s) => s.linkedSequenceId === seq.id);
    const sceneId = scene?.id ?? null;

    if (!seq.shots?.length) {
      changed = true;
      const shots = seq.notes.trim()
        ? inferShotsFromNotes(seq.notes, visualNote)
        : defaultCoverageShots(visualNote);
      return {
        ...seq,
        sceneNumber: seq.sceneNumber ?? null,
        shots: enrichShots(shots, state, sceneId),
      };
    }

    const needsEnrich = seq.shots.some(
      (s) => !s.durationSeconds || !s.status || s.cameraNotes === undefined
    );
    if (needsEnrich) changed = true;

    return {
      ...seq,
      sceneNumber: seq.sceneNumber ?? null,
      shots: enrichShots(seq.shots, state, sceneId),
    };
  });

  const next = { ...state, shotPlan: { sequences } };
  if (!changed) return enrichShotPlanState(state);
  return enrichShotPlanState(next);
}
