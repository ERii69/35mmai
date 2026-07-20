"use server";

import { requireProUser } from "@/lib/pro/require-pro-user";
import { prepareProjectStateForCloudSave } from "@/lib/pro/slim-project-state";
import { normalizeProjectState, validateProjectStatePayload } from "@/lib/pro/validate-project-state";
import { createEmptyProjectState } from "@/lib/pro/project-state-defaults";
import {
  PROJECT_STATE_SCHEMA_VERSION,
  type ProjectStatePayload,
  type ProjectStateRow,
} from "@/lib/pro/types";
import type { ProActionResult } from "@/app/actions/pro/projects";

async function assertProjectOwned(
  supabase: Awaited<ReturnType<typeof requireProUser>>["supabase"],
  userId: string,
  projectId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data?.id);
}

export async function loadProjectState(
  projectId: string
): Promise<ProActionResult<ProjectStateRow>> {
  try {
    const { supabase, user } = await requireProUser();
    const owned = await assertProjectOwned(supabase, user.id, projectId);
    if (!owned) return { ok: false, error: "Project not found." };

    const { data, error } = await supabase
      .from("project_state")
      .select("project_id, schema_version, state, updated_at")
      .eq("project_id", projectId)
      .maybeSingle();

    if (error) return { ok: false, error: error.message };

    if (!data) {
      const empty = createEmptyProjectState();
      const { error: insertError } = await supabase.from("project_state").insert({
        project_id: projectId,
        schema_version: PROJECT_STATE_SCHEMA_VERSION,
        state: empty,
      });
      if (insertError) return { ok: false, error: insertError.message };
      return {
        ok: true,
        data: {
          project_id: projectId,
          schema_version: PROJECT_STATE_SCHEMA_VERSION,
          state: empty,
          updated_at: new Date().toISOString(),
        },
      };
    }

    const state = normalizeProjectState(data.state);
    return {
      ok: true,
      data: {
        project_id: String(data.project_id),
        schema_version: data.schema_version as number,
        state,
        updated_at: String(data.updated_at),
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to load project state." };
  }
}

export async function saveProjectState(
  projectId: string,
  payload: unknown
): Promise<ProActionResult<{ updated_at: string; state: ProjectStatePayload }>> {
  try {
    const { supabase, user } = await requireProUser();
    const owned = await assertProjectOwned(supabase, user.id, projectId);
    if (!owned) return { ok: false, error: "Project not found." };

    const normalized = normalizeProjectState(payload);
    const prepared = await prepareProjectStateForCloudSave(normalized);
    const validated = validateProjectStatePayload(prepared);
    if (!validated.ok) return { ok: false, error: validated.error };

    const { data, error } = await supabase
      .from("project_state")
      .upsert(
        {
          project_id: projectId,
          schema_version: PROJECT_STATE_SCHEMA_VERSION,
          state: validated.state,
        },
        { onConflict: "project_id" }
      )
      .select("updated_at, state")
      .single();

    if (error) return { ok: false, error: error.message };

    await supabase
      .from("projects")
      .update({ last_opened_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("user_id", user.id);

    return {
      ok: true,
      data: {
        updated_at: String(data.updated_at),
        state: normalizeProjectState(data.state),
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save project state." };
  }
}
