import { getToolByRank, rehydrateKitEntry, workflowStages } from "@/app/data";
import { kitEntriesFromState } from "@/lib/pro/kit-display";
import type {
  DirectorRulesState,
  ProjectStatePayload,
  SceneRow,
} from "@/lib/pro/types";
import { buildPreProductionReportMd } from "@/lib/pro/preproduction-report-md";
import {
  buildLocationResearchCsv,
  buildLocationResearchMd,
} from "@/lib/pro/location-research-export";
import { buildFdxExport } from "@/lib/pro/fdx-export";
import { buildFountainExport } from "@/lib/pro/fountain-export";
import { buildPromptPackCsv, buildPromptPackMd } from "@/lib/pro/prompt-pack-export";
import { buildStoryboardHtml, buildStoryboardMd } from "@/lib/pro/storyboard-export";

function escapeCsvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: unknown[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

type BudgetLine = {
  name: string;
  rank: number;
  category: string;
  qty: number;
  monthly: number;
  price: string;
  link: string;
};

function hydrateBudgetLine(entry: unknown): BudgetLine | null {
  const h = rehydrateKitEntry(entry) as Record<string, unknown> | null;
  if (!h || typeof h.name !== "string") return null;
  const rank =
    typeof h.catalogRank === "number"
      ? h.catalogRank
      : typeof h.rank === "number"
        ? h.rank
        : 0;
  const qty =
    typeof h.qty === "number" && Number.isFinite(h.qty) && h.qty > 0
      ? Math.floor(h.qty)
      : 1;
  const monthly = typeof h.monthly === "number" && Number.isFinite(h.monthly) ? h.monthly : 0;
  return {
    name: h.name,
    rank,
    category: typeof h.category === "string" ? h.category : "",
    qty,
    monthly,
    price: typeof h.price === "string" ? h.price : "",
    link:
      typeof h.affiliateLink === "string"
        ? h.affiliateLink
        : typeof h.link === "string"
          ? h.link
          : "",
  };
}

export function buildKitCsv(state: ProjectStatePayload): string {
  const header = [
    "rank",
    "name",
    "category",
    "price",
    "budget_fit",
    "qty",
    "monthly_usd",
    "link",
  ];
  const rows = kitEntriesFromState(state.kit).map((t) => [
    t.catalogRank,
    t.name,
    t.category,
    t.price,
    t.budgetFit,
    t.qty,
    t.monthly,
    t.affiliateLink ?? t.link,
  ]);
  return toCsv([header, ...rows]);
}

export function buildBudgetCsv(state: ProjectStatePayload, projectName: string): string {
  const b = state.budget;
  const meta: unknown[][] = [
    ["project", projectName],
    ["role", b.selectedRole ?? ""],
    ["budget_band", b.selectedBudget ?? ""],
    ["currency", b.currency],
    [],
  ];

  const header = [
    "band",
    "rank",
    "name",
    "category",
    "qty",
    "monthly_usd",
    "line_total_usd",
    "price",
    "link",
  ];
  const rows: unknown[][] = [];

  for (const entry of b.microTools) {
    const line = hydrateBudgetLine(entry);
    if (!line) continue;
    rows.push([
      "micro",
      line.rank,
      line.name,
      line.category,
      line.qty,
      line.monthly,
      line.qty * line.monthly,
      line.price,
      line.link,
    ]);
  }

  for (const entry of b.lowTools) {
    const line = hydrateBudgetLine(entry);
    if (!line) continue;
    rows.push([
      "low",
      line.rank,
      line.name,
      line.category,
      line.qty,
      line.monthly,
      line.qty * line.monthly,
      line.price,
      line.link,
    ]);
  }

  const microSum = rows
    .filter((r) => r[0] === "micro")
    .reduce((acc, r) => acc + Number(r[6] ?? 0), 0);
  const lowSum = rows
    .filter((r) => r[0] === "low")
    .reduce((acc, r) => acc + Number(r[6] ?? 0), 0);

  const footer: unknown[][] = [
    [],
    ["micro_subtotal_usd", microSum],
    ["low_subtotal_usd", lowSum],
    ["combined_subtotal_usd", microSum + lowSum],
  ];

  return toCsv([...meta, header, ...rows, ...footer]);
}

export function buildVisualBibleCsv(state: ProjectStatePayload, projectName: string): string {
  const v = state.visualBible;
  const meta: unknown[][] = [
    ["project", projectName],
    [],
    ["design_sheet_notes", v.designSheetNotes],
    ["lens_and_framing", v.lensAndFraming],
    ["grain_and_texture", v.grainAndTexture],
    ["negative_prompt_notes", v.negativePromptNotes],
    ["palette", v.palette.join("; ")],
    ["reference_urls", v.referenceUrls.join("; ")],
    [],
    ["consistency_item", "done"],
  ];
  const rows = v.consistencyChecklist.map((item) => [item.label, item.done ? "yes" : "no"]);
  return toCsv([...meta, ...rows]);
}

export function buildWorkflowCsv(state: ProjectStatePayload): string {
  const stageIndex = Math.min(
    Math.max(0, state.workflow.stageIndex),
    workflowStages.length - 1
  );
  const currentStage = workflowStages[stageIndex];

  const header = [
    "phase_index",
    "phase_title",
    "current_phase",
    "step",
    "description",
    "suggested_tool_ranks",
    "suggested_tool_names",
  ];

  const rows: unknown[][] = [];
  workflowStages.forEach((stage, phaseIndex) => {
    const isCurrent = phaseIndex === stageIndex;
    for (const step of stage.steps) {
      const names = step.tools
        .map((rank) => getToolByRank(rank)?.name ?? `rank-${rank}`)
        .join("; ");
      rows.push([
        phaseIndex + 1,
        stage.title,
        isCurrent ? "yes" : "no",
        step.step,
        step.description,
        step.tools.join("; "),
        names,
      ]);
    }
  });

  const meta: unknown[][] = [
    ["current_phase_title", currentStage?.title ?? ""],
    ["current_phase_description", currentStage?.description ?? ""],
    [],
  ];

  return toCsv([...meta, header, ...rows]);
}

function scenesForExport(
  state: ProjectStatePayload,
  includeDrafts: boolean
): SceneRow[] {
  const scenes = state.directorPrep.scenes;
  if (includeDrafts) return scenes;
  return scenes.filter((s) => s.status === "approved");
}

function rulesSummaryRows(rules: DirectorRulesState): unknown[][] {
  return [
    ["style_notes", rules.styleNotes],
    ["preferred_shots", rules.preferredShots],
    ["budget_tier", rules.budgetTier],
    ["tone_and_refs", rules.toneAndRefs],
    ["genre_tags", rules.genreTags.join("; ")],
  ];
}

export function buildDirectorsPrepCsv(
  state: ProjectStatePayload,
  projectName: string,
  includeDrafts = false
): string {
  const dp = state.directorPrep;
  const scenes = scenesForExport(state, includeDrafts);
  const date = new Date().toISOString().slice(0, 10);

  const meta: unknown[][] = [
    ["project", projectName],
    ["export_date", date],
    ["screenplay_title", dp.screenplay.title],
    ["screenplay_draft", dp.screenplay.draftLabel],
    ["page_estimate", dp.screenplay.pageEstimate ?? ""],
    [],
    ["field", "value"],
    ...rulesSummaryRows(dp.directorRules),
    [],
  ];

  const header = [
    "number",
    "heading",
    "one_line",
    "int_ext",
    "day_night",
    "visual_refs",
    "shot_notes",
    "status",
    "linked_sequence_id",
  ];

  const rows = scenes.map((s) => [
    s.number,
    s.heading,
    s.oneLine,
    s.intExt,
    s.dayNight,
    s.visualRefs.join("; "),
    s.shotNotes,
    s.status,
    s.linkedSequenceId ?? "",
  ]);

  return toCsv([...meta, header, ...rows]);
}

export function buildDirectorsPrepMd(
  state: ProjectStatePayload,
  projectName: string,
  includeDrafts = false
): string {
  const dp = state.directorPrep;
  const scenes = scenesForExport(state, includeDrafts);
  const date = new Date().toISOString().slice(0, 10);
  const rules = dp.directorRules;
  const budgetLine = state.budget.selectedBudget
    ? `${state.budget.selectedRole ?? "Role TBD"} · ${state.budget.selectedBudget} (${state.budget.currency})`
    : `${rules.budgetTier} tier (director rules)`;

  const shotTitles = state.shotPlan.sequences
    .map((s) => s.title)
    .filter(Boolean)
    .join(", ");

  const lines = [
    `# Director's Prep — ${projectName}`,
    "",
    `Exported ${date}${includeDrafts ? " (includes draft scenes)" : " (approved scenes only)"}.`,
    "",
    "## Director's Bible",
    "",
    rules.styleNotes.trim() ? `- **Style:** ${rules.styleNotes.trim()}` : null,
    rules.preferredShots.trim() ? `- **Preferred shots:** ${rules.preferredShots.trim()}` : null,
    `- **Budget tier:** ${rules.budgetTier}`,
    rules.toneAndRefs.trim() ? `- **Tone & refs:** ${rules.toneAndRefs.trim()}` : null,
    rules.genreTags.length > 0 ? `- **Genre:** ${rules.genreTags.join(", ")}` : null,
    "",
    "## Script",
    "",
    dp.screenplay.title.trim() ? `**Title:** ${dp.screenplay.title.trim()}` : null,
    dp.screenplay.draftLabel.trim() ? `**Draft:** ${dp.screenplay.draftLabel.trim()}` : null,
    dp.screenplay.pageEstimate != null ? `**Pages (est.):** ${dp.screenplay.pageEstimate}` : null,
    "",
    "## Scenes",
    "",
    scenes.length === 0
      ? "_No scenes in this export._"
      : [
          "| # | Heading | One-line | INT/EXT | DAY/NIGHT | Status |",
          "|---|---------|----------|---------|-----------|--------|",
          ...scenes.map(
            (s) =>
              `| ${s.number} | ${s.heading.replace(/\|/g, "\\|")} | ${s.oneLine.replace(/\|/g, "\\|")} | ${s.intExt} | ${s.dayNight} | ${s.status} |`
          ),
        ].join("\n"),
    "",
    "## Production context",
    "",
    `- **Budget:** ${budgetLine}`,
    shotTitles ? `- **Shot sequences:** ${shotTitles}` : null,
    "",
  ].filter((line): line is string => line != null);

  for (const scene of scenes) {
    if (scene.visualRefs.length === 0 && !scene.shotNotes.trim()) continue;
    lines.push(`### Scene ${scene.number}${scene.heading ? `: ${scene.heading}` : ""}`, "");
    if (scene.visualRefs.length > 0) {
      lines.push("**Visual refs:**", ...scene.visualRefs.map((r) => `- ${r}`), "");
    }
    if (scene.shotNotes.trim()) {
      lines.push("**Shot notes:**", scene.shotNotes.trim(), "");
    }
  }

  return lines.join("\n");
}

export function buildShotPlanCsv(state: ProjectStatePayload, projectName: string): string {
  const header = [
    "sequence",
    "scene_number",
    "shot_number",
    "label",
    "shot_type",
    "duration_seconds",
    "status",
    "camera_notes",
    "lighting_notes",
    "visual_bible_note",
    "visual_ref_url",
  ];
  const meta = [[`# Shot plan — ${projectName}`], []];
  const rows: unknown[][] = [];

  state.shotPlan.sequences.forEach((seq, seqIndex) => {
    seq.shots.forEach((shot, shotIndex) => {
      rows.push([
        seq.title,
        seq.sceneNumber ?? "",
        `${seqIndex + 1}.${shotIndex + 1}`,
        shot.label,
        shot.shotType,
        shot.durationSeconds,
        shot.status,
        shot.cameraNotes,
        shot.lightingNotes,
        shot.visualBibleNote,
        shot.visualRefUrl,
      ]);
    });
  });

  return toCsv([...meta, header, ...rows]);
}

export type ProExportKind =
  | "kit"
  | "budget"
  | "workflow"
  | "visual"
  | "shot-plan"
  | "storyboard-md"
  | "storyboard-html"
  | "fountain"
  | "fdx"
  | "directors-prep"
  | "directors-prep-md"
  | "preproduction-report"
  | "location-research-csv"
  | "location-research-md"
  | "prompt-pack-csv"
  | "prompt-pack-md";

export function buildExportCsv(
  kind: ProExportKind,
  state: ProjectStatePayload,
  projectName: string,
  options?: { includeDrafts?: boolean }
): string {
  switch (kind) {
    case "kit":
      return buildKitCsv(state);
    case "budget":
      return buildBudgetCsv(state, projectName);
    case "workflow":
      return buildWorkflowCsv(state);
    case "visual":
      return buildVisualBibleCsv(state, projectName);
    case "shot-plan":
      return buildShotPlanCsv(state, projectName);
    case "storyboard-md":
      return buildStoryboardMd(state, projectName);
    case "storyboard-html":
      return buildStoryboardHtml(state, projectName);
    case "fountain":
      return buildFountainExport(state, projectName);
    case "fdx":
      return buildFdxExport(state, projectName);
    case "directors-prep":
      return buildDirectorsPrepCsv(state, projectName, options?.includeDrafts ?? false);
    case "directors-prep-md":
      return buildDirectorsPrepMd(state, projectName, options?.includeDrafts ?? false);
    case "preproduction-report":
      return buildPreProductionReportMd(state, projectName, options?.includeDrafts ?? false);
    case "location-research-csv":
      return buildLocationResearchCsv(state.directorPrep.locationResearch ?? [], projectName);
    case "location-research-md":
      return buildLocationResearchMd(state.directorPrep.locationResearch ?? [], projectName);
    case "prompt-pack-csv":
      return buildPromptPackCsv(state, projectName);
    case "prompt-pack-md":
      return buildPromptPackMd(state, projectName);
    default:
      return "";
  }
}

export function proExportFilename(projectName: string, kind: ProExportKind): string {
  const slug =
    projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "project";
  const date = new Date().toISOString().slice(0, 10);
  if (kind === "storyboard-html") {
    return `${slug}-storyboard-${date}.html`;
  }
  if (kind === "fountain") {
    return `${slug}-screenplay-${date}.fountain`;
  }
  if (kind === "fdx") {
    return `${slug}-screenplay-${date}.fdx`;
  }
  if (kind === "directors-prep-md") {
    return `${slug}-directors-prep-${date}.md`;
  }
  if (kind === "location-research-md") {
    return `${slug}-location-pack-${date}.md`;
  }
  if (kind === "location-research-csv") {
    return `${slug}-location-pack-${date}.csv`;
  }
  if (kind === "preproduction-report" || kind === "storyboard-md" || kind === "prompt-pack-md") {
    return `${slug}-${kind === "storyboard-md" ? "storyboard" : kind === "prompt-pack-md" ? "prompt-pack" : "preproduction-report"}-${date}.md`;
  }
  if (kind === "prompt-pack-csv") {
    return `${slug}-prompt-pack-${date}.csv`;
  }
  if (kind === "directors-prep") {
    return `${slug}-directors-prep-${date}.csv`;
  }
  return `${slug}-${kind}-${date}.csv`;
}

export function proExportContentType(kind: ProExportKind): string {
  if (kind === "storyboard-html") {
    return "text/html; charset=utf-8";
  }
  if (kind === "fountain") {
    return "text/plain; charset=utf-8";
  }
  if (kind === "fdx") {
    return "application/xml; charset=utf-8";
  }
  if (kind === "directors-prep-md" || kind === "preproduction-report" || kind === "storyboard-md" || kind === "location-research-md" || kind === "prompt-pack-md") {
    return "text/markdown; charset=utf-8";
  }
  return "text/csv; charset=utf-8";
}
