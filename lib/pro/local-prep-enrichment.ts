import { suggestBudgetFromScenes } from "@/lib/pro/budget-from-scenes";
import { parseLocationFromHeading } from "@/lib/pro/locations-from-scenes";
import type { DirectorBudgetTier, DirectorRulesState, SceneRow } from "@/lib/pro/types";

/** Shot list notes with real coverage beats (not generic placeholder). */
export function buildLocalShotCoverageNotes(scene: SceneRow, rules: DirectorRulesState): string {
  const loc = parseLocationFromHeading(scene.heading) ?? "location";
  const time = scene.dayNight ? ` · ${scene.dayNight}` : "";
  const intExt = scene.intExt || "";
  const lines: string[] = [];

  if (intExt === "EXT" || intExt === "INT/EXT") {
    lines.push(`Establishing wide — ${loc}${time} (geography)`);
  } else {
    lines.push(`Master — ${loc}${time} (space and blocking)`);
  }

  lines.push("Medium two-shot or singles — character beat");
  lines.push("Close-up — reaction or story detail");

  const action = `${scene.oneLine} ${scene.shotNotes}`.toLowerCase();
  if (/\b(run|chase|sprint|fight|stumble)\b/.test(action)) {
    lines.push("Handheld / steadicam — movement energy");
  }
  if (/\b(wide|city|skyline|landscape|rooftop|alley)\b/.test(action)) {
    lines.push("Wide low or high angle — environment");
  }
  if (/\b(night|neon|dark)\b/.test(action) || scene.dayNight === "NIGHT") {
    lines.push("Practicals + motivated key — night look");
  }
  if (/\b(phone|letter|object|hands)\b/.test(action)) {
    lines.push("Insert / ECU — prop or hands");
  }

  if (rules.preferredShots.trim()) {
    lines.push(`Director note: ${rules.preferredShots.trim().slice(0, 100)}`);
  }

  return lines.map((l) => `- ${l}`).join("\n");
}

export function buildLocalBudgetSummary(scenes: SceneRow[], tier: DirectorBudgetTier): string {
  const count = scenes.length;
  const suggestion = suggestBudgetFromScenes(count, tier);
  const shootDays = Math.max(1, Math.ceil(count / 4));
  const lines: string[] = [
    `**${count} scenes** · **~${shootDays} shoot day${shootDays === 1 ? "" : "s"}** at indie pace (4 scenes/day)`,
    `**Tier:** ${tier} — kit lines scale with scene count`,
    "",
    "**Micro-budget kit (applied on save):**",
  ];

  for (const row of suggestion.microTools.slice(0, 10)) {
    lines.push(`- ${row.name} × ${row.qty} (~$${row.monthly}/mo each)`);
  }

  if (suggestion.lowTools.length > 0) {
    lines.push("", "**Optional upgrades (mid/high tier):**");
    for (const row of suggestion.lowTools.slice(0, 6)) {
      lines.push(`- ${row.name} × ${row.qty}`);
    }
  }

  lines.push(
    "",
    "_Saving applies these rows to your Budget tab. Adjust quantities there before locking your plan._"
  );

  return lines.join("\n");
}

const PALETTE_BY_MOOD: Record<string, string[]> = {
  naturalistic: ["#2C2C2C", "#8B7355", "#C4B8A8", "#E8E4DC", "#4A6741"],
  intimate: ["#1A1A2E", "#4A3F55", "#9B8B7E", "#D4C5B5", "#E8DCC8"],
  noir: ["#0D0D0D", "#1F1F1F", "#4A4A4A", "#8B0000", "#C9A227"],
  default: ["#1C1917", "#44403C", "#78716C", "#D6D3D1", "#FAFAF9"],
};

function pickPalette(rules: DirectorRulesState): string[] {
  const blob = `${rules.styleNotes} ${rules.toneAndRefs}`.toLowerCase();
  if (/\bnoir|thriller|crime\b/.test(blob)) return PALETTE_BY_MOOD.noir;
  if (/\bnatural|documentary|nomadland\b/.test(blob)) return PALETTE_BY_MOOD.naturalistic;
  if (/\bintimate|romance|quiet\b/.test(blob)) return PALETTE_BY_MOOD.intimate;
  return PALETTE_BY_MOOD.default;
}

export function buildLocalVisualPackage(
  rules: DirectorRulesState,
  scenes: SceneRow[],
  options?: { promptPack?: boolean }
): {
  mood: string;
  palette: string[];
  designNotes: string;
  lensAndFraming: string;
  lightingApproach: string;
} {
  const extCount = scenes.filter((s) => s.intExt === "EXT" || s.intExt === "INT/EXT").length;
  const nightCount = scenes.filter((s) => s.dayNight === "NIGHT").length;

  const moodParts = [
    rules.styleNotes.trim(),
    rules.toneAndRefs.trim(),
  ].filter(Boolean);

  const mood =
    moodParts.join(" · ").slice(0, 280) ||
    "Ground the look in your Script tab vision — add style and reference films for sharper notes.";

  const palette = pickPalette(rules);
  const promptPack = options?.promptPack === true;

  const designNotes = [
    rules.genreTags.length > 0 ? `**Genre:** ${rules.genreTags.join(", ")}` : null,
    promptPack
      ? `**Scene rhythm:** ${extCount} exterior / ${scenes.length - extCount} interior · ${nightCount} night scene${nightCount === 1 ? "" : "s"}`
      : `**Coverage mix:** ${extCount} exterior / ${scenes.length - extCount} interior beats · ${nightCount} night scene${nightCount === 1 ? "" : "s"}`,
    rules.preferredShots.trim() ? `**Shot preference:** ${rules.preferredShots.trim()}` : null,
    promptPack
      ? "**Texture:** Match production design to scene settings — avoid generic stock look."
      : "**Texture:** Match production design to location list — avoid generic stock look.",
    promptPack
      ? "_Palette and mood feed every prompt in Finish → Prompts after you add to project._"
      : "_Run **Generate mood board** in the Look tab after save for reference stills._",
  ]
    .filter(Boolean)
    .join("\n");

  const lensAndFraming =
    nightCount > scenes.length / 2
      ? "Fast primes (35/50) for night exteriors; wider T-stop, accept grain; controlled halation on practicals."
      : extCount > scenes.length / 2
        ? promptPack
          ? "24–35mm for exteriors; 50–85mm for character beats; consider ND for day exteriors."
          : "24–35mm for exteriors; 50–85mm for character coverage; consider ND for day exteriors."
        : "35mm as workhorse; 50mm for dialogue; shallow depth for intimacy unless documentary tone.";

  const lightingApproach =
    nightCount > 0
      ? "Motivated keys, soft fill, cool edge from windows/street; keep skin tones warm in night INT."
      : "Naturalistic key + bounce; avoid flat overhead; shape with negative fill on close-ups.";

  return { mood, palette, designNotes, lensAndFraming, lightingApproach };
}
