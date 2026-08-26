import { createUserDataClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeProjectState } from "@/lib/pro/validate-project-state";
import type { ProjectStatePayload } from "@/lib/pro/types";

export type ExportSnapshot = {
  projectId: string;
  projectName: string;
  state: ProjectStatePayload;
};

/** Authoritative cloud snapshot for exports (never localStorage). */
export async function loadExportSnapshot(
  projectId: string,
  userId: string
): Promise<ExportSnapshot | null> {
  const supabase = createUserDataClient(await createClient());

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();

  if (projectError || !project) return null;

  const { data: stateRow, error: stateError } = await supabase
    .from("project_state")
    .select("state")
    .eq("project_id", projectId)
    .maybeSingle();

  if (stateError || !stateRow) return null;

  return {
    projectId: String(project.id),
    projectName: String(project.name),
    state: normalizeProjectState(stateRow.state),
  };
}
