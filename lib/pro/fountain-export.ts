import { SHOT_TYPE_OPTIONS } from "@/lib/pro/shot-plan";
import type { ProjectStatePayload } from "@/lib/pro/types";

function shotTypeLabel(shotType: string): string {
  return SHOT_TYPE_OPTIONS.find((o) => o.value === shotType)?.label ?? shotType;
}

/** Fountain screenplay + shot-list appendix for Final Draft / Highland import. */
export function buildFountainExport(state: ProjectStatePayload, projectName: string): string {
  const dp = state.directorPrep;
  const title = dp.screenplay.title.trim() || projectName;
  const lines: string[] = [`Title: ${title}`, "Credit: 35mmAiPro export", ""];

  const raw = dp.screenplay.rawText.trim();
  if (raw.length > 0) {
    lines.push(raw, "");
  } else if (dp.scenes.length > 0) {
    for (const scene of dp.scenes) {
      const heading = scene.heading.trim() || `SCENE ${scene.number}`;
      lines.push(heading, "");
      if (scene.oneLine.trim()) lines.push(scene.oneLine.trim(), "");
      if (scene.shotNotes.trim()) {
        lines.push(`[[NOTE: ${scene.shotNotes.trim()}]]`, "");
      }
    }
  } else {
    lines.push("= Untitled", "", "Paste your script in Prep or add scenes before exporting.", "");
  }

  const sequences = state.shotPlan.sequences;
  if (sequences.some((s) => s.shots.length > 0)) {
    lines.push("/*", "SHOT LIST (import as reference — attach to scenes in Final Draft)", "");
    for (const seq of sequences) {
      lines.push(`## ${seq.title}`);
      if (seq.notes.trim()) lines.push(seq.notes.trim());
      seq.shots.forEach((shot, i) => {
        const parts = [
          `${i + 1}. ${shot.label.trim() || shotTypeLabel(shot.shotType)}`,
          `(${shot.durationSeconds}s, ${shot.status})`,
        ];
        if (shot.cameraNotes.trim()) parts.push(`— ${shot.cameraNotes.trim()}`);
        lines.push(parts.join(" "));
      });
      lines.push("");
    }
    lines.push("*/", "");
  }

  return lines.join("\n");
}
