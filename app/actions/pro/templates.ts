"use server";

import type { ProActionResult } from "@/app/actions/pro/projects";
import { requireProUser } from "@/lib/pro/require-pro-user";
import {
  buildTemplateState,
  isDirectorPrepTemplateId,
  isProTemplateId,
  mergeDirectorPrepTemplate,
  mergeTemplateApply,
  type ProTemplateId,
} from "@/lib/pro/templates";
import { prepareProjectStateForCloudSave } from "@/lib/pro/slim-project-state";
import { PROJECT_STATE_SCHEMA_VERSION, type ProjectStatePayload } from "@/lib/pro/types";
import { normalizeProjectState, validateProjectStatePayload } from "@/lib/pro/validate-project-state";

export async function applyTemplate(
  projectId: string,
  templateId: string
): Promise<ProActionResult<{ state: ProjectStatePayload; updated_at: string }>> {
  try {
    if (!isProTemplateId(templateId)) {
      return { ok: false, error: "Unknown template." };
    }

    const { supabase, user } = await requireProUser();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .is("archived_at", null)
      .maybeSingle();

    if (projectError) return { ok: false, error: projectError.message };
    if (!project) return { ok: false, error: "Project not found." };

    const fresh = buildTemplateState(templateId as ProTemplateId);

    const { data: stateRow, error: stateError } = await supabase
      .from("project_state")
      .select("state")
      .eq("project_id", projectId)
      .maybeSingle();

    if (stateError) return { ok: false, error: stateError.message };

    let state = fresh;
    if (stateRow?.state) {
      const existing = normalizeProjectState(stateRow.state);
      state = isDirectorPrepTemplateId(templateId)
        ? mergeDirectorPrepTemplate(existing, fresh)
        : mergeTemplateApply(existing, fresh);
    }

    const prepared = await prepareProjectStateForCloudSave(state);
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

    const savedState = normalizeProjectState(data.state ?? validated.state);

    return {
      ok: true,
      data: {
        updated_at: String(data.updated_at),
        state: savedState,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to apply template.",
    };
  }
}
