import { areProAgentsEnabled } from "@/lib/pro/launch-flags";
import { createUserDataClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeProjectState } from "@/lib/pro/validate-project-state";
import { createEmptyProjectState } from "@/lib/pro/project-state-defaults";
import { PROJECT_STATE_SCHEMA_VERSION, type ProjectRow, type ProjectStatePayload } from "@/lib/pro/types";

export type WorkspacePageData = {
  project: ProjectRow;
  state: ProjectStatePayload;
  updatedAt: string;
  claudeAgentsEnabled: boolean;
};

function mapProject(row: Record<string, unknown>): ProjectRow {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    name: String(row.name),
    is_default: Boolean(row.is_default),
    archived_at: (row.archived_at as string | null) ?? null,
    last_opened_at: String(row.last_opened_at),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function getWorkspacePageData(
  projectId: string
): Promise<WorkspacePageData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createUserDataClient(supabase);

  const { data: project, error: projectError } = await db
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("archived_at", null)
    .maybeSingle();

  if (projectError || !project) return null;

  await db
    .from("projects")
    .update({ last_opened_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("user_id", user.id);

  const { data: stateRow, error: stateError } = await db
    .from("project_state")
    .select("state, updated_at, schema_version")
    .eq("project_id", projectId)
    .maybeSingle();

  if (stateError) return null;

  let state: ProjectStatePayload;
  let updatedAt: string;

  if (!stateRow) {
    state = createEmptyProjectState();
    updatedAt = new Date().toISOString();
    await db.from("project_state").insert({
      project_id: projectId,
      schema_version: PROJECT_STATE_SCHEMA_VERSION,
      state,
    });
  } else {
    state = normalizeProjectState(stateRow.state);
    updatedAt = String(stateRow.updated_at);
  }

  return {
    project: mapProject(project as Record<string, unknown>),
    state,
    updatedAt,
    claudeAgentsEnabled: areProAgentsEnabled(),
  };
}
