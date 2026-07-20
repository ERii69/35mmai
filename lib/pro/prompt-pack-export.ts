import { getToolByRank } from "@/app/data";
import { buildScriptToPromptPackState } from "@/lib/pro/build-script-to-prompt-pack";
import { getToolOutboundUrlByRank } from "@/lib/pro/catalog-tool-link";
import { formatShotNumber } from "@/lib/pro/shot-plan";
import type { ProjectStatePayload } from "@/lib/pro/types";

export type PromptPackRow = {
  sceneOrder: number;
  sceneNumber: number | null;
  sceneHeading: string;
  beatNumber: string;
  beatLabel: string;
  beatType: string;
  toolName: string;
  toolUrl: string;
  prompt: string;
  negativePrompt: string;
  visualRef: string;
};

/** Prompts are built at export time — not stored in cloud state. */
export function stateForPromptPackExport(state: ProjectStatePayload): ProjectStatePayload {
  if (!state.shotPlan.sequences.some((s) => s.shots.length > 0)) {
    return buildScriptToPromptPackState(state);
  }
  const needsBuild = state.shotPlan.sequences.some((seq) =>
    seq.shots.some((shot) => !shot.aiGenerationPrompt?.trim())
  );
  return needsBuild ? buildScriptToPromptPackState(state) : state;
}

function lookSummaryLine(state: ProjectStatePayload): string | null {
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  const palette = state.visualBible.palette.filter(Boolean).slice(0, 4);
  const parts = [mood, palette.length ? `Palette: ${palette.join(", ")}` : null].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/** Scene-ordered beats with tool name and outbound catalog URL. */
export function iterPromptPackRows(state: ProjectStatePayload): PromptPackRow[] {
  const hydrated = stateForPromptPackExport(state);
  const rows: PromptPackRow[] = [];
  let sceneOrder = 0;

  hydrated.shotPlan.sequences.forEach((seq, seqIndex) => {
    if (seq.shots.length === 0) return;
    sceneOrder += 1;

    seq.shots.forEach((shot, shotIndex) => {
      const rank = shot.recommendedToolRank ?? 0;
      const tool = getToolByRank(rank);
      rows.push({
        sceneOrder,
        sceneNumber: seq.sceneNumber ?? null,
        sceneHeading: seq.title || `Sequence ${seqIndex + 1}`,
        beatNumber: formatShotNumber(seqIndex, shotIndex),
        beatLabel: shot.label || shot.shotType.replace(/_/g, " "),
        beatType: shot.shotType,
        toolName: tool?.name ?? "",
        toolUrl: getToolOutboundUrlByRank(rank) ?? "",
        prompt: shot.aiGenerationPrompt?.trim() ?? "",
        negativePrompt: shot.aiNegativePrompt?.trim() ?? "",
        visualRef: shot.visualRefUrl ?? "",
      });
    });
  });

  return rows;
}

export function countPromptPackRows(state: ProjectStatePayload): number {
  return iterPromptPackRows(state).length;
}

function escapeCsvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: unknown[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

export function buildPromptPackCsv(state: ProjectStatePayload, projectName: string): string {
  const packRows = iterPromptPackRows(state);
  const header = [
    "scene_order",
    "scene_number",
    "scene_heading",
    "beat_number",
    "beat_label",
    "beat_type",
    "tool",
    "tool_url",
    "prompt",
    "negative_prompt",
    "visual_ref",
  ];
  const rows = packRows.map((r) => [
    r.sceneOrder,
    r.sceneNumber ?? "",
    r.sceneHeading,
    r.beatNumber,
    r.beatLabel,
    r.beatType,
    r.toolName,
    r.toolUrl,
    r.prompt,
    r.negativePrompt,
    r.visualRef,
  ]);

  const meta = [[`# Prompt pack — ${projectName}`], []];
  return toCsv([...meta, header, ...rows]);
}

export function buildPromptPackMd(state: ProjectStatePayload, projectName: string): string {
  const packRows = iterPromptPackRows(state);
  const exportedAt = new Date().toISOString().slice(0, 10);
  const look = lookSummaryLine(state);

  const lines: string[] = [
    `# Prompt pack — ${projectName}`,
    "",
    `Exported ${exportedAt}. Paste each prompt into the linked tool — nothing generates inside 35mmPRO.`,
  ];
  if (look) {
    lines.push("", `**Look:** ${look}`);
  }
  lines.push("");

  if (packRows.length === 0) {
    lines.push(
      "_No visual beats yet — run prep, add to your project, and lock your look — then build prompts in Finish → Prompts._"
    );
    return lines.join("\n");
  }

  let lastSceneOrder = -1;
  for (const row of packRows) {
    if (row.sceneOrder !== lastSceneOrder) {
      if (lastSceneOrder >= 0) lines.push("---", "");
      lastSceneOrder = row.sceneOrder;
      const sceneLabel =
        row.sceneNumber != null
          ? `Scene ${row.sceneNumber} · ${row.sceneHeading}`
          : row.sceneHeading;
      lines.push(`## ${sceneLabel}`, "");
    }

    lines.push(`### ${row.beatNumber} · ${row.beatLabel} · ${row.beatType.replace(/_/g, " ")}`);
    if (row.toolName) lines.push(`**Tool:** ${row.toolName}`);
    if (row.toolUrl) lines.push(`**Open tool:** ${row.toolUrl}`);
    lines.push("");
    lines.push("**Prompt**");
    lines.push("```");
    lines.push(row.prompt || "(empty — build prompts in Finish → Prompts)");
    lines.push("```");
    if (row.negativePrompt) {
      lines.push("");
      lines.push("**Negative**");
      lines.push("```");
      lines.push(row.negativePrompt);
      lines.push("```");
    }
    lines.push("");
  }

  return lines.join("\n");
}
