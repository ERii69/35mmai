import { NextResponse } from "next/server";
import { isClaudeAgentsConfigured } from "@/lib/pro/agents/anthropic-client";
import { runVisualConsistencyAgent } from "@/lib/pro/agents/visual-bible-agent";
import { consumeAiQuotaOrReject } from "@/lib/pro/ai-quota";
import { isProEntitled } from "@/lib/entitlements";
import { isProStackConfigured } from "@/lib/pro-stack-config";
import { loadExportSnapshot } from "@/lib/pro/load-export-snapshot";
import { checkVisualConsistency } from "@/lib/pro/visual-consistency-check";
import { normalizeProjectState } from "@/lib/pro/validate-project-state";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  sceneNumber?: number;
};

export async function POST(
  request: Request,
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

  const body = (await request.json().catch(() => ({}))) as Body;
  const state = normalizeProjectState(snapshot.state);
  const heuristic = checkVisualConsistency(state);

  if (!isClaudeAgentsConfigured()) {
    return NextResponse.json({
      ok: true,
      source: "heuristic",
      summary:
        heuristic.length === 0
          ? "No obvious conflicts with your visual bible."
          : `${heuristic.length} scene${heuristic.length === 1 ? "" : "s"} may not match your look.`,
      conflicts: heuristic,
    });
  }

  const quota = await consumeAiQuotaOrReject(user.id, "visual/consistency", projectId);
  if (!quota.ok) return quota.response;

  try {
    const agent = await runVisualConsistencyAgent({
      state,
      memory: state.directorPrep.agentMemory,
      sceneNumber: body.sceneNumber,
    });

    const merged = [...agent.conflicts];
    for (const h of heuristic) {
      if (!merged.some((m) => m.sceneNumber === h.sceneNumber && m.message === h.message)) {
        merged.push(h);
      }
    }

    return NextResponse.json({
      ok: true,
      source: "agent",
      summary: agent.summary,
      conflicts: merged.slice(0, 20),
    });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      source: "heuristic",
      warning: e instanceof Error ? e.message : "Agent failed",
      summary: "Fell back to rule-based consistency check.",
      conflicts: heuristic,
    });
  }
}
