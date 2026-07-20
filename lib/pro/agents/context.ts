import { createHash } from "node:crypto";
import { compressScriptForContext } from "@/lib/pro/compress-script-for-context";
import type { AgentProjectMemory, DirectorRulesState, SceneRow } from "@/lib/pro/types";
import { SCREENPLAY_RAW_TEXT_MAX_CHARS } from "@/lib/pro/types";

export { compressScriptForContext };

/** Fingerprint script text for memory invalidation. */
export function fingerprintScript(text: string): string {
  return createHash("sha256").update(text.slice(0, SCREENPLAY_RAW_TEXT_MAX_CHARS)).digest("hex").slice(0, 16);
}

/** Select — scene headings + one-liners only for research/shot agents. */
export function isolateSceneSummaries(scenes: SceneRow[]): string {
  if (scenes.length === 0) return "(No scenes yet.)";
  return scenes
    .map(
      (s) =>
        `${s.number}. ${s.heading || "UNTITLED"} — ${s.oneLine || "—"} (${s.intExt}/${s.dayNight})`
    )
    .join("\n");
}

export function rulesBlock(rules: DirectorRulesState): string {
  return [
    rules.styleNotes.trim() ? `Style: ${rules.styleNotes.trim()}` : null,
    rules.preferredShots.trim() ? `Preferred shots: ${rules.preferredShots.trim()}` : null,
    `Budget tier: ${rules.budgetTier}`,
    rules.toneAndRefs.trim() ? `Tone/refs: ${rules.toneAndRefs.trim()}` : null,
    rules.genreTags.length ? `Genres: ${rules.genreTags.join(", ")}` : null,
    rules.projectInstructions.trim()
      ? `Project instructions: ${rules.projectInstructions.trim()}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Write — memory block injected into sub-agents. */
export function memoryContextBlock(memory: AgentProjectMemory): string {
  const recent = memory.decisions.slice(-12);
  if (
    recent.length === 0 &&
    !memory.compressedScriptSummary &&
    memory.learnedPreferences.length === 0
  ) {
    return "";
  }
  const lines = [
    "## Project memory (honor this in every output)",
    "Apply learned preferences and avoid rejected patterns below.",
  ];
  if (memory.learnedPreferences.length) {
    lines.push("", "### Learned preferences (highest priority)");
    for (const p of memory.learnedPreferences) {
      lines.push(`- ${p}`);
    }
  }
  if (memory.compressedScriptSummary) {
    lines.push("", "### Script context", memory.compressedScriptSummary);
  }
  const approved = recent.filter((d) => d.approved);
  const rejected = recent.filter((d) => !d.approved).slice(-6);
  if (approved.length) {
    lines.push("", "### Recent approvals");
    for (const d of approved) {
      lines.push(`- [${d.agent}] ${d.summary}`);
    }
  }
  if (rejected.length) {
    lines.push("", "### Avoid repeating (user rejected)");
    for (const d of rejected) {
      lines.push(`- [${d.agent}] ${d.summary}`);
    }
  }
  return lines.join("\n");
}

export function parseJsonFromModelText(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced?.[1]?.trim() ?? trimmed;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  const json = start >= 0 && end > start ? body.slice(start, end + 1) : body;
  return JSON.parse(json);
}
