import { NextResponse } from "next/server";
import { isClaudeAgentsConfigured } from "@/lib/pro/agents/anthropic-client";
import { runLookReferenceAgent } from "@/lib/pro/agents/look-reference-agent";
import { buildLocalLookReferenceSuggestions } from "@/lib/pro/suggest-look-references";
import { isProEntitled } from "@/lib/entitlements";
import { isProStackConfigured } from "@/lib/pro-stack-config";
import { loadExportSnapshot } from "@/lib/pro/load-export-snapshot";
import { normalizeProjectState } from "@/lib/pro/validate-project-state";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  if (!isProStackConfigured()) {
    return NextResponse.json({ error: "35mmAiPro is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const entitled = await isProEntitled();
  if (!entitled) {
    return NextResponse.json({ error: "Active 35mmAiPro subscription required." }, { status: 403 });
  }

  const snapshot = await loadExportSnapshot(projectId, user.id);
  if (!snapshot) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const state = normalizeProjectState(snapshot.state);
  const rules = state.directorPrep.directorRules;
  const hasVision =
    rules.styleNotes.trim() ||
    rules.toneAndRefs.trim() ||
    rules.genreTags.length > 0 ||
    state.directorPrep.scenes.length > 0;

  if (!hasVision) {
    return NextResponse.json(
      { error: "Set your vision in Prep first — style, tone, or genre — so we can suggest look references." },
      { status: 400 }
    );
  }

  try {
    if (isClaudeAgentsConfigured()) {
      const suggestions = await runLookReferenceAgent({
        rules,
        scenes: state.directorPrep.scenes,
        memory: state.directorPrep.agentMemory,
        state,
      });
      return NextResponse.json({
        ok: true,
        source: "agent",
        suggestions,
      });
    }

    return NextResponse.json({
      ok: true,
      source: "local",
      suggestions: buildLocalLookReferenceSuggestions(state),
    });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      source: "local",
      suggestions: buildLocalLookReferenceSuggestions(state),
      warning: e instanceof Error ? e.message : "Agent unavailable; used local suggestions.",
    });
  }
}
