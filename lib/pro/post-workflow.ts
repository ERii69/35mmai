import { getToolByRank, workflowStages } from "@/app/data";
import type { ChecklistItem } from "@/lib/pro/types";

/** workflowStages index for Post-Production (Editing → VFX → Sound → Color). */
export const POST_PRODUCTION_STAGE_INDEX = 2;

/** Pre-production + production only — post lives under the Post workspace. */
export const PRE_PRODUCE_STAGE_INDICES = [0, 1] as const;

export function getPostProductionStage() {
  return workflowStages[POST_PRODUCTION_STAGE_INDEX]!;
}

export function getPreProduceStages() {
  return PRE_PRODUCE_STAGE_INDICES.map((i) => workflowStages[i]!);
}

export type PostChecklistWorkflowKey =
  | "assembly"
  | "vfx"
  | "color"
  | "sound"
  | "music"
  | "export"
  | "custom";

const CHECKLIST_WORKFLOW_TOOLS: Record<PostChecklistWorkflowKey, number[]> = {
  assembly: [15, 7, 51],
  vfx: [2, 8, 9],
  color: [1],
  sound: [3],
  music: [3],
  export: [2, 6, 5],
  custom: [],
};

export function workflowKeyForChecklistItem(item: ChecklistItem): PostChecklistWorkflowKey {
  if (item.id.startsWith("post-assembly")) return "assembly";
  if (item.id.startsWith("post-vfx")) return "vfx";
  if (item.id.startsWith("post-color") || item.id.startsWith("post-look")) return "color";
  if (item.id.startsWith("post-sound")) return "sound";
  if (item.id.startsWith("post-music")) return "music";
  if (item.id.startsWith("post-export")) return "export";
  return "custom";
}

export function toolsForChecklistItem(item: ChecklistItem) {
  const key = workflowKeyForChecklistItem(item);
  return CHECKLIST_WORKFLOW_TOOLS[key]
    .map((rank) => getToolByRank(rank))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
}

export function postWorkflowStepLabel(key: PostChecklistWorkflowKey): string | null {
  const stage = getPostProductionStage();
  const map: Partial<Record<PostChecklistWorkflowKey, string>> = {
    assembly: "3.1 Editing & Assembly",
    vfx: "3.2 Visual Effects & Enhancement",
    color: "3.4 Color Grading",
    sound: "3.3 Sound Design & Dubbing",
    music: "3.3 Sound Design & Dubbing",
  };
  if (map[key]) return map[key]!;
  if (key === "export") return "4.1 Marketing Assets";
  return null;
}
