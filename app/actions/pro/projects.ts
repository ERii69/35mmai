"use server";

import { revalidatePath } from "next/cache";
import { bootstrapDefaultProject } from "@/lib/pro/bootstrap-default-project";
import { requireProUser } from "@/lib/pro/require-pro-user";
import {
  buildTemplateState,
  DEFAULT_DIRECTOR_PREP_TEMPLATE_ID,
  isProTemplateId,
  type ProTemplateId,
} from "@/lib/pro/templates";
import { PROJECT_STATE_SCHEMA_VERSION, type ProjectRow } from "@/lib/pro/types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ProActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const MAX_PROJECT_NAME_LENGTH = 120;

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

function normalizeName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Project name is required.");
  if (trimmed.length > MAX_PROJECT_NAME_LENGTH) {
    throw new Error(`Project name must be at most ${MAX_PROJECT_NAME_LENGTH} characters.`);
  }
  return trimmed;
}

async function insertProjectWithState(
  supabase: Awaited<ReturnType<typeof requireProUser>>["supabase"],
  userId: string,
  name: string,
  isDefault: boolean,
  templateId: ProTemplateId = DEFAULT_DIRECTOR_PREP_TEMPLATE_ID
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

  const emptyState = buildTemplateState(templateId);
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

/** List non-archived projects, most recently opened first. */
export async function listProjects(): Promise<ProActionResult<ProjectRow[]>> {
  try {
    const { supabase, user } = await requireProUser();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("last_opened_at", { ascending: false });

    if (error) return { ok: false, error: error.message };
    return {
      ok: true,
      data: (data ?? []).map((row) => mapProject(row as Record<string, unknown>)),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to list projects." };
  }
}

/** Create a project and empty `project_state` row. */
export async function createProject(
  name: string,
  templateId?: ProTemplateId
): Promise<ProActionResult<ProjectRow>> {
  try {
    const { supabase, user } = await requireProUser();
    const projectName = normalizeName(name);
    const resolvedTemplateId =
      templateId && isProTemplateId(templateId)
        ? templateId
        : DEFAULT_DIRECTOR_PREP_TEMPLATE_ID;

    const { count } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("archived_at", null);

    const isFirst = (count ?? 0) === 0;
    const project = await insertProjectWithState(
      supabase,
      user.id,
      projectName,
      isFirst,
      resolvedTemplateId
    );
    revalidatePath("/pro/app");
    revalidatePath("/pro/app/workspace");
    return { ok: true, data: project };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to create project." };
  }
}

export async function renameProject(
  projectId: string,
  name: string
): Promise<ProActionResult<ProjectRow>> {
  try {
    const { supabase, user } = await requireProUser();
    const projectName = normalizeName(name);

    const { data, error } = await supabase
      .from("projects")
      .update({ name: projectName })
      .eq("id", projectId)
      .eq("user_id", user.id)
      .is("archived_at", null)
      .select()
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: "Project not found." };
    revalidatePath("/pro/app");
    return { ok: true, data: mapProject(data as Record<string, unknown>) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to rename project." };
  }
}

export async function archiveProject(projectId: string): Promise<ProActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireProUser();

    const { data: target, error: fetchError } = await supabase
      .from("projects")
      .select("id, is_default")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .is("archived_at", null)
      .maybeSingle();

    if (fetchError) return { ok: false, error: fetchError.message };
    if (!target) return { ok: false, error: "Project not found." };

    const { error } = await supabase
      .from("projects")
      .update({ archived_at: new Date().toISOString(), is_default: false })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) return { ok: false, error: error.message };

    if (target.is_default) {
      const { data: next } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user.id)
        .is("archived_at", null)
        .order("last_opened_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (next?.id) {
        await supabase
          .from("projects")
          .update({ is_default: true })
          .eq("id", next.id)
          .eq("user_id", user.id);
      }
    }

    revalidatePath("/pro/app");
    revalidatePath("/pro/app/archives");
    revalidatePath("/pro/app/workspace");
    return { ok: true, data: { id: projectId } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to archive project." };
  }
}

/** List archived projects, most recently archived first. */
export async function listArchivedProjects(): Promise<ProActionResult<ProjectRow[]>> {
  try {
    const { supabase, user } = await requireProUser();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false });

    if (error) return { ok: false, error: error.message };
    return {
      ok: true,
      data: (data ?? []).map((row) => mapProject(row as Record<string, unknown>)),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to list archived projects." };
  }
}

/** Restore an archived project to the active dashboard. */
export async function unarchiveProject(projectId: string): Promise<ProActionResult<ProjectRow>> {
  try {
    const { supabase, user } = await requireProUser();

    const { data: target, error: fetchError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .not("archived_at", "is", null)
      .maybeSingle();

    if (fetchError) return { ok: false, error: fetchError.message };
    if (!target) return { ok: false, error: "Archived project not found." };

    const { count } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("archived_at", null);

    const makeDefault = (count ?? 0) === 0;

    const { data, error } = await supabase
      .from("projects")
      .update({
        archived_at: null,
        is_default: makeDefault,
        last_opened_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: "Archived project not found." };

    revalidatePath("/pro/app");
    revalidatePath("/pro/app/archives");
    revalidatePath("/pro/app/workspace");
    return { ok: true, data: mapProject(data as Record<string, unknown>) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to restore project." };
  }
}

/** Set the user's default project (opens first from dashboard / workspace index). */
export async function setDefaultProject(projectId: string): Promise<ProActionResult<ProjectRow>> {
  try {
    const { supabase, user } = await requireProUser();

    const { data: target, error: fetchError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .is("archived_at", null)
      .maybeSingle();

    if (fetchError) return { ok: false, error: fetchError.message };
    if (!target) return { ok: false, error: "Project not found." };

    const { error: clearError } = await supabase
      .from("projects")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .is("archived_at", null);

    if (clearError) return { ok: false, error: clearError.message };

    const { data, error } = await supabase
      .from("projects")
      .update({ is_default: true })
      .eq("id", projectId)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: "Project not found." };
    revalidatePath("/pro/app");
    revalidatePath("/pro/app/workspace");
    return { ok: true, data: mapProject(data as Record<string, unknown>) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to set default project.",
    };
  }
}

/** Mark project as recently opened (active for UI). */
export async function setActiveProject(projectId: string): Promise<ProActionResult<ProjectRow>> {
  try {
    const { supabase, user } = await requireProUser();

    const { data, error } = await supabase
      .from("projects")
      .update({ last_opened_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("user_id", user.id)
      .is("archived_at", null)
      .select()
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: "Project not found." };
    return { ok: true, data: mapProject(data as Record<string, unknown>) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to set active project." };
  }
}

function deleteDbClient(userClient: SupabaseClient): SupabaseClient {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    try {
      return createAdminClient();
    } catch {
      return userClient;
    }
  }
  return userClient;
}

/** Permanently delete a project and its cloud state (cannot be undone). Works for active or archived projects. */
export async function deleteProject(projectId: string): Promise<ProActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireProUser();

    const { data: target, error: fetchError } = await supabase
      .from("projects")
      .select("id, is_default, archived_at")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) return { ok: false, error: fetchError.message };
    if (!target) return { ok: false, error: "Project not found." };

    const db = deleteDbClient(supabase);

    if (target.is_default && !target.archived_at) {
      await db
        .from("projects")
        .update({ is_default: false })
        .eq("id", projectId)
        .eq("user_id", user.id);

      const { data: next } = await db
        .from("projects")
        .select("id")
        .eq("user_id", user.id)
        .is("archived_at", null)
        .neq("id", projectId)
        .order("last_opened_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (next?.id) {
        const { error: defaultError } = await db
          .from("projects")
          .update({ is_default: true })
          .eq("id", next.id)
          .eq("user_id", user.id);

        if (defaultError) return { ok: false, error: defaultError.message };
      }
    }

    const { error: stateError } = await db.from("project_state").delete().eq("project_id", projectId);

    if (stateError) return { ok: false, error: stateError.message };

    const { data: deleted, error: deleteError } = await db
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (deleteError) return { ok: false, error: deleteError.message };
    if (!deleted) {
      return {
        ok: false,
        error:
          "Delete blocked by database permissions. Add SUPABASE_SERVICE_ROLE_KEY to .env.local or run migration 20260213000006_project_state_delete.sql in Supabase.",
      };
    }

    revalidatePath("/pro/app");
    revalidatePath("/pro/app/archives");
    revalidatePath("/pro/app/workspace");
    return { ok: true, data: { id: projectId } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete project." };
  }
}

/**
 * Ensure the user has at least one project (first visit / post-subscribe).
 * Safe to call on every `/pro/app` load.
 */
export async function ensureDefaultProject(): Promise<ProActionResult<ProjectRow | null>> {
  try {
    const { supabase, user } = await requireProUser();
    const result = await bootstrapDefaultProject(supabase, user.id);
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true, data: result.project };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to ensure default project.",
    };
  }
}
