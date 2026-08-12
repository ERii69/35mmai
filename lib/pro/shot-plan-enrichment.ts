import { newPlannedShot } from "@/lib/pro/shot-plan";
import type { PlannedShot, ProjectStatePayload, ShotType } from "@/lib/pro/types";

const DEFAULT_DURATION: Partial<Record<ShotType, number>> = {
  establishing: 15,
  wide: 12,
  medium: 8,
  close_up: 6,
  extreme_close_up: 5,
  dolly: 10,
  handheld: 8,
  aerial: 12,
  pan: 8,
  tilt: 6,
  other: 8,
};

export function defaultDurationForShotType(shotType: ShotType): number {
  return DEFAULT_DURATION[shotType] ?? 8;
}

/** Parse "12s" or "12 sec" from agent labels. */
export function parseDurationFromLabel(label: string): number | null {
  const m = label.match(/(\d+)\s*(?:s|sec|seconds?)\b/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 && n <= 600 ? n : null;
}

export function visualBibleContextLine(state: ProjectStatePayload): string {
  return [
    state.visualBible.palette.slice(0, 3).join(", "),
    state.directorPrep.agentMeta.visualMood.trim(),
  ]
    .filter(Boolean)
    .join(" · ")
    .slice(0, 140);
}

export function enrichPlannedShot(
  shot: PlannedShot,
  state: ProjectStatePayload,
  sceneId?: string | null
): PlannedShot {
  const visualNote = visualBibleContextLine(state);
  const parsed = parseDurationFromLabel(shot.label);
  const lens = state.visualBible.lensAndFraming.trim();
  // Never copy designSheetNotes into lighting — those are prep essays (scene rhythm,
  // genre tags) and pollute every Finish → Prompts field via the prompt engine.
  const lighting = state.visualBible.grainAndTexture.trim().slice(0, 200);

  const ref =
    shot.visualRefUrl.trim() ||
    state.visualBible.referenceUrls[0] ||
    state.directorPrep.scenes.find((s) => s.id === sceneId)?.visualRefs[0] ||
    "";

  return {
    ...shot,
    durationSeconds:
      shot.durationSeconds > 0
        ? shot.durationSeconds
        : (parsed ?? defaultDurationForShotType(shot.shotType)),
    visualBibleNote: shot.visualBibleNote.trim() || visualNote,
    cameraNotes: shot.cameraNotes.trim() || lens,
    lightingNotes: shot.lightingNotes.trim() || lighting,
    visualRefUrl: ref,
    sceneId: sceneId ?? shot.sceneId,
    status: shot.status ?? "planned",
  };
}

/** Apply palette, lens, and lighting from Look tab to every shot. */
export function matchVisualBibleToShotPlan(state: ProjectStatePayload): ProjectStatePayload {
  const visualNote = visualBibleContextLine(state);
  const lens = state.visualBible.lensAndFraming.trim();
  const lighting = state.visualBible.grainAndTexture.trim().slice(0, 200);
  const defaultRef = state.visualBible.referenceUrls[0] ?? "";

  const sequences = state.shotPlan.sequences.map((seq) => {
    const scene = seq.sceneNumber != null
      ? state.directorPrep.scenes.find((s) => s.number === seq.sceneNumber)
      : undefined;
    const sceneRef = scene?.visualRefs[0] ?? "";

    return {
      ...seq,
      shots: seq.shots.map((shot) => ({
        ...shot,
        visualBibleNote: visualNote || shot.visualBibleNote,
        cameraNotes: lens || shot.cameraNotes,
        lightingNotes: lighting || shot.lightingNotes,
        visualRefUrl: shot.visualRefUrl.trim() || sceneRef || defaultRef,
      })),
    };
  });

  return { ...state, shotPlan: { sequences } };
}

export function enrichShotPlanState(state: ProjectStatePayload): ProjectStatePayload {
  const sequences = state.shotPlan.sequences.map((seq) => {
    const scene =
      seq.sceneNumber != null
        ? state.directorPrep.scenes.find((s) => s.number === seq.sceneNumber)
        : state.directorPrep.scenes.find((s) => s.linkedSequenceId === seq.id);
    return {
      ...seq,
      shots: seq.shots.map((shot) =>
        enrichPlannedShot(shot, state, scene?.id ?? shot.sceneId)
      ),
    };
  });
  return { ...state, shotPlan: { sequences } };
}

export const COVERAGE_SHOT_TYPES: ShotType[] = ["wide", "medium", "close_up"];

export function suggestMissingCoverageShots(
  sequenceShots: PlannedShot[],
  state: ProjectStatePayload,
  sceneId?: string | null
): PlannedShot[] {
  const existing = new Set(sequenceShots.map((s) => s.shotType));
  const visualNote = visualBibleContextLine(state);
  const labels: Record<ShotType, string> = {
    wide: "Wide master",
    medium: "Medium coverage",
    close_up: "Close-up",
    extreme_close_up: "ECU",
    establishing: "Establishing",
    dolly: "Dolly",
    pan: "Pan",
    tilt: "Tilt",
    handheld: "Handheld",
    aerial: "Aerial",
    other: "Insert",
  };

  return COVERAGE_SHOT_TYPES.filter((t) => !existing.has(t)).map((shotType) =>
    enrichPlannedShot(
      {
        ...newPlannedShot(shotType, labels[shotType]),
        visualBibleNote: visualNote,
      },
      state,
      sceneId
    )
  );
}
