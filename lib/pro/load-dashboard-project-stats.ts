import type { SupabaseClient } from "@supabase/supabase-js";
import { getProjectCoverFromState, type ProjectCover } from "@/lib/pro/project-cover";
import { getProjectProgressStats } from "@/lib/pro/project-progress-stats";
import { workflowDisplayName } from "@/lib/pro/workflow-choices";
import { normalizeProjectState } from "@/lib/pro/validate-project-state";
import type { ProjectRow } from "@/lib/pro/types";

export type DashboardProjectRow = ProjectRow & {
  stats?: {
    approvedScenes: number;
    totalShots: number;
    percentComplete: number;
    promptsReady: number;
    totalPromptSlots: number;
    hasScript: boolean;
    hasLook: boolean;
    scriptToPrompt: boolean;
    workflowLabel: string;
    summaryLine: string;
  };
  cover?: ProjectCover;
};

export async function enrichProjectsWithStats(
  supabase: SupabaseClient,
  projects: ProjectRow[]
): Promise<DashboardProjectRow[]> {
  return Promise.all(
    projects.map(async (p) => {
      const { data } = await supabase
        .from("project_state")
        .select("state")
        .eq("project_id", p.id)
        .maybeSingle();

      if (!data?.state) return p;

      const state = normalizeProjectState(data.state);
      const stats = getProjectProgressStats(state);
      return {
        ...p,
        stats: {
          approvedScenes: stats.approvedScenes,
          totalShots: stats.totalShots,
          percentComplete: stats.percentComplete,
          promptsReady: stats.promptsReady,
          totalPromptSlots: stats.totalPromptSlots,
          hasScript: stats.hasScript,
          hasLook: stats.hasLook,
          scriptToPrompt: stats.scriptToPrompt,
          workflowLabel: workflowDisplayName(state.directorPrep.appliedTemplateId),
          summaryLine: stats.summaryLine,
        },
        cover: getProjectCoverFromState(state),
      };
    })
  );
}
