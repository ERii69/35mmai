import type {
  DirectorRulesState,
  MoodBoardReference,
  ProjectStatePayload,
  StagedVisualSuggestion,
} from "@/lib/pro/types";
import { isProseToneReference } from "@/lib/pro/suggest-look-references";

/** Deterministic mood board when native agents are unavailable. */
export function buildLocalMoodBoard(
  state: ProjectStatePayload,
  opts?: { templateOffset?: number }
): StagedVisualSuggestion {
  const rules = state.directorPrep.directorRules;
  const scenes = state.directorPrep.scenes;
  const mood = synthesizeMood(rules, state.directorPrep.agentMeta.visualMood);
  const palette = synthesizePalette(rules, state.visualBible.palette);
  const sceneRefs = scenes.flatMap((s) => s.visualRefs).filter(Boolean).slice(0, 8);
  const toneRefs = rules.toneAndRefs
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && !isProseToneReference(s))
    .slice(0, 6);
  const refs = [...state.visualBible.referenceUrls, ...sceneRefs, ...toneRefs];
  const uniqueRefs = [...new Set(refs)].slice(0, 12);
  const moodBoardReferences = buildLocalMoodBoardReferences(rules, mood, palette, opts?.templateOffset);
  const lensAndFraming = inferLens(rules);
  const grainAndTexture = inferGrain(rules, mood);

  return {
    suggestionId: `local-mood-${Date.now()}`,
    status: "pending",
    confidence: scenes.length > 0 ? 72 : 55,
    mood,
    palette,
    designNotes: [
      "## Lighting approach",
      inferLighting(rules, mood),
      "",
      "## Production design",
      rules.styleNotes.trim() || "Ground sets in practical texture from director style notes.",
      scenes.length
        ? `\nDerived from ${scenes.length} scene${scenes.length === 1 ? "" : "s"} in prep.`
        : "\nAdd scenes in Prep for tighter look alignment.",
      "",
      formatReferencesMarkdown(moodBoardReferences),
    ]
      .filter(Boolean)
      .join("\n"),
    referenceUrls: uniqueRefs,
    moodBoardReferences,
    lensAndFraming,
    grainAndTexture,
    lightingApproach: inferLighting(rules, mood),
  };
}

function buildLocalMoodBoardReferences(
  rules: DirectorRulesState,
  mood: string,
  palette: string[],
  templateOffset = 0
): MoodBoardReference[] {
  const tone = `${rules.toneAndRefs} ${rules.styleNotes}`.toLowerCase();
  const paletteLine = palette.slice(0, 3).join(", ");
  const templates = [
    {
      title: "Motivated natural key",
      description: "Single soft source with controlled negative fill",
      technicalNotes: "5600K window key, 3:1 ratio, 35mm spherical, lifted blacks",
      whyItFits: `Supports mood: ${mood.slice(0, 80)}`,
      filmReference: tone.includes("rural") ? "Days of Heaven" : "Roger Deakins interior work",
    },
    {
      title: "Contrast accent",
      description: "Edge light separating subject from environment",
      technicalNotes: "Tungsten rim ~3200K, minimal fill, 50mm, shallow stop",
      whyItFits: "Adds cinematic separation without breaking naturalistic bible",
      filmReference: "Prisoners (2013) night interiors",
    },
    {
      title: "Palette still life",
      description: `Environmental textures echoing ${paletteLine || "locked palette"}`,
      technicalNotes: "Overcast skylight 6500K, desaturated mids, no crushed blacks",
      whyItFits: "Locks color keys for art department and grade",
      filmReference: "Moonlight (2016) color script",
    },
    {
      title: "Handheld intimacy",
      description: "Close coverage with subtle movement",
      technicalNotes: "40mm handheld, available light, fine grain",
      whyItFits: rules.preferredShots.toLowerCase().includes("handheld")
        ? "Matches director preferred shots"
        : "Optional texture for emotional scenes",
      filmReference: "The Florida Project",
    },
    {
      title: "Wide geography",
      description: "Establishing scale and isolation",
      technicalNotes: "24mm, deep stop, natural haze, cool shadow bias",
      whyItFits: "Sets spatial rules for exteriors",
      filmReference: tone.includes("noir") ? "Blade Runner 2049" : "Nomadland",
    },
  ];

  const offset = ((templateOffset % templates.length) + templates.length) % templates.length;
  const rotated = [...templates.slice(offset), ...templates.slice(0, offset)];

  return rotated.map((t, i) => ({
    id: `local-mbr-${offset}-${i}`,
    ...t,
  }));
}

function formatReferencesMarkdown(refs: MoodBoardReference[]): string {
  return (
    "## Mood board references\n" +
    refs
      .map(
        (r) =>
          `### ${r.title}\n${r.description}\n**Technical:** ${r.technicalNotes}\n**Why it fits:** ${r.whyItFits}\n**Ref:** ${r.filmReference}`
      )
      .join("\n\n")
  );
}

function synthesizeMood(rules: DirectorRulesState, existingMood: string): string {
  if (existingMood.trim()) return existingMood.trim();
  const parts = [rules.styleNotes, rules.toneAndRefs, rules.projectInstructions]
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length) return parts.join(" · ").slice(0, 400);
  return "Naturalistic cinematic — define style in Prep → Vision, then regenerate.";
}

function synthesizePalette(rules: DirectorRulesState, existing: string[]): string[] {
  if (existing.length) return existing.slice(0, 8);
  const tone = `${rules.styleNotes} ${rules.toneAndRefs}`.toLowerCase();
  if (tone.includes("noir") || tone.includes("neon")) {
    return ["Deep charcoal", "Sodium amber", "Cool cyan accent", "Crushed blacks"];
  }
  if (tone.includes("warm") || tone.includes("golden")) {
    return ["Warm tungsten", "Honey highlight", "Olive shadow", "Soft cream"];
  }
  if (tone.includes("rural") || tone.includes("natural")) {
    return ["Muted sage", "Overcast sky grey", "Weathered wood", "Soft dawn gold"];
  }
  return ["Neutral base", "Skin-safe midtone", "Environmental shadow", "Highlight roll-off"];
}

function inferLens(rules: DirectorRulesState): string {
  const pref = rules.preferredShots.toLowerCase();
  if (pref.includes("anamorphic")) return "40mm / 75mm anamorphic; 2.39:1; oval bokeh on close-ups";
  if (pref.includes("wide")) return "24mm / 35mm spherical; composed for wides with depth in foreground";
  return "35mm / 50mm spherical; shallow depth reserved for close-ups";
}

function inferGrain(rules: DirectorRulesState, mood: string): string {
  const m = `${rules.styleNotes} ${mood}`.toLowerCase();
  if (m.includes("noir") || m.includes("grain")) return "Medium 35mm grain; retain texture in shadows";
  if (m.includes("clean") || m.includes("digital")) return "Fine grain; avoid sharpening halos";
  return "Fine photochemical grain; gentle halation on highlights";
}

function inferLighting(rules: DirectorRulesState, mood: string): string {
  const m = `${rules.styleNotes} ${mood}`.toLowerCase();
  if (m.includes("noir") || m.includes("contrast")) {
    return "Motivated practicals with strong negative fill; 8:1 ratio on hero frames; no unmotivated fill.";
  }
  if (m.includes("soft") || m.includes("natural")) {
    return "Soft directional key (window or bounce); 3:1 ratio; 5600K day / 3200K night accents.";
  }
  return "Motivated sources only; match color temperature per location bible.";
}
