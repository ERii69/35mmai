import { buildScriptToPromptShotNotes, parseScriptToPromptShotLine } from "@/lib/pro/build-script-to-prompt-shots";
import type { DirectorRulesState, SceneRow, StagedShotSequenceSuggestion } from "@/lib/pro/types";

export type VisualBeatHints = {
  mood?: string;
  palette?: string[];
  lens?: string;
  lighting?: string;
};

/** Count copy-ready prompt lines in staged shot notes. */
export function countPromptLinesInNotes(notes: string): number {
  let count = 0;
  for (const line of notes.split("\n")) {
    const parsed = parseScriptToPromptShotLine(line);
    if (!parsed.skip && parsed.label.trim()) count += 1;
  }
  return count;
}

export function countPromptsInStaging(shotSequences: { notes: string }[]): number {
  return shotSequences.reduce((n, seq) => n + countPromptLinesInNotes(seq.notes), 0);
}

/** Deterministic visual beats per scene — no shot-list agent. */
export function synthesizeVisualBeatsFromScenes(
  scenes: SceneRow[],
  rules: DirectorRulesState,
  hints?: VisualBeatHints,
  idPrefix = "beat"
): StagedShotSequenceSuggestion[] {
  const visual = hints
    ? {
        mood: hints.mood,
        palette: hints.palette,
        lens: hints.lens,
        lighting: hints.lighting,
      }
    : undefined;

  return scenes.map((scene, i) => ({
    suggestionId: `${idPrefix}-scene-${scene.number}-${i}`,
    status: "pending" as const,
    confidence: 75,
    sceneNumber: scene.number,
    title: scene.heading || `Scene ${scene.number}`,
    notes: buildScriptToPromptShotNotes(scene, rules, visual),
  }));
}
