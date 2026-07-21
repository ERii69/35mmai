import { appendMemoryDecision } from "@/lib/pro/append-memory-decision";
import type { PlannedShot, ProjectStatePayload, ShotProductionStatus } from "@/lib/pro/types";

/** Feed shot status changes into project memory for future agent runs. */
export function recordShotStatusMemory(
  state: ProjectStatePayload,
  shot: PlannedShot,
  previousStatus: ShotProductionStatus,
  nextStatus: ShotProductionStatus
): ProjectStatePayload {
  if (previousStatus === nextStatus) return state;
  const approved = nextStatus === "approved";
  const rejected = previousStatus === "approved" && nextStatus !== "approved";

  if (!approved && !rejected) return state;

  const memory = appendMemoryDecision(
    state.directorPrep.agentMemory,
    {
      agent: "shot_planner",
      summary: approved
        ? `Approved shot: ${shot.label} (${shot.shotType})`
        : `Unapproved shot: ${shot.label} (${shot.shotType})`,
      approved,
    },
    state.directorPrep.directorRules
  );

  return {
    ...state,
    directorPrep: { ...state.directorPrep, agentMemory: memory },
  };
}
