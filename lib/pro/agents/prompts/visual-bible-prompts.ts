import type { DirectorRulesState, ProjectStatePayload, SceneRow } from "@/lib/pro/types";
import { isolateSceneSummaries, memoryContextBlock, rulesBlock } from "@/lib/pro/agents/context";

export const VISUAL_BIBLE_SYSTEM_PROMPT = `You are an expert Cinematographer and Production Designer AI.

Your job is to create a cohesive, professional Visual Bible that maintains strict consistency across the entire film.

Core Rules:
- Always reference the Director's Bible (style, tone, references) from Prep
- Never contradict previously established visual choices unless the user explicitly requests a refine
- Prioritize cinematic quality over generic beauty — avoid stock-photo language
- Be specific with technical language (lens choices, lighting ratios, color temperature in Kelvin, T-stop, aspect ratio when relevant)
- When writing prose fields, use clean structured Markdown with clear ## headings
- Output ONLY valid JSON matching the requested schema — no preamble

When generating mood boards:
- Create 4-6 distinct visual references (film stills, photographers, or art-direction concepts — describe them; do not invent URLs)
- Each reference must clearly match the stated mood and palette
- Include technical notes for each reference (key/fill ratio, lens mm, color grade, color temperature)

When checking consistency:
- Compare new elements against the existing Visual Bible
- Flag contradictions with concrete examples (e.g. "Scene uses harsh top light, but the Visual Bible specifies soft natural window key")
- Suggest actionable fixes when conflicts are found

Tone: Professional, concise, and authoritative — like a respected DP giving notes to a director.`;

export function buildDirectorVisionBlock(rules: DirectorRulesState): string {
  return [
    "## Director's Vision (from Prep)",
    rules.styleNotes.trim() ? `**Style:** ${rules.styleNotes.trim()}` : null,
    rules.toneAndRefs.trim() ? `**Key references:** ${rules.toneAndRefs.trim()}` : null,
    rules.preferredShots.trim() ? `**Camera preferences:** ${rules.preferredShots.trim()}` : null,
    rules.projectInstructions.trim()
      ? `**Project instructions:** ${rules.projectInstructions.trim()}`
      : null,
    rules.genreTags.length ? `**Genre:** ${rules.genreTags.join(", ")}` : null,
    `**Budget tier:** ${rules.budgetTier}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildExistingVisualBibleBlock(state: Pick<ProjectStatePayload, "visualBible" | "directorPrep">): string {
  const vb = state.visualBible;
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  const lines = [
    "## Existing Visual Bible (do not contradict)",
    mood ? `**Mood:** ${mood}` : null,
    vb.palette.length ? `**Palette:** ${vb.palette.join(" · ")}` : null,
    vb.lensAndFraming.trim() ? `**Lens / framing:** ${vb.lensAndFraming.trim()}` : null,
    vb.grainAndTexture.trim() ? `**Grain / texture:** ${vb.grainAndTexture.trim()}` : null,
    vb.designSheetNotes.trim()
      ? `**Design notes:**\n${vb.designSheetNotes.trim().slice(0, 1200)}`
      : null,
    vb.referenceUrls.length
      ? `**Locked references:** ${vb.referenceUrls.slice(0, 8).join("; ")}`
      : null,
  ].filter(Boolean);
  return lines.length > 1 ? lines.join("\n") : "";
}

export function buildMoodBoardUserPrompt(input: {
  rules: DirectorRulesState;
  scenes: SceneRow[];
  memory: Parameters<typeof memoryContextBlock>[0];
  state: Pick<ProjectStatePayload, "visualBible" | "directorPrep">;
  moodHint?: string;
  paletteHint?: string;
  refineHint?: string;
}): string {
  const mood =
    input.moodHint?.trim() ||
    input.state.directorPrep.agentMeta.visualMood.trim() ||
    "(derive from Director's Vision)";
  const palette =
    input.paletteHint?.trim() ||
    (input.state.visualBible.palette.length
      ? input.state.visualBible.palette.join(", ")
      : "(derive from tone and references)");

  return [
    memoryContextBlock(input.memory),
    buildDirectorVisionBlock(input.rules),
    buildExistingVisualBibleBlock(input.state),
    input.refineHint ? `## Refine instruction\n${input.refineHint}` : null,
    `## Task: Create a cinematic mood board

**Mood:** ${mood}
**Palette direction:** ${palette}
**Key references:** ${input.rules.toneAndRefs.trim() || "(from Director's Vision above)"}

Generate 5 distinct visual references. For each include title, description, technicalNotes (lighting, lens, color temperature), and whyItFits.

Also return cohesive mood line, palette array (4-6 swatches with optional hex), designNotes as Markdown (## Lighting, ## Color grade, ## Production design), lensAndFraming, grainAndTexture, lightingApproach, and referenceUrls (film titles / artists / search phrases — not fake https URLs).

Scenes for context:
${isolateSceneSummaries(input.scenes)}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildConsistencyUserPrompt(input: {
  state: ProjectStatePayload;
  sceneNumber?: number;
  memory: Parameters<typeof memoryContextBlock>[0];
}): string {
  const scenes =
    input.sceneNumber != null
      ? input.state.directorPrep.scenes.filter((s) => s.number === input.sceneNumber)
      : input.state.directorPrep.scenes.filter((s) => s.status === "approved").length > 0
        ? input.state.directorPrep.scenes.filter((s) => s.status === "approved")
        : input.state.directorPrep.scenes;

  const bibleSummary = [
    buildExistingVisualBibleBlock(input.state),
    buildDirectorVisionBlock(input.state.directorPrep.directorRules),
  ]
    .filter(Boolean)
    .join("\n\n");

  const sceneBlock = scenes
    .map(
      (s) =>
        `Scene ${s.number}: ${s.heading}\nOne-line: ${s.oneLine}\nShot notes: ${s.shotNotes}\nVisual refs: ${s.visualRefs.join(", ") || "(none)"}`
    )
    .join("\n\n");

  return [
    memoryContextBlock(input.memory),
    `## Existing Visual Bible Summary\n${bibleSummary}`,
    `## Scene(s) to review\n${sceneBlock || "(no scenes)"}`,
    `## Task: Consistency review

Check each scene against the Visual Bible. Respond with conflicts (description, severity: low|medium|high, recommendedFix, sceneNumber) and a brief summary.`,
  ].join("\n\n");
}

export function buildFullVisualBibleUserPrompt(input: {
  rules: DirectorRulesState;
  scenes: SceneRow[];
  memory: Parameters<typeof memoryContextBlock>[0];
  state: Pick<ProjectStatePayload, "visualBible" | "directorPrep">;
  refineHint?: string;
}): string {
  return [
    memoryContextBlock(input.memory),
    rulesBlock(input.rules),
    buildDirectorVisionBlock(input.rules),
    buildExistingVisualBibleBlock(input.state),
    input.refineHint ? `Refine: ${input.refineHint}` : null,
    "Scenes:",
    isolateSceneSummaries(input.scenes),
    "Aggregate scene visual refs:",
    input.scenes
      .flatMap((s) => s.visualRefs)
      .slice(0, 12)
      .join(", ") || "(none yet)",
    `Build a complete Visual Bible JSON: mood, palette (4-6), designNotes (Markdown sections), lensAndFraming, grainAndTexture, lightingApproach, moodBoardReferences (5 entries), referenceUrls (film/artist names), confidence.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Example JSON shape sent to the model for mood board mode. */
export const MOOD_BOARD_JSON_EXAMPLE = {
  mood: "Soft naturalistic tension — window key with cool edge",
  palette: ["#8B7355", "Muted sage", "Cool slate shadow", "Warm skin midtone"],
  designNotes:
    "## Lighting\n3:1 key with 5600K window, negative fill camera right.\n\n## Color grade\nLifted blacks, desaturated greens.",
  lensAndFraming: "35mm / 50mm spherical; composed for 2.39:1; shallow depth on close-ups only",
  grainAndTexture: "Fine 35mm grain; avoid digital sharpening",
  lightingApproach: "Motivated natural sources; no unmotivated fill",
  moodBoardReferences: [
    {
      title: "Kitchen window key — Days of Heaven",
      description: "Dusty afternoon shafts through gauze curtains",
      technicalNotes: "Soft 5600K window key, 4:1 ratio, 35mm, warm highlight roll-off",
      whyItFits: "Matches rural naturalism and soft tension in director notes",
      filmReference: "Days of Heaven (1978)",
    },
  ],
  referenceUrls: ["Days of Heaven", "Roger Deakins natural interior work"],
  confidence: 85,
};

export const CONSISTENCY_JSON_EXAMPLE = {
  summary: "One medium conflict on lighting motivation in Scene 3.",
  conflicts: [
    {
      sceneNumber: 3,
      description:
        "Scene 3 shot notes specify harsh overhead fluorescent, but Visual Bible locks soft window key at 5600K.",
      severity: "high",
      recommendedFix:
        "Reframe Scene 3 as overcast window key with practical fluorescent as background accent only, or update bible if fluorescent is intentional.",
    },
  ],
};
