import type { DirectorRulesState, SceneRow } from "@/lib/pro/types";
import { SCENE_MAX_VISUAL_REFS, SCREENPLAY_RAW_TEXT_MAX_CHARS } from "@/lib/pro/types";

const DEFAULT_EXCERPT_CHARS = 8_000;

export type BuildDirectorPromptOptions = {
  /** Characters from screenplay.rawText to include after rules. */
  excerptChars?: number;
};

function rulesBlock(rules: DirectorRulesState): string {
  const lines = [
    "## Director's Bible (project rules)",
    "",
    rules.styleNotes.trim() ? `**Style:** ${rules.styleNotes.trim()}` : null,
    rules.preferredShots.trim() ? `**Preferred shots:** ${rules.preferredShots.trim()}` : null,
    `**Budget tier:** ${rules.budgetTier}`,
    rules.toneAndRefs.trim() ? `**Tone & references:** ${rules.toneAndRefs.trim()}` : null,
    rules.genreTags.length > 0 ? `**Genre tags:** ${rules.genreTags.join(", ")}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

/** Markdown prompt for external Claude / ChatGPT — no API calls from 35mmAI. */
export function buildDirectorPrepPrompt(
  rules: DirectorRulesState,
  screenplayRawText: string,
  options?: BuildDirectorPromptOptions
): string {
  const excerptLimit = Math.min(
    options?.excerptChars ?? DEFAULT_EXCERPT_CHARS,
    SCREENPLAY_RAW_TEXT_MAX_CHARS
  );
  const excerpt = screenplayRawText.slice(0, excerptLimit);
  const truncated = screenplayRawText.length > excerpt.length;

  return [
    "You are an expert Director's Assistant helping break down a screenplay for pre-production.",
    "",
    rulesBlock(rules),
    "",
    "## Instructions",
    "- Think step by step and maintain continuity across the full script excerpt.",
    "- Output **only** valid JSON matching the schema below (no markdown fences).",
    `- Include up to ${SCENE_MAX_VISUAL_REFS} visual reference strings per scene (films, artists, mood — not URLs required).`,
    "- Use standard scene headings when present (INT./EXT., location, DAY/NIGHT).",
    "",
    "## Output JSON schema",
    "```",
    JSON.stringify(
      {
        scenes: [
          {
            heading: "INT. LOCATION - DAY",
            oneLine: "One-line dramatic summary.",
            intExt: "INT",
            dayNight: "DAY",
            visualRefs: ["Reference 1", "Reference 2"],
            shotNotes: "Optional shot or coverage note.",
          },
        ],
      },
      null,
      2
    ),
    "```",
    "",
    "## Screenplay excerpt",
    truncated
      ? `(First ${excerpt.length.toLocaleString()} characters of ${screenplayRawText.length.toLocaleString()} total)`
      : `(Full script — ${screenplayRawText.length.toLocaleString()} characters)`,
    "",
    excerpt || "(No script text pasted yet — add script in 35mmAiPro Director's Prep first.)",
  ].join("\n");
}

export function newSceneRow(number: number): SceneRow {
  return {
    id: `scene-${Date.now()}-${number}`,
    number,
    heading: "",
    oneLine: "",
    intExt: "",
    dayNight: "",
    visualRefs: [],
    shotNotes: "",
    status: "draft",
    linkedSequenceId: null,
  };
}
