import { NextResponse } from "next/server";
import { runVisualBibleAgent } from "@/lib/pro/agents/visual-bible-agent";
import {
  hasVisionEligibleStills,
  runReferenceVisionAgent,
} from "@/lib/pro/agents/reference-vision-agent";
import { isClaudeAgentsConfigured } from "@/lib/pro/agents/anthropic-client";
import { buildPartialVisualPatch } from "@/lib/pro/build-partial-visual-patch";
import { buildLocalMoodBoard } from "@/lib/pro/build-local-mood-board";
import {
  inferLensGrainVariant,
  lensGrainFromStillInsights,
} from "@/lib/pro/infer-lens-grain-variants";
import type { MoodBoardSection } from "@/lib/pro/apply-mood-board-partial";
import { isProEntitled } from "@/lib/entitlements";
import { isProStackConfigured } from "@/lib/pro-stack-config";
import { loadExportSnapshot } from "@/lib/pro/load-export-snapshot";
import { normalizeProjectState } from "@/lib/pro/validate-project-state";
import type { ProjectStatePayload } from "@/lib/pro/types";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  refineHint?: string;
  sections?: MoodBoardSection[];
  referenceTitle?: string;
  templateOffset?: number;
  /** Client library — server snapshot may lag behind uploads. */
  referenceUrls?: string[];
  lensGrainVariant?: number;
};

function mergeClientReferenceUrls(
  state: ProjectStatePayload,
  referenceUrls: string[] | undefined
): ProjectStatePayload {
  if (!referenceUrls?.length) return state;
  const urls = referenceUrls
    .filter((u) => typeof u === "string" && u.trim().length > 0)
    .slice(0, 24);
  if (!urls.length) return state;
  return {
    ...state,
    visualBible: { ...state.visualBible, referenceUrls: urls },
  };
}

function isLensGrainOnly(sections: MoodBoardSection[] | undefined): boolean {
  return Boolean(
    sections?.length &&
      sections.every((s) => s === "lens" || s === "grain") &&
      sections.some((s) => s === "lens" || s === "grain")
  );
}

async function buildLensGrainVisual(
  state: ProjectStatePayload,
  sections: MoodBoardSection[],
  variant: number
) {
  const mood = state.directorPrep.agentMeta.visualMood;
  const rules = state.directorPrep.directorRules;

  if (hasVisionEligibleStills(state) && isClaudeAgentsConfigured()) {
    const vision = await runReferenceVisionAgent(state);
    const lens =
      vision.lensAndFraming.trim() ||
      lensGrainFromStillInsights(vision.stillInsights, "lens") ||
      inferLensGrainVariant(rules, mood, "lens", variant);
    const grain =
      vision.grainAndTexture.trim() ||
      lensGrainFromStillInsights(vision.stillInsights, "grain") ||
      inferLensGrainVariant(rules, mood, "grain", variant);

    const fields: { lensAndFraming?: string; grainAndTexture?: string } = {};
    if (sections.includes("lens")) fields.lensAndFraming = lens;
    if (sections.includes("grain")) fields.grainAndTexture = grain;

    return {
      visual: buildPartialVisualPatch(state, sections[0]!, fields),
      source: "vision" as const,
    };
  }

  const local = buildLocalMoodBoard(state, { templateOffset: variant });
  const fields: { lensAndFraming?: string; grainAndTexture?: string } = {};
  if (sections.includes("lens")) {
    fields.lensAndFraming =
      local.lensAndFraming?.trim() || inferLensGrainVariant(rules, mood, "lens", variant);
  }
  if (sections.includes("grain")) {
    fields.grainAndTexture =
      local.grainAndTexture?.trim() || inferLensGrainVariant(rules, mood, "grain", variant);
  }

  return {
    visual: buildPartialVisualPatch(state, sections[0]!, fields),
    source: "local" as const,
  };
}

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
  const state = mergeClientReferenceUrls(normalizeProjectState(snapshot.state), body.referenceUrls);
  const dp = state.directorPrep;
  const sections = body.sections ?? [];
  const variant = body.lensGrainVariant ?? body.templateOffset ?? 0;

  if (isLensGrainOnly(sections)) {
    if (!hasVisionEligibleStills(state)) {
      return NextResponse.json(
        {
          error: "Upload reference photos in Step 1 before re-inferring lens or grain.",
        },
        { status: 400 }
      );
    }

    try {
      const { visual, source } = await buildLensGrainVisual(state, sections, variant);
      return NextResponse.json({ ok: true, source, visual });
    } catch (e) {
      const { visual, source } = await buildLensGrainVisual(state, sections, variant + 1);
      return NextResponse.json({
        ok: true,
        source,
        visual,
        warning: e instanceof Error ? e.message : "Vision failed; used fallback.",
      });
    }
  }

  const refineHint =
    body.refineHint?.trim() ||
    (body.referenceTitle
      ? `Replace only the mood board reference titled "${body.referenceTitle}" with one new distinct cinematic reference (title, description, technicalNotes, whyItFits, filmReference). Return moodBoardReferences with at least one new entry.`
      : sections.length
        ? `Regenerate only: ${sections.join(", ")} for the visual bible. When regenerating lens or grain, infer from uploaded reference stills if present.`
        : undefined);

  try {
    let visual = isClaudeAgentsConfigured()
      ? await runVisualBibleAgent({
          rules: dp.directorRules,
          scenes: dp.scenes,
          memory: dp.agentMemory,
          state,
          mode: "mood_board",
          refineHint,
        })
      : buildLocalMoodBoard(state, { templateOffset: body.templateOffset ?? Date.now() % 5 });

    if (isClaudeAgentsConfigured() && hasVisionEligibleStills(state)) {
      const wantsLensOrGrain =
        !sections.length ||
        sections.includes("lens") ||
        sections.includes("grain") ||
        sections.includes("designNotes");
      if (wantsLensOrGrain) {
        const vision = await runReferenceVisionAgent(state);
        visual = {
          ...visual,
          mood: vision.mood || visual.mood,
          palette: vision.palette.length ? vision.palette : visual.palette,
          lensAndFraming: vision.lensAndFraming || visual.lensAndFraming,
          grainAndTexture: vision.grainAndTexture || visual.grainAndTexture,
        };
      }
    }

    return NextResponse.json({
      ok: true,
      source: isClaudeAgentsConfigured() ? "agent" : "local",
      visual,
    });
  } catch (e) {
    const visual = buildLocalMoodBoard(state, { templateOffset: body.templateOffset ?? Date.now() % 5 });
    return NextResponse.json({
      ok: true,
      source: "local",
      visual,
      warning: e instanceof Error ? e.message : "Agent failed; used local synthesis.",
    });
  }
}
