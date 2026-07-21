import type { DirectorRulesState } from "@/lib/pro/types";

export const STYLE_NOTE_CHIPS = [
  "Slow-burn",
  "Naturalistic",
  "Handheld",
  "Cinematic",
  "Documentary-style",
  "High contrast",
  "Desaturated",
  "Neo-noir",
  "Intimate",
  "Epic scale",
] as const;

export const TONE_REFERENCE_CHIPS = [
  "The Revenant",
  "Nomadland",
  "Moonlight",
  "Prisoners",
  "Chungking Express",
  "Blade Runner 2049",
  "Children of Men",
  "The Florida Project",
  "Drive",
  "Sicario",
] as const;

export const CAMERA_PREFERENCE_CHIPS = [
  "Wide masters first",
  "Minimal handheld",
  "Slow dolly",
  "Steadicam fluid",
  "Locked-off frames",
  "Anamorphic look",
  "Natural light only",
  "Shallow depth of field",
  "Long takes",
  "Coverage-heavy",
] as const;

const GENRE_STYLE: Record<string, string[]> = {
  "ai-native": ["Modular prompts", "2.39:1 film still", "Look bible locked"],
  drama: ["Slow-burn", "Naturalistic", "Intimate"],
  documentary: ["Documentary-style", "Handheld", "Natural light only"],
  horror: ["High contrast", "Handheld", "Neo-noir"],
  thriller: ["High contrast", "Cinematic", "Shallow depth of field"],
  comedy: ["Naturalistic", "Coverage-heavy", "Wide masters first"],
};

const GENRE_TONE: Record<string, string[]> = {
  "ai-native": ["Midjourney stills", "Higgsfield motion", "LTX video"],
  drama: ["Nomadland", "Moonlight", "The Florida Project"],
  documentary: ["Nomadland", "Children of Men"],
  horror: ["The Revenant", "Prisoners", "Sicario"],
  thriller: ["Prisoners", "Sicario", "Drive"],
};

const GENRE_CAMERA: Record<string, string[]> = {
  "ai-native": ["Master-wide first", "Coverage then inserts", "One generation per shot"],
  drama: ["Wide masters first", "Minimal handheld", "Long takes"],
  documentary: ["Handheld", "Natural light only", "Locked-off frames"],
  horror: ["Slow dolly", "Shallow depth of field", "High contrast"],
};

export function appendChipValue(current: string, chip: string): string {
  const parts = current
    .split(/[,;]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.some((p) => p.toLowerCase() === chip.toLowerCase())) return current;
  return parts.length ? `${parts.join(", ")}, ${chip}` : chip;
}

export function suggestVisionFromGenre(rules: DirectorRulesState): {
  styleNotes: string;
  toneAndRefs: string;
  preferredShots: string;
} {
  const tag =
    rules.genreTags.find((t) => GENRE_STYLE[t.toLowerCase()])?.toLowerCase() ??
    rules.genreTags[0]?.toLowerCase() ??
    "drama";
  const style = GENRE_STYLE[tag] ?? GENRE_STYLE.drama!;
  const tone = GENRE_TONE[tag] ?? GENRE_TONE.drama!;
  const camera = GENRE_CAMERA[tag] ?? GENRE_CAMERA.drama!;
  return {
    styleNotes: style.join(", "),
    toneAndRefs: tone.join(", "),
    preferredShots: camera.join(", "),
  };
}
