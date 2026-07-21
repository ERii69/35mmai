import { suggestBudgetFromScenes } from "@/lib/pro/budget-from-scenes";
import { locationsFromApprovedScenes } from "@/lib/pro/locations-from-scenes";
import {
  locationResearchDisplayName,
  openInMapsUrl,
} from "@/lib/pro/location-research";
import type { ProjectStatePayload, SceneRow } from "@/lib/pro/types";

function scenesForReport(state: ProjectStatePayload, includeDrafts: boolean): SceneRow[] {
  const scenes = state.directorPrep.scenes;
  if (includeDrafts) return scenes;
  const approved = scenes.filter((s) => s.status === "approved");
  return approved.length > 0 ? approved : scenes;
}

function mdEscapeInline(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function budgetMonthlyTotal(state: ProjectStatePayload): number | null {
  const lines = [...state.budget.microTools, ...state.budget.lowTools];
  if (lines.length === 0) return null;
  let total = 0;
  for (const entry of lines) {
    if (typeof entry !== "object" || entry == null) continue;
    const row = entry as Record<string, unknown>;
    const monthly = typeof row.monthly === "number" ? row.monthly : 0;
    const qty = typeof row.qty === "number" ? row.qty : 1;
    total += monthly * qty;
  }
  return total > 0 ? Math.round(total * 100) / 100 : null;
}

/** Full pre-production Markdown report from workspace state. */
export function buildPreProductionReportMd(
  state: ProjectStatePayload,
  projectName: string,
  includeDrafts = false
): string {
  const dp = state.directorPrep;
  const scenes = scenesForReport(state, includeDrafts);
  const date = new Date().toISOString().slice(0, 10);
  const rules = dp.directorRules;
  const meta = dp.agentMeta;
  const parsedLocations = locationsFromApprovedScenes(dp.scenes);
  const locationResearch = dp.locationResearch ?? [];
  const allLocations = [
    ...new Set([
      ...locationResearch.map((r) => locationResearchDisplayName(r)),
      ...state.worldBible.locations,
      ...parsedLocations,
    ]),
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const sceneCount = scenes.length;
  const suggestion = suggestBudgetFromScenes(
    dp.scenes.filter((s) => s.status === "approved").length || sceneCount,
    rules.budgetTier
  );
  const kitMonthly = budgetMonthlyTotal(state);

  const lines: string[] = [
    `# Pre-Production Report — ${projectName}`,
    "",
    `_Generated ${date} · 35mmAiPro Script-to-Pre-Production Agent (API-free workflow)_`,
    "",
  ];

  if (meta.executiveSummary.trim()) {
    lines.push("## Executive summary", "", meta.executiveSummary.trim(), "");
  } else {
    lines.push(
      "## Executive summary",
      "",
      `${sceneCount} scene${sceneCount === 1 ? "" : "s"} · ${allLocations.length} location${allLocations.length === 1 ? "" : "s"} · ${rules.budgetTier} budget tier.`,
      ""
    );
  }

  lines.push("## Script", "");
  if (dp.screenplay.title.trim()) lines.push(`- **Title:** ${dp.screenplay.title.trim()}`);
  if (dp.screenplay.draftLabel.trim()) lines.push(`- **Draft:** ${dp.screenplay.draftLabel.trim()}`);
  if (dp.screenplay.pageEstimate != null) {
    lines.push(`- **Pages (est.):** ${dp.screenplay.pageEstimate}`);
  }
  lines.push(
    `- **Script length:** ${dp.screenplay.rawText.length.toLocaleString()} characters pasted`
  );
  lines.push("");

  lines.push("## Director's Bible", "");
  if (rules.styleNotes.trim()) lines.push(`- **Style:** ${rules.styleNotes.trim()}`);
  if (rules.preferredShots.trim()) lines.push(`- **Preferred shots:** ${rules.preferredShots.trim()}`);
  lines.push(`- **Budget tier:** ${rules.budgetTier}`);
  if (rules.toneAndRefs.trim()) lines.push(`- **Tone & refs:** ${rules.toneAndRefs.trim()}`);
  if (rules.genreTags.length > 0) lines.push(`- **Genre:** ${rules.genreTags.join(", ")}`);
  lines.push("");

  lines.push("## Scene breakdown", "");
  if (scenes.length === 0) {
    lines.push("_No scenes yet — run the agent or add scenes manually._", "");
  } else {
    lines.push(
      "| # | Heading | One-line | INT/EXT | DAY/NIGHT | Status |",
      "|---|---------|----------|---------|-----------|--------|",
      ...scenes.map(
        (s) =>
          `| ${s.number} | ${mdEscapeInline(s.heading)} | ${mdEscapeInline(s.oneLine)} | ${s.intExt} | ${s.dayNight} | ${s.status} |`
      ),
      ""
    );
  }

  lines.push("## Locations", "");
  if (locationResearch.length > 0) {
    for (const rec of locationResearch) {
      const display = locationResearchDisplayName(rec);
      lines.push(`### ${display}`, "");
      if (rec.sceneNumbers.length > 0) {
        lines.push(`**Scenes:** ${rec.sceneNumbers.join(", ")}`, "");
      }
      if (rec.notes.trim()) lines.push(rec.notes.trim(), "");
      if (rec.pinnedPlace) {
        lines.push(
          `**Pin:** ${rec.pinnedPlace.label} · [Maps](${openInMapsUrl(rec.pinnedPlace)})`,
          ""
        );
      }
      if (rec.shootSuggestions.length > 0) {
        lines.push("**Scout suggestions:**");
        for (const s of rec.shootSuggestions) {
          lines.push(`- **${s.title}** — ${s.why} · \`${s.mapQuery}\``);
        }
        lines.push("");
      }
      if (rec.rulesAndLimitations.length > 0) {
        lines.push("**Rules:**", ...rec.rulesAndLimitations.map((r) => `- ${r}`), "");
      }
    }
  } else if (allLocations.length === 0) {
    lines.push("_No locations listed yet._", "");
  } else {
    lines.push(...allLocations.map((loc) => `- ${loc}`), "");
  }

  if (meta.visualMood.trim() || state.visualBible.designSheetNotes.trim()) {
    lines.push("## Visual mood & references", "");
    if (meta.visualMood.trim()) lines.push(meta.visualMood.trim(), "");
    if (state.visualBible.designSheetNotes.trim()) {
      lines.push(state.visualBible.designSheetNotes.trim(), "");
    }
    if (state.visualBible.referenceUrls.length > 0) {
      lines.push("**Reference list:**", ...state.visualBible.referenceUrls.map((r) => `- ${r}`), "");
    }
  }

  lines.push("## Shot lists", "");
  if (state.shotPlan.sequences.length === 0) {
    lines.push("_No shot sequences yet._", "");
  } else {
    for (const seq of state.shotPlan.sequences) {
      lines.push(`### ${seq.title || "Untitled sequence"}`, "");
      if (seq.sceneNumber != null) {
        lines.push(`_Scene ${seq.sceneNumber}_`, "");
      }
      if (seq.shots.length > 0) {
        lines.push(
          "| # | Label | Type | Duration | Status | Camera | Lighting |",
          "|---|-------|------|----------|--------|--------|----------|"
        );
        seq.shots.forEach((shot, i) => {
          lines.push(
            `| ${i + 1} | ${shot.label.replace(/\|/g, "\\|")} | ${shot.shotType} | ${shot.durationSeconds}s | ${shot.status} | ${shot.cameraNotes.replace(/\|/g, "\\|")} | ${shot.lightingNotes.replace(/\|/g, "\\|")} |`
          );
        });
        lines.push("");
      } else if (seq.notes.trim()) {
        lines.push(seq.notes.trim(), "");
      } else {
        lines.push("_No shots listed._", "");
      }
    }
  }

  for (const scene of scenes) {
    if (scene.visualRefs.length === 0 && !scene.shotNotes.trim()) continue;
    lines.push(`### Scene ${scene.number}${scene.heading ? `: ${scene.heading}` : ""}`, "");
    if (scene.visualRefs.length > 0) {
      lines.push("**Visual refs:**", ...scene.visualRefs.map((r) => `- ${r}`), "");
    }
    if (scene.shotNotes.trim()) {
      lines.push("**Coverage notes:**", scene.shotNotes.trim(), "");
    }
  }

  lines.push("## Budget estimate", "");
  if (meta.budgetSummaryText.trim()) {
    lines.push(meta.budgetSummaryText.trim(), "");
  }
  lines.push(`- **Director tier:** ${rules.budgetTier}`);
  lines.push(`- **Scaled preset (deterministic):** ${suggestion.summary}`);
  if (kitMonthly != null) {
    lines.push(`- **Current kit/budget lines in workspace:** ~$${kitMonthly}/mo USD (review in Budget tab)`);
  }
  if (state.budget.selectedBudget) {
    lines.push(
      `- **Selected band:** ${state.budget.selectedRole ?? "Role TBD"} · ${state.budget.selectedBudget} (${state.budget.currency})`
    );
  }
  lines.push("");

  lines.push("## Next steps", "");
  lines.push(
    "1. Review draft scenes and **approve** rows you trust.",
    "2. Open **Shots** tab — refine linked sequences.",
    "3. **Pull locations** into World bible if needed.",
    "4. Apply or adjust **Budget** lines from scene count.",
    "5. Re-export this report after approvals.",
    ""
  );

  lines.push("---", "", "_Nothing in this report was generated on 35mmAI servers — external AI is copy/paste only._");

  return lines.join("\n");
}
