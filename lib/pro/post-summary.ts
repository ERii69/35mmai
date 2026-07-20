import { kitEntriesFromState } from "@/lib/pro/kit-display";
import { countPostToolsInKit, suggestPostKitRanks } from "@/lib/pro/post-kit";
import { POST_PRODUCTION_STAGE_INDEX } from "@/lib/pro/post-workflow";
import type { ProjectStatePayload } from "@/lib/pro/types";

export type PostSummaryStrip = {
  lookLine: string | null;
  shotLine: string | null;
  kitLine: string;
  checklistPct: number;
  checklistDone: number;
  checklistTotal: number;
  workflowStageLabel: string;
  workflowPhaseComplete: boolean;
};

export function buildPostSummaryStrip(state: ProjectStatePayload): PostSummaryStrip {
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  const tone = state.directorPrep.directorRules.toneAndRefs.trim();
  const lookLine =
    mood || tone
      ? [mood, tone].filter(Boolean).join(" · ").slice(0, 96) +
        ([mood, tone].filter(Boolean).join(" · ").length > 96 ? "…" : "")
      : state.visualBible.palette.length > 0
        ? `Palette: ${state.visualBible.palette.slice(0, 3).join(", ")}`
        : null;

  const shotCount = state.shotPlan.sequences.flatMap((s) => s.shots).length;
  const shotLine =
    shotCount > 0
      ? `${shotCount} planned shot${shotCount === 1 ? "" : "s"}`
      : state.directorPrep.scenes.some((s) => s.status === "approved")
        ? `${state.directorPrep.scenes.filter((s) => s.status === "approved").length} approved scenes`
        : null;

  const postKitCount = countPostToolsInKit(state);
  const suggestedCount = suggestPostKitRanks(state).length;
  const kitTotal = kitEntriesFromState(state.kit).length;
  const kitLine =
    postKitCount > 0
      ? `${postKitCount} post tool${postKitCount === 1 ? "" : "s"} in My Kit`
      : kitTotal > 0
        ? `${kitTotal} tools in My Kit · ${suggestedCount} post picks available`
        : `${suggestedCount} post tools suggested`;

  const items = state.postChecklist.items;
  const checklistDone = items.filter((i) => i.done).length;
  const checklistTotal = items.length;
  const checklistPct =
    checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  const completedPhases = state.workflow.completedPhases ?? [];
  const workflowPhaseComplete = completedPhases.includes(POST_PRODUCTION_STAGE_INDEX);

  return {
    lookLine,
    shotLine,
    kitLine,
    checklistPct,
    checklistDone,
    checklistTotal,
    workflowStageLabel: "Post-production pipeline",
    workflowPhaseComplete,
  };
}
