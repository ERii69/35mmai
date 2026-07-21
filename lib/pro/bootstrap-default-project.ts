import type { SupabaseClient } from "@supabase/supabase-js";
import { createEmptyProjectState } from "@/lib/pro/project-state-defaults";
import { buildTemplateState, DEFAULT_DIRECTOR_PREP_TEMPLATE_ID } from "@/lib/pro/templates";
import { PROJECT_STATE_SCHEMA_VERSION, type ProjectRow } from "@/lib/pro/types";

const DEFAULT_PROJECT_NAME = "My first project";

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

async function insertProjectWithState(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  isDefault: boolean
): Promise<ProjectRow> {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      name,
      is_default: isDefault,
      last_opened_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Could not create project.");
  }

  const emptyState = buildTemplateState(DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
  const { error: stateError } = await supabase.from("project_state").insert({
    project_id: project.id,
    schema_version: PROJECT_STATE_SCHEMA_VERSION,
    state: emptyState,
  });

  if (stateError) {
    await supabase.from("projects").delete().eq("id", project.id);
    throw new Error(stateError.message);
  }

  return mapProject(project as Record<string, unknown>);
}

export type BootstrapResult =
  | { ok: true; project: ProjectRow }
  | { ok: false; error: string };

/**
 * Ensure exactly one active project is marked default when the user has projects
 * but none is flagged (legacy data, manual DB edits, or race after archive).
 */
export async function ensureDefaultProjectFlag(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, is_default")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("last_opened_at", { ascending: false });

  if (error || !projects?.length) return;
  if (projects.some((p) => p.is_default)) return;

  await supabase
    .from("projects")
    .update({ is_default: true })
    .eq("id", projects[0]!.id)
    .eq("user_id", userId);
}

/**
 * Ensure at least one active project exists for this user. Call from `/pro/app` layout
 * with the same Supabase server client + session user id.
 */
export async function bootstrapDefaultProject(
  supabase: SupabaseClient,
  userId: string
): Promise<BootstrapResult> {
  const { data: existing, error: listError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("last_opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (listError) {
    return { ok: false, error: listError.message };
  }

  if (existing) {
    await ensureDefaultProjectFlag(supabase, userId);
    return { ok: true, project: mapProject(existing as Record<string, unknown>) };
  }

  try {
    const project = await insertProjectWithState(supabase, userId, DEFAULT_PROJECT_NAME, true);
    return { ok: true, project };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not create default project.",
    };
  }
}

/** List active projects for dashboard (same session). */
export async function listProjectsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<{ projects: ProjectRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("last_opened_at", { ascending: false });

  if (error) {
    return { projects: [], error: error.message };
  }

  return {
    projects: (data ?? []).map((row) => mapProject(row as Record<string, unknown>)),
    error: null,
  };
}

/** Count archived projects for nav badge. */
export async function countArchivedProjectsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("archived_at", "is", null);

  if (error) return 0;
  return count ?? 0;
}
