import {
  callSubAgentJson,
  callSubAgentJsonWithImages,
  type VisionImageInput,
} from "@/lib/pro/agents/anthropic-client";
import { memoryContextBlock, rulesBlock } from "@/lib/pro/agents/context";
import type { DirectorRulesState, ProjectStatePayload } from "@/lib/pro/types";

const MAX_VISION_STILLS = 4;

type VisionAnalysisOutput = {
  mood?: string;
  palette?: string[];
  lensAndFraming?: string;
  grainAndTexture?: string;
  designNotes?: string;
  summary?: string;
  stillInsights?: Array<{ index: number; description?: string }>;
};

const SYSTEM = `You are a cinematographer analyzing visual reference stills for an indie film.
Return ONLY valid JSON (no markdown fence) with keys:
- mood (string, one sentence)
- palette (string[], hex codes and color names, 4-8 items)
- lensAndFraming (string — infer focal length, aspect ratio, composition from the stills, e.g. "35mm spherical, 2.39:1, shallow depth on close-ups")
- grainAndTexture (string — infer grain, halation, texture from the stills, e.g. "Fine 35mm grain, gentle halation on highlights")
- designNotes (string, markdown: lighting, production design — brief)
- summary (string, one line for the director)
- stillInsights (array of { index, description } — index matches image order starting at 0)`;

function parseDataImageUrl(url: string): VisionImageInput | null {
  const match = url.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,([\s\S]+)$/i);
  if (!match) return null;
  const mediaType = match[1].toLowerCase() as VisionImageInput["mediaType"];
  const data = match[2].replace(/\s/g, "");
  if (data.length < 32) return null;
  return { mediaType, data };
}

function collectUploadedStills(state: ProjectStatePayload): VisionImageInput[] {
  const images: VisionImageInput[] = [];
  for (const url of state.visualBible.referenceUrls) {
    if (!url.startsWith("data:image")) continue;
    const parsed = parseDataImageUrl(url);
    if (parsed) images.push(parsed);
    if (images.length >= MAX_VISION_STILLS) break;
  }
  return images;
}

function buildTextContext(state: ProjectStatePayload, rules: DirectorRulesState): string {
  const linkRefs = state.visualBible.referenceUrls.filter((u) => !u.startsWith("data:image"));
  const sceneRefs = state.directorPrep.scenes.flatMap((s) => s.visualRefs).slice(0, 12);
  return [
    "## Director rules",
    rulesBlock(rules),
    memoryContextBlock(state.directorPrep.agentMemory),
    "## Text references (links cannot be opened — infer from labels only)",
    linkRefs.length ? linkRefs.join("\n") : "(none)",
    "## Scene visual refs",
    sceneRefs.length ? sceneRefs.join("\n") : "(none)",
    "",
    "Analyze the attached stills for palette, mood, and how they should guide AI image generation on this project.",
  ]
    .filter(Boolean)
    .join("\n");
}

export type ReferenceVisionResult = {
  mood: string;
  palette: string[];
  lensAndFraming: string;
  grainAndTexture: string;
  designNotes: string;
  summary: string;
  stillInsights: Array<{ index: number; description: string }>;
  stillCount: number;
};

/** Vision pass on uploaded reference stills (PRO-401). */
export async function runReferenceVisionAgent(
  state: ProjectStatePayload
): Promise<ReferenceVisionResult> {
  const rules = state.directorPrep.directorRules;
  const images = collectUploadedStills(state);
  const userText = buildTextContext(state, rules);

  let raw: VisionAnalysisOutput;

  if (images.length > 0) {
    raw = await callSubAgentJsonWithImages<VisionAnalysisOutput>(
      SYSTEM,
      userText,
      images,
      2048
    );
  } else {
    raw = await callSubAgentJson<VisionAnalysisOutput>(
      SYSTEM,
      `${userText}\n\n(No uploaded stills — synthesize from text references and director rules only.)`,
      2048
    );
  }

  const stillInsights = (raw.stillInsights ?? [])
    .filter((s) => typeof s.index === "number")
    .map((s) => ({
      index: s.index,
      description: (s.description ?? "").trim() || "Reference still",
    }))
    .slice(0, MAX_VISION_STILLS);

  const palette = Array.isArray(raw.palette)
    ? raw.palette.map((p) => String(p).trim()).filter(Boolean).slice(0, 12)
    : [];

  const designNotes = [
    raw.designNotes?.trim() ?? "",
    stillInsights.length
      ? "\n\n### Per-still notes\n" +
        stillInsights.map((s) => `- Still ${s.index + 1}: ${s.description}`).join("\n")
      : "",
  ]
    .filter(Boolean)
    .join("");

  return {
    mood: (raw.mood ?? "").trim() || "Mood derived from references.",
    palette,
    lensAndFraming: (raw.lensAndFraming ?? "").trim(),
    grainAndTexture: (raw.grainAndTexture ?? "").trim(),
    designNotes,
    summary:
      (raw.summary ?? "").trim() ||
      `Analyzed ${images.length} still${images.length === 1 ? "" : "s"} and text references.`,
    stillInsights,
    stillCount: images.length,
  };
}

export function hasVisionEligibleStills(state: ProjectStatePayload): boolean {
  return state.visualBible.referenceUrls.some((url) => /^data:image\/[a-z+]+;base64,/i.test(url));
}
