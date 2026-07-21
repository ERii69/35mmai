import type { DirectorRulesState } from "@/lib/pro/types";

const LENS_VARIANTS = [
  "24mm / 35mm spherical; composed for wides with depth in foreground",
  "35mm / 50mm spherical; shallow depth reserved for close-ups",
  "40mm / 75mm anamorphic; 2.39:1; oval bokeh on close-ups",
  "32mm master, 85mm portrait inserts; eye-level motivated framing",
  "21mm ultra-wide for geography; 50mm for dialogue coverage",
] as const;

const GRAIN_VARIANTS = [
  "Fine photochemical grain; gentle halation on highlights",
  "Medium 35mm grain; retain texture in shadows",
  "Fine grain; avoid digital sharpening halos",
  "Subtle 16mm grain for intimacy; soft highlight roll-off",
  "Clean digital base with light 35mm grain overlay in grade",
] as const;

/** Local lens/grain lines when vision API is unavailable — rotates on each regenerate. */
export function inferLensGrainVariant(
  rules: DirectorRulesState,
  mood: string,
  section: "lens" | "grain",
  variant = 0
): string {
  const pref = rules.preferredShots.toLowerCase();
  const tone = `${rules.styleNotes} ${rules.toneAndRefs} ${mood}`.toLowerCase();

  if (section === "lens") {
    if (pref.includes("anamorphic")) return LENS_VARIANTS[2]!;
    if (pref.includes("wide")) return LENS_VARIANTS[0]!;
    if (tone.includes("intimate") || tone.includes("close")) return LENS_VARIANTS[3]!;
    return LENS_VARIANTS[variant % LENS_VARIANTS.length]!;
  }

  if (tone.includes("noir") || tone.includes("grain")) return GRAIN_VARIANTS[1]!;
  if (tone.includes("clean") || tone.includes("digital")) return GRAIN_VARIANTS[2]!;
  return GRAIN_VARIANTS[variant % GRAIN_VARIANTS.length]!;
}

/** Build still-derived hint from analyze-refs stillInsights when lens/grain fields are empty. */
export function lensGrainFromStillInsights(
  stillInsights: Array<{ index: number; description: string }> | undefined,
  section: "lens" | "grain"
): string {
  const notes = (stillInsights ?? [])
    .map((s) => s.description.trim())
    .filter(Boolean)
    .join(" ");
  if (!notes) return "";

  if (section === "lens") {
    const focal = notes.match(/\b\d{2,3}\s?mm\b/i)?.[0];
    if (focal) return `${focal} inferred from reference stills; match framing in uploaded photos.`;
    if (/wide|establishing|geography/i.test(notes)) return LENS_VARIANTS[0]!;
    if (/close|portrait|intimate/i.test(notes)) return LENS_VARIANTS[3]!;
    return `Framing matched to reference stills — ${notes.slice(0, 120)}`;
  }

  if (/grain|texture|halation|film/i.test(notes)) {
    return `Grain matched to references — ${notes.slice(0, 120)}`;
  }
  return GRAIN_VARIANTS[0]!;
}
