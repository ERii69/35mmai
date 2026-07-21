import { NextResponse } from "next/server";
import { runWorldBibleAgent } from "@/lib/pro/agents/world-bible-agent";
import { isClaudeAgentsConfigured } from "@/lib/pro/agents/anthropic-client";
import {
  applyWorldBibleToState,
  generateWorldFromScript,
} from "@/lib/pro/apply-world-bible";
import { mergeLocationLists } from "@/lib/pro/locations-from-scenes";
import { isProEntitled } from "@/lib/entitlements";
import { isProStackConfigured } from "@/lib/pro-stack-config";
import { loadExportSnapshot } from "@/lib/pro/load-export-snapshot";
import { scriptTextForAnalysis } from "@/lib/pro/script-for-analysis";
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
  const dp = state.directorPrep;
  const raw = dp.screenplay.rawText.trim();

  if (!raw && dp.scenes.length === 0) {
    return NextResponse.json(
      { error: "Paste your screenplay in Prep first, or add scenes." },
      { status: 400 }
    );
  }

  const scenes =
    dp.scenes.filter((s) => s.status === "approved").length > 0
      ? dp.scenes.filter((s) => s.status === "approved")
      : dp.scenes;

  try {
    if (isClaudeAgentsConfigured() && raw) {
      const { text: screenplayRaw } = scriptTextForAnalysis(dp.screenplay, dp.prepRunSettings);
      const generated = await runWorldBibleAgent({
        rules: dp.directorRules,
        screenplayRaw,
        title: dp.screenplay.title,
        scenes,
        memory: dp.agentMemory,
        existing: state.worldBible,
      });
      const local = generateWorldFromScript(state);
      const merged = {
        notes: generated.notes.trim() || local.notes,
        characters: dedupeLines([...generated.characters, ...local.characters]),
        locations: mergeLocationLists(generated.locations, local.locations),
      };
      const next = applyWorldBibleToState(state, merged, "replace");
      return NextResponse.json({
        ok: true,
        source: "agent",
        worldBible: next.worldBible,
        characterCount: next.worldBible.characters.length,
        locationCount: next.worldBible.locations.length,
      });
    }

    const generated = generateWorldFromScript(state);
    if (
      !generated.notes.trim() &&
      generated.characters.length === 0 &&
      generated.locations.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Could not extract a world bible. Add scene headings (INT./EXT.) or paste a script with character names in ALL CAPS.",
        },
        { status: 400 }
      );
    }

    const next = applyWorldBibleToState(state, generated, "replace");
    return NextResponse.json({
      ok: true,
      source: "local",
      worldBible: next.worldBible,
      characterCount: next.worldBible.characters.length,
      locationCount: next.worldBible.locations.length,
    });
  } catch (e) {
    const generated = generateWorldFromScript(state);
    const next = applyWorldBibleToState(state, generated, "replace");
    return NextResponse.json({
      ok: true,
      source: "local",
      warning: e instanceof Error ? e.message : "Agent failed",
      worldBible: next.worldBible,
      characterCount: next.worldBible.characters.length,
      locationCount: next.worldBible.locations.length,
    });
  }
}

function dedupeLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}
