import type { DirectorRulesState } from "@/lib/pro/types";
import { SCENE_MAX_VISUAL_REFS, SCREENPLAY_RAW_TEXT_MAX_CHARS } from "@/lib/pro/types";

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

const EXAMPLE_SCHEMA = {
  executiveSummary:
    "2–3 sentences: tone, scale, and prep priorities for this script.",
  visualMood: "Overall look — palette, light, references (films, photographers).",
  locations: ["KITCHEN", "ALLEY", "APARTMENT"],
  scenes: [
    {
      heading: "INT. KITCHEN - NIGHT",
      oneLine: "She discovers the letter.",
      intExt: "INT",
      dayNight: "NIGHT",
      visualRefs: ["Chungking Express", "warm tungsten"],
      shotNotes: "Wide master, slow push-in to letter.",
    },
  ],
  shotSequences: [
    {
      sceneNumber: 1,
      title: "Scene 1 — INT. KITCHEN - NIGHT",
      shots: [
        "1A — Wide master, locked off",
        "1B — OTS on letter in hand",
        "1C — CU reaction",
      ],
    },
  ],
  budgetEstimate: {
    tier: "indie",
    summary: "Micro-budget AI-assisted short; ~8 scenes, 2 locations, minimal cast.",
    monthlyToolingUsdLow: 45,
    monthlyToolingUsdHigh: 120,
  },
};

/** Full-script prompt for external Claude / ChatGPT — Script-to-Pre-Production Agent. */
export function buildScriptToPrepAgentPrompt(
  rules: DirectorRulesState,
  screenplayRawText: string,
  screenplayTitle?: string
): string {
  const script = screenplayRawText.slice(0, SCREENPLAY_RAW_TEXT_MAX_CHARS);
  const truncated = screenplayRawText.length > script.length;

  return [
    "You are a **Script-to-Pre-Production Agent** for an indie film team.",
    "Read the full screenplay below and produce a complete pre-production breakdown.",
    "",
    rulesBlock(rules),
    "",
    "## Your tasks",
    "1. Read the **entire** script excerpt.",
    "2. Break it into **scenes** with standard headings (INT./EXT., location, DAY/NIGHT).",
    "3. For each scene, suggest **visual references** (films, artists, mood — not URLs).",
    "4. List **unique locations** parsed from scene headings.",
    "5. Build **shot lists** (`shotSequences`) — practical coverage per scene (wide, OTS, CU, etc.).",
    "6. Provide a **basic budget estimate** for AI-assisted micro/low production (tooling band, not cast rates).",
    "",
    "## Output rules",
    "- Output **only** valid JSON matching the schema below (no markdown fences, no prose before/after).",
    `- Up to ${SCENE_MAX_VISUAL_REFS} visualRefs per scene.`,
    "- `shotSequences.sceneNumber` must match the scene `number` you assign (1-based order in `scenes` array).",
    "- `budgetEstimate.tier` must be one of: `indie`, `mid`, `high`.",
    "",
    "## Output JSON schema",
    JSON.stringify(EXAMPLE_SCHEMA, null, 2),
    "",
    screenplayTitle?.trim() ? `## Screenplay title\n${screenplayTitle.trim()}\n` : "",
    "## Full screenplay",
    truncated
      ? `(First ${script.length.toLocaleString()} of ${screenplayRawText.length.toLocaleString()} characters)`
      : `(Full script — ${script.length.toLocaleString()} characters)`,
    "",
    script || "(No script text — paste your screenplay in 35mmAiPro first.)",
  ].join("\n");
}
