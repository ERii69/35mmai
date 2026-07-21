import { NextResponse } from "next/server";
import { runDirectorAgentPipeline } from "@/lib/pro/agents/orchestrator";
import { planRefineAgents } from "@/lib/pro/plan-refine-agents";
import type { PrepPipelineAgentId } from "@/lib/pro/agent-roster";
import { isClaudeAgentsConfigured } from "@/lib/pro/agents/anthropic-client";
import { consumeAiQuotaOrReject } from "@/lib/pro/ai-quota";
import { isProEntitled } from "@/lib/entitlements";
import { isProStackConfigured } from "@/lib/pro-stack-config";
import { loadExportSnapshot } from "@/lib/pro/load-export-snapshot";
import { normalizeProjectState } from "@/lib/pro/validate-project-state";
import { createClient } from "@/lib/supabase/server";
import { SCREENPLAY_RAW_TEXT_MAX_CHARS } from "@/lib/pro/types";

export const runtime = "nodejs";
export const maxDuration = 120;

type Body = {
  refineHint?: string;
  refine?: boolean;
  agents?: PrepPipelineAgentId[];
  /** Client-side screenplay — used when autosave has not flushed yet. */
  screenplay?: { rawText?: string; title?: string };
};

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  if (!isProStackConfigured()) {
    return NextResponse.json({ error: "35mmAiPro is not configured." }, { status: 503 });
  }

  if (!isClaudeAgentsConfigured()) {
    return NextResponse.json(
      {
        error:
          "Native agents are off. Set PRO_AGENTS_ENABLED=1 and ANTHROPIC_API_KEY, or use local quick prep.",
      },
      { status: 503 }
    );
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
  const dp = state.directorPrep;

  const clientRaw = body.screenplay?.rawText?.trim();
  const directorPrep =
    clientRaw && clientRaw.length > 0
      ? {
          ...dp,
          screenplay: {
            ...dp.screenplay,
            rawText: clientRaw.slice(0, SCREENPLAY_RAW_TEXT_MAX_CHARS),
            ...(typeof body.screenplay?.title === "string"
              ? { title: body.screenplay.title }
              : {}),
          },
        }
      : dp;

  if (!directorPrep.screenplay.rawText.trim()) {
    return NextResponse.json({ error: "Paste your screenplay first." }, { status: 400 });
  }

  const quota = await consumeAiQuotaOrReject(user.id, "agent/run", projectId);
  if (!quota.ok) return quota.response;

  const agents =
    body.agents ??
    (body.refine && body.refineHint ? planRefineAgents(body.refineHint) : undefined);

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (obj: unknown) => {
        controller.enqueue(enc.encode(`${JSON.stringify(obj)}\n`));
      };

      try {
        for await (const event of runDirectorAgentPipeline({
          directorPrep,
          visualBible: state.visualBible,
          refineHint: body.refineHint,
          agents,
        })) {
          send(event);
          if (event.type === "error") break;
        }
      } catch (e) {
        send({
          type: "error",
          message: e instanceof Error ? e.message : "Agent stream failed.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
    },
  });
}
