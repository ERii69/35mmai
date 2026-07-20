import { NextResponse } from "next/server";
import { isClaudeAgentsConfigured } from "@/lib/pro/agents/anthropic-client";
import {
  hasVisionEligibleStills,
  runReferenceVisionAgent,
} from "@/lib/pro/agents/reference-vision-agent";
import { runVisualBibleAgent } from "@/lib/pro/agents/visual-bible-agent";
import { buildLocalReferenceLibraryAnalysis } from "@/lib/pro/analyze-reference-library";
import { isProEntitled } from "@/lib/entitlements";
import { isProStackConfigured } from "@/lib/pro-stack-config";
import { loadExportSnapshot } from "@/lib/pro/load-export-snapshot";
import { normalizeProjectState } from "@/lib/pro/validate-project-state";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  /** Client-side library order — server snapshot may lag behind uploads. */
  referenceUrls?: string[];
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
  let state = normalizeProjectState(snapshot.state);

  if (Array.isArray(body.referenceUrls) && body.referenceUrls.length > 0) {
    const urls = body.referenceUrls
      .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      .slice(0, 24);
    state = {
      ...state,
      visualBible: { ...state.visualBible, referenceUrls: urls },
    };
  }

  const refCount = state.visualBible.referenceUrls.length;

  if (refCount === 0 && state.directorPrep.scenes.every((s) => s.visualRefs.length === 0)) {
    return NextResponse.json(
      { error: "Add reference links or upload stills before analyzing." },
      { status: 400 }
    );
  }

  try {
    if (isClaudeAgentsConfigured() && hasVisionEligibleStills(state)) {
      const vision = await runReferenceVisionAgent(state);
      return NextResponse.json({
        ok: true,
        source: "vision",
        summary: vision.summary,
        palette: vision.palette,
        mood: vision.mood,
        lensAndFraming: vision.lensAndFraming,
        grainAndTexture: vision.grainAndTexture,
        designNotes: vision.designNotes,
        stillInsights: vision.stillInsights,
        stillCount: vision.stillCount,
      });
    }

    if (isClaudeAgentsConfigured()) {
      const visual = await runVisualBibleAgent({
        rules: state.directorPrep.directorRules,
        scenes: state.directorPrep.scenes,
        memory: state.directorPrep.agentMemory,
        state,
        mode: "mood_board",
        refineHint:
          "Analyze only the visual reference library (URLs and uploaded stills) plus scene visual refs. Return palette, mood, and designNotes that help lock the look before external AI generation. Do not invent new reference URLs.",
      });

      return NextResponse.json({
        ok: true,
        source: "agent",
        summary: `Analyzed ${refCount} library reference${refCount === 1 ? "" : "s"} with Visual Bible agent.`,
        palette: visual.palette,
        designNotes: visual.designNotes,
        mood: visual.mood,
      });
    }

    const local = buildLocalReferenceLibraryAnalysis(state);
    return NextResponse.json({
      ok: true,
      source: "local",
      summary: local.summary,
      palette: local.palette,
      designNotes: local.designNotes,
      mood: local.mood,
    });
  } catch (e) {
    const local = buildLocalReferenceLibraryAnalysis(state);
    return NextResponse.json({
      ok: true,
      source: "local",
      summary: local.summary,
      palette: local.palette,
      designNotes: local.designNotes,
      mood: local.mood,
      warning: e instanceof Error ? e.message : "Agent failed; used local synthesis.",
    });
  }
}
