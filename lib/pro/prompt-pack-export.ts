import { getToolByRank } from "@/app/data";
import { buildScriptToPromptPackState } from "@/lib/pro/build-script-to-prompt-pack";
import { getToolOutboundUrlByRank } from "@/lib/pro/catalog-tool-link";
import { referenceStillPrompt } from "@/lib/pro/prompt-locks";
import { formatShotNumber } from "@/lib/pro/shot-plan";
import type { ProjectStatePayload } from "@/lib/pro/types";

/** Paste order: stills, grade, scene blocks, details, then moves. */
const TOOL_GROUP_ORDER = [6, 21, 4, 18, 5];

export type PromptPackRow = {
  sceneOrder: number;
  sceneNumber: number | null;
  sceneHeading: string;
  beatNumber: string;
  beatLabel: string;
  beatType: string;
  toolRank: number;
  toolName: string;
  frameSentence: string;
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
        toolRank: rank,
        toolName: tool?.name ?? "",
        frameSentence: shot.frameSentence?.trim() ?? "",
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
  const toolOrder = new Map(TOOL_GROUP_ORDER.map((rank, index) => [rank, index]));
  const sorted = [...packRows].sort((a, b) => {
    const ar = toolOrder.get(a.toolRank) ?? 99;
    const br = toolOrder.get(b.toolRank) ?? 99;
    if (ar !== br) return ar - br;
    return a.sceneOrder - b.sceneOrder || a.beatNumber.localeCompare(b.beatNumber);
  });
  const rows = sorted.map((r) => [
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

function appendPromptBlock(
  lines: string[],
  row: PromptPackRow
): void {
  const sceneLabel =
    row.sceneNumber != null ? `Scene ${row.sceneNumber} · ${row.sceneHeading}` : row.sceneHeading;
  lines.push(`### ${row.beatNumber} · ${sceneLabel} · ${row.beatType.replace(/_/g, " ")}`);
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

export function buildPromptPackMd(state: ProjectStatePayload, projectName: string): string {
  const packRows = iterPromptPackRows(state);
  const exportedAt = new Date().toISOString().slice(0, 10);
  const look = lookSummaryLine(state);
  const locks = state.directorPrep.promptLocks;

  const lines: string[] = [
    `# Prompt pack — ${projectName}`,
    "",
    `Exported ${exportedAt}. Grouped by tool so you can paste one app at a time. Nothing generates inside 35mmPRO.`,
  ];
  if (look) {
    lines.push("", `**Look:** ${look}`);
  }

  if (locks && (locks.characters.length > 0 || locks.places.length > 0)) {
    lines.push("", "## Locks", "");
    for (const person of locks.characters) {
      lines.push(`- **${person.name}:** ${person.look}`);
    }
    for (const place of locks.places) {
      lines.push(`- **${place.name}:** ${place.look}`);
    }
    if (locks.characters.length > 0) {
      lines.push("", "## Reference stills", "");
      lines.push("One Midjourney still per person. Kling moves start from that still.", "");
      for (const person of locks.characters) {
        lines.push(`### ${person.name}`);
        lines.push("**Tool:** Midjourney");
        lines.push("");
        lines.push("```");
        lines.push(referenceStillPrompt(person));
        lines.push("```", "");
      }
    }
  }

  lines.push("");

  if (packRows.length === 0) {
    lines.push(
      "_No visual beats yet — run prep, add to your project, and lock your look — then build prompts in Finish → Prompts._"
    );
    return lines.join("\n");
  }

  const grouped = new Map<number, PromptPackRow[]>();
  for (const row of packRows) {
    const rank = TOOL_GROUP_ORDER.includes(row.toolRank) ? row.toolRank : 0;
    const list = grouped.get(rank) ?? [];
    list.push(row);
    grouped.set(rank, list);
  }

  for (const rank of TOOL_GROUP_ORDER) {
    const rows = grouped.get(rank);
    if (!rows?.length) continue;
    const toolName = rows[0]?.toolName || getToolByRank(rank)?.name || "Tool";
    lines.push(`## ${toolName}`, "");
    for (const row of rows) appendPromptBlock(lines, row);
  }

  const rest = grouped.get(0) ?? [];
  if (rest.length > 0) {
    lines.push("## Other tools", "");
    for (const row of rest) appendPromptBlock(lines, row);
  }

  return lines.join("\n");
}

function shotListFrame(row: PromptPackRow): string {
  if (row.frameSentence.trim()) return row.frameSentence.replace(/\s+/g, " ").trim().slice(0, 140);
  const prompt = row.prompt.replace(/\s+/g, " ").trim();
  if (row.beatType === "close_up" || row.beatType === "extreme_close_up") {
    const object = prompt.match(
      /hands and the letter|untouched coffee cup|wet surface, neon, and cloth/i
    );
    if (object) return object[0];
  }
  if (row.beatType === "wide" || row.beatType === "establishing") {
    const where = prompt.match(/(?:interior|exterior) ([^,]{3,40})/i);
    const detail = prompt.match(
      /night, rain on glass|night, wet brick, distant neon|night, untouched coffee/i
    );
    if (where && detail) {
      const place = where[1].replace(/\s+at night.*$/i, "").trim();
      return `${place}, ${detail[0]}`;
    }
    if (where) return where[1].trim();
  }
  if (row.beatType === "dolly" || row.beatType === "pan" || row.beatType === "tilt" || row.beatType === "handheld") {
    const who = prompt.match(/Start from the Midjourney reference still of ([A-Za-z]+)/);
    return who ? `move, start from the still of ${who[1]}` : "camera move from the locked still";
  }
  const action = prompt.match(/Action: (.+)$/);
  if (action) {
    const story = action[1].split(/motivated practical lighting,\s*/i).pop() ?? action[1];
    return story.split(/, waist-up/i)[0].replace(/\s+/g, " ").trim().slice(0, 140);
  }
  return (row.beatLabel || prompt).replace(/\s+/g, " ").trim().slice(0, 110);
}

/** One page to hand a collaborator: scene, size, tool, what the frame is. */
export function buildShotListMd(state: ProjectStatePayload, projectName: string): string {
  const rows = iterPromptPackRows(state);
  const lines = [
    `# Shot list — ${projectName}`,
    "",
    "Scene, size, tool, and the frame. The prompt pack is what you paste.",
    "",
    "| Scene | Size | Tool | Frame |",
    "| --- | --- | --- | --- |",
  ];
  for (const row of rows) {
    const scene =
      row.sceneNumber != null ? `${row.sceneNumber} ${row.sceneHeading}` : row.sceneHeading;
    const frame = shotListFrame(row).replace(/\|/g, "/");
    lines.push(
      `| ${scene.replace(/\|/g, "/")} | ${row.beatType.replace(/_/g, " ")} | ${row.toolName || "—"} | ${frame} |`
    );
  }
  if (rows.length === 0) {
    lines.push("| — | — | — | No prompts yet |");
  }
  return lines.join("\n");
}
