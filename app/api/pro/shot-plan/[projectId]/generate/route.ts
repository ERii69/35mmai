import { NextResponse } from "next/server";
import { runShotListAgent } from "@/lib/pro/agents/shot-list-agent";
import { isClaudeAgentsConfigured } from "@/lib/pro/agents/anthropic-client";
import { applyAgentShotListToPlan } from "@/lib/pro/apply-agent-shot-list";
import { generateShotPlanFromPrep } from "@/lib/pro/generate-shot-plan-from-prep";
import { isProEntitled } from "@/lib/entitlements";
import { isProStackConfigured } from "@/lib/pro-stack-config";
import { loadExportSnapshot } from "@/lib/pro/load-export-snapshot";
import { normalizeProjectState } from "@/lib/pro/validate-project-state";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

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
  const scenes =
    state.directorPrep.scenes.filter((s) => s.status === "approved").length > 0
      ? state.directorPrep.scenes.filter((s) => s.status === "approved")
      : state.directorPrep.scenes;

  if (scenes.length === 0) {
    return NextResponse.json({ error: "Approve or add scenes in Prep first." }, { status: 400 });
  }

  try {
    if (isClaudeAgentsConfigured()) {
      const suggestions = await runShotListAgent({
        rules: state.directorPrep.directorRules,
        scenes,
        memory: state.directorPrep.agentMemory,
        visualBible: state.visualBible,
        visualMood: state.directorPrep.agentMeta.visualMood,
        refineHint:
          "Build practical shot lists per approved scene. Tie camera and lighting notes to the visual bible.",
      });
      const next = applyAgentShotListToPlan(state, suggestions);
      return NextResponse.json({
        ok: true,
        source: "agent",
        sequenceCount: next.shotPlan.sequences.length,
        shotCount: next.shotPlan.sequences.reduce((n, s) => n + s.shots.length, 0),
        shotPlan: next.shotPlan,
        scenes: next.directorPrep.scenes,
      });
    }

    const next = generateShotPlanFromPrep(state);
    return NextResponse.json({
      ok: true,
      source: "local",
      sequenceCount: next.shotPlan.sequences.length,
      shotCount: next.shotPlan.sequences.reduce((n, s) => n + s.shots.length, 0),
      shotPlan: next.shotPlan,
      scenes: next.directorPrep.scenes,
    });
  } catch (e) {
    const next = generateShotPlanFromPrep(state);
    return NextResponse.json({
      ok: true,
      source: "local",
      warning: e instanceof Error ? e.message : "Agent failed",
      sequenceCount: next.shotPlan.sequences.length,
      shotCount: next.shotPlan.sequences.reduce((n, s) => n + s.shots.length, 0),
      shotPlan: next.shotPlan,
      scenes: next.directorPrep.scenes,
    });
  }
}
