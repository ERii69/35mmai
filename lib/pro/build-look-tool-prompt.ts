import { getToolByRank } from "@/app/data";
import type { LookToolSection } from "@/lib/pro/look-tool-sections";
import type { ProjectStatePayload } from "@/lib/pro/types";

function moodLine(state: ProjectStatePayload): string {
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  const tone = state.directorPrep.directorRules.toneAndRefs.trim();
  if (mood && tone) return `${mood}. References: ${tone}`;
  return mood || tone || "Cinematic mood board reference";
}

function paletteLine(state: ProjectStatePayload): string {
  const swatches = state.visualBible.palette.filter(Boolean);
  if (swatches.length === 0) return "";
  return `Palette: ${swatches.join(", ")}`;
}

function lensLine(state: ProjectStatePayload): string {
  return state.visualBible.lensAndFraming.trim();
}

function grainLine(state: ProjectStatePayload): string {
  return state.visualBible.grainAndTexture.trim();
}

function avoidLine(state: ProjectStatePayload): string {
  const notes = state.visualBible.negativePromptNotes.trim();
  if (!notes) return "";
  return `Avoid: ${notes}`;
}

function filmRefTitles(state: ProjectStatePayload): string {
  const fromBoard = state.visualBible.moodBoardReferences
    .map((r) => r.title?.trim())
    .filter(Boolean)
    .slice(0, 3);
  if (fromBoard.length > 0) return fromBoard.join(", ");
  const fromUrls = state.visualBible.referenceUrls
    .filter((u) => !u.startsWith("data:image") && !u.startsWith("http"))
    .slice(0, 3);
  return fromUrls.join(", ");
}

function buildMoodPrompt(state: ProjectStatePayload, rank: number): string {
  const mood = moodLine(state);
  const films = filmRefTitles(state);
  const palette = paletteLine(state);
  const avoid = avoidLine(state);

  if (rank === 75) {
    const attrs = [mood, lensLine(state), palette].filter(Boolean).join("; ");
    const filmBit = films ? ` Film references: ${films}.` : "";
    return `Search look deck — ${attrs}.${filmBit} Tag by lighting, lens, composition, and mood.`;
  }

  if (rank === 40) {
    const parts = [
      mood,
      films ? `inspired by ${films}` : "",
      palette,
      "2.39:1 cinematic still, style-consistent mood board frame",
      avoid,
    ].filter(Boolean);
    return parts.join(", ");
  }

  // Midjourney (6) and default mood generators
  const parts = [
    "Cinematic concept art",
    mood,
    films ? `${films} visual reference` : "",
    palette,
    "highly detailed, dramatic lighting, film still",
    avoid,
  ].filter(Boolean);
  return parts.join(", ");
}

function buildLensPrompt(state: ProjectStatePayload, rank: number): string {
  const lens = lensLine(state) || "35mm spherical, shallow depth of field";
  const mood = state.directorPrep.agentMeta.visualMood.trim();
  const palette = paletteLine(state);
  const avoid = avoidLine(state);

  if (rank === 2) {
    const parts = [
      mood || "Cinematic scene",
      lens,
      palette,
      "slow motion, highly detailed, 4K",
      avoid,
    ].filter(Boolean);
    return parts.join(", ");
  }

  if (rank === 4) {
    const parts = [
      mood || "Storyboard frame",
      lens,
      palette,
      "production-ready storyboard still, consistent character and location",
      avoid,
    ].filter(Boolean);
    return parts.join(", ");
  }

  // Higgsfield (1) — matches catalog examplePrompt shape
  const parts = [
    mood || "Cinematic scene",
    lens.includes("shot on") ? lens : `shot on ${lens}`,
    palette.replace(/^Palette: /, ""),
    "cinematic film grain",
    avoid,
  ].filter(Boolean);
  return parts.join(", ");
}

function buildGrainPrompt(state: ProjectStatePayload, rank: number): string {
  const grain = grainLine(state) || "Subtle cinematic film grain, organic texture";
  const lens = lensLine(state);
  const avoid = avoidLine(state);

  if (rank === 9) {
    const parts = [
      "Enhance footage with",
      grain,
      lens ? `while preserving ${lens}` : "",
      "denoise lightly, sharpen details, maintain natural grain structure",
      avoid,
    ].filter(Boolean);
    return parts.join(" ");
  }

  const parts = [
    moodLine(state),
    lens,
    grain,
    "apply cinematic finish without over-sharpening",
    avoid,
  ].filter(Boolean);
  return parts.join(", ");
}

function buildPalettePrompt(state: ProjectStatePayload, rank: number): string {
  const palette = paletteLine(state) || "Warm amber key, cool cyan shadows";
  const mood = moodLine(state);
  const grain = grainLine(state);
  const avoid = avoidLine(state);

  if (rank === 19) {
    const parts = [
      "Color grade toward",
      palette.replace(/^Palette: /, ""),
      mood,
      grain ? `Texture: ${grain}` : "",
      "match day/night and interior/exterior sections consistently",
      avoid,
    ].filter(Boolean);
    return parts.join(". ");
  }

  const parts = [
    mood,
    palette,
    grain,
    "final cinematic grade, consistent mood across scenes",
    avoid,
  ].filter(Boolean);
  return parts.join(", ");
}

/** Assemble a copy-ready prompt for an external tool from the visual bible. */
export function buildLookToolPrompt(
  state: ProjectStatePayload,
  section: LookToolSection,
  toolRank: number
): string {
  const tool = getToolByRank(toolRank);
  const fallback = tool?.examplePrompt?.trim() ?? "";

  let built: string;
  switch (section) {
    case "mood":
      built = buildMoodPrompt(state, toolRank);
      break;
    case "lens":
      built = buildLensPrompt(state, toolRank);
      break;
    case "grain":
      built = buildGrainPrompt(state, toolRank);
      break;
    case "palette":
      built = buildPalettePrompt(state, toolRank);
      break;
  }

  const trimmed = built.trim();
  if (trimmed.length < 12 && fallback) return fallback;
  return trimmed;
}
