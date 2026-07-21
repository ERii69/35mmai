import { COVERAGE_SHOT_TYPES } from "@/lib/pro/shot-plan-enrichment";
import type { PlannedShot, ProjectStatePayload, ShotType } from "@/lib/pro/types";

const SHOTS_PER_SHOOT_DAY = 15;
const SECONDS_PER_SHOOT_DAY = 8 * 3600;

export type ShotPlanProductionSummary = {
  totalShots: number;
  totalSequences: number;
  estimatedShootDays: number;
  totalDurationMinutes: number;
  coveragePercent: number;
  statusCounts: Record<PlannedShot["status"], number>;
  approvedSceneCount: number;
  linkedSceneCount: number;
};

function sceneCoverageScore(shots: PlannedShot[]): number {
  if (shots.length === 0) return 0;
  const types = new Set(shots.map((s) => s.shotType));
  const hits = COVERAGE_SHOT_TYPES.filter((t) => types.has(t)).length;
  return hits / COVERAGE_SHOT_TYPES.length;
}

export function getShotPlanProductionSummary(state: ProjectStatePayload): ShotPlanProductionSummary {
  const sequences = state.shotPlan.sequences;
  const allShots = sequences.flatMap((s) => s.shots);
  const approvedScenes = state.directorPrep.scenes.filter((s) => s.status === "approved");

  const statusCounts: ShotPlanProductionSummary["statusCounts"] = {
    planned: 0,
    storyboarded: 0,
    shot: 0,
    approved: 0,
  };
  for (const shot of allShots) {
    statusCounts[shot.status] = (statusCounts[shot.status] ?? 0) + 1;
  }

  const totalDurationSeconds = allShots.reduce((n, s) => n + Math.max(0, s.durationSeconds), 0);
  const byDurationDays = totalDurationSeconds / SECONDS_PER_SHOOT_DAY;
  const byCountDays = allShots.length / SHOTS_PER_SHOOT_DAY;
  const estimatedShootDays = Math.max(
    byDurationDays,
    byCountDays,
    sequences.length > 0 ? 0.5 : 0
  );

  let coverageSum = 0;
  let coverageDen = 0;

  if (approvedScenes.length > 0) {
    for (const scene of approvedScenes) {
      const seq =
        sequences.find((s) => s.sceneNumber === scene.number) ??
        (scene.linkedSequenceId
          ? sequences.find((s) => s.id === scene.linkedSequenceId)
          : undefined);
      coverageSum += sceneCoverageScore(seq?.shots ?? []);
      coverageDen += 1;
    }
  } else if (sequences.length > 0) {
    for (const seq of sequences) {
      coverageSum += sceneCoverageScore(seq.shots);
      coverageDen += 1;
    }
  }

  const linkedSceneCount = new Set(
    sequences.map((s) => s.sceneNumber).filter((n): n is number => n != null)
  ).size;

  return {
    totalShots: allShots.length,
    totalSequences: sequences.length,
    estimatedShootDays: Math.round(estimatedShootDays * 10) / 10,
    totalDurationMinutes: Math.round(totalDurationSeconds / 60),
    coveragePercent: coverageDen > 0 ? Math.round((coverageSum / coverageDen) * 100) : 0,
    statusCounts,
    approvedSceneCount: approvedScenes.length,
    linkedSceneCount,
  };
}

export type CoverageGap = {
  sequenceId: string;
  sequenceTitle: string;
  missingTypes: ShotType[];
};

/** Sequences missing wide / medium / close-up coverage. */
export function getCoverageGaps(state: ProjectStatePayload): CoverageGap[] {
  const gaps: CoverageGap[] = [];
  for (const seq of state.shotPlan.sequences) {
    if (seq.shots.length === 0) continue;
    const types = new Set(seq.shots.map((s) => s.shotType));
    const missing = COVERAGE_SHOT_TYPES.filter((t) => !types.has(t));
    if (missing.length > 0) {
      gaps.push({
        sequenceId: seq.id,
        sequenceTitle: seq.title,
        missingTypes: missing,
      });
    }
  }
  return gaps;
}

export function kitHintFromShotTypes(shots: PlannedShot[]): string[] {
  const types = new Set(shots.map((s) => s.shotType));
  const hints: string[] = [];
  if (types.has("aerial")) hints.push("Drone / aerial platform");
  if (types.has("dolly")) hints.push("Slider or dolly");
  if (types.has("handheld")) hints.push("Gimbal / stabilizer");
  if (shots.some((s) => s.cameraNotes.toLowerCase().includes("anamorphic"))) {
    hints.push("Anamorphic lens rental");
  }
  return hints.slice(0, 4);
}
