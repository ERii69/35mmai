import { parseLocationFromHeading } from "@/lib/pro/locations-from-scenes";
import { suggestBudgetFromScenes } from "@/lib/pro/budget-from-scenes";
import { buildScriptToPromptShotNotes } from "@/lib/pro/build-script-to-prompt-shots";
import {
  buildLocalBudgetSummary,
  buildLocalShotCoverageNotes,
  buildLocalVisualPackage,
} from "@/lib/pro/local-prep-enrichment";
import type { PrepPipelineAgentId } from "@/lib/pro/agent-roster";
import type { ScriptToPrepImport } from "@/lib/pro/import-script-to-prep";
import {
  parseScenesFromScreenplayText,
  screenplayTextForLocalParse,
} from "@/lib/pro/parse-scene-headings";
import type {
  AgentStagingBundle,
  DirectorRulesState,
  PrepRunSettings,
  SceneRow,
  ScreenplayState,
  StagedSceneSuggestion,
} from "@/lib/pro/types";
import { locationsFromSceneRows, type ParsedLocationFromScenes } from "@/lib/pro/locations-from-scenes";
import {
  buildStagingCharactersFromScript,
  buildStagingLocationsFromScript,
  type BuildStagingLocationsOptions,
} from "@/lib/pro/build-staging-world";

export { parseScenesFromScreenplayText } from "@/lib/pro/parse-scene-headings";

export type LocalPrepBuild = ScriptToPrepImport & {
  parsedLocations: ParsedLocationFromScenes[];
  visual: ReturnType<typeof buildLocalVisualPackage>;
};

export function scenesToStagedSuggestions(scenes: SceneRow[]): StagedSceneSuggestion[] {
  return scenes.map((scene, i) => ({
    suggestionId: `parsed-scene-${Date.now()}-${i}`,
    status: "pending" as const,
    confidence: 72,
    scene,
  }));
}

export function buildLocalPrepImport(input: {
  screenplay: ScreenplayState;
  rules: DirectorRulesState;
  prepRunSettings: PrepRunSettings;
  projectName: string;
  promptPack?: boolean;
}): LocalPrepBuild | { error: string } {
  const fullScript = screenplayTextForLocalParse(input.screenplay.rawText);
  let scenes = parseScenesFromScreenplayText(fullScript);

  const excerpt = input.prepRunSettings.analysisExcerpt.trim();
  if (scenes.length === 0 && excerpt) {
    scenes = parseScenesFromScreenplayText(excerpt);
  }

  if (scenes.length === 0) {
    let error =
      "No scene headings found. Use standard lines like INT. KITCHEN - NIGHT, or add ANTHROPIC_API_KEY for AI breakdown.";
    if (excerpt) {
      error +=
        " Your optional excerpt in step 1 has no headings — clear it or paste INT./EXT. lines there.";
    }
    return { error };
  }

  const visual = buildLocalVisualPackage(input.rules, scenes, { promptPack: input.promptPack });
  const visualHints = {
    mood: visual.mood,
    palette: visual.palette,
    lens: visual.lensAndFraming,
    lighting: visual.lightingApproach,
  };

  const scenesWithShots = scenes.map((s) => ({
    ...s,
    shotNotes: input.promptPack
      ? buildScriptToPromptShotNotes(s, input.rules, visualHints)
      : buildLocalShotCoverageNotes(s, input.rules),
  }));

  const parsedLocations = locationsFromSceneRows(scenesWithShots);
  const locations = parsedLocations.map((l) => l.name);

  const budget = suggestBudgetFromScenes(scenesWithShots.length, input.rules.budgetTier);
  const budgetSummaryText = buildLocalBudgetSummary(scenesWithShots, input.rules.budgetTier);

  const shotSequences = scenesWithShots.map((s) => ({
    id: `seq-local-${s.number}`,
    title: s.heading || `Scene ${s.number}`,
    notes: s.shotNotes,
    sceneNumber: s.number,
  }));

  return {
    executiveSummary: `Quick prep: ${scenesWithShots.length} scene${scenesWithShots.length === 1 ? "" : "s"} from "${input.projectName || input.screenplay.title || "Untitled"}".`,
    visualMood: visual.mood,
    budgetSummaryText,
    budgetTier: input.rules.budgetTier,
    locations,
    scenes: scenesWithShots,
    shotSequences,
    parsedLocations,
    visual,
  };
}

export function buildLocalPrepStaging(
  data: LocalPrepBuild,
  runId: string,
  screenplayRaw: string,
  options: BuildStagingLocationsOptions = {}
): AgentStagingBundle {
  const locRows = data.parsedLocations;
  const stagedCharacters = buildStagingCharactersFromScript(screenplayRaw);
  const stagedLocations = buildStagingLocationsFromScript(screenplayRaw, data.scenes, "local-loc", options);

  const stagedScenes: StagedSceneSuggestion[] = data.scenes.map((scene, i) => ({
    suggestionId: `local-scene-${i}`,
    status: "pending" as const,
    confidence: 70,
    scene,
  }));

  const visualPkg = data.visual;

  return {
    runId,
    status: "review",
    createdAt: new Date().toISOString(),
    executiveSummary: data.executiveSummary,
    researchNotes: [
      stagedCharacters.length
        ? [
            `${stagedCharacters.length} character${stagedCharacters.length === 1 ? "" : "s"} from your script:`,
            stagedCharacters.map((c) => `• ${c.name}${c.notes ? ` — ${c.notes}` : ""}`).join("\n"),
          ].join("\n")
        : null,
      locRows.length || stagedLocations.length
        ? options.promptPack
          ? `${Math.max(locRows.length, stagedLocations.length)} scene setting${Math.max(locRows.length, stagedLocations.length) === 1 ? "" : "s"} from scene headings.`
          : `${Math.max(locRows.length, stagedLocations.length)} filming location${Math.max(locRows.length, stagedLocations.length) === 1 ? "" : "s"} from scene headings.`
        : null,
      locRows.map((l) => `• ${l.name} (scenes ${l.sceneNumbers.join(", ")})`).join("\n"),
    ]
      .filter(Boolean)
      .join("\n\n"),
    scenes: stagedScenes,
    shotSequences: data.shotSequences.map((s, i) => ({
      suggestionId: `local-shot-${i}`,
      status: "pending" as const,
      confidence: 65,
      sceneNumber: s.sceneNumber,
      title: s.title,
      notes: s.notes,
    })),
    locations: stagedLocations.length
      ? stagedLocations
      : locRows.map((loc, i) => ({
          suggestionId: `local-loc-${i}`,
          status: "pending" as const,
          confidence: 60,
          name: loc.name,
          notes: `Scenes ${loc.sceneNumbers.join(", ")} · ${loc.sourceHeading}`,
          sceneNumbers: loc.sceneNumbers,
        })),
    characters: stagedCharacters,
    budget: {
      suggestionId: "local-budget",
      status: "pending",
      confidence: 60,
      tier: data.budgetTier ?? "indie",
      summary: data.budgetSummaryText,
      monthlyToolingUsdLow: null,
      monthlyToolingUsdHigh: null,
    },
    visual: {
      suggestionId: "local-visual",
      status: "pending",
      confidence: 60,
      mood: data.visualMood,
      palette: visualPkg.palette,
      designNotes: visualPkg.designNotes,
      referenceUrls: [],
      lensAndFraming: visualPkg.lensAndFraming,
      lightingApproach: visualPkg.lightingApproach,
    },
    refineHint: null,
  };
}

export type FilterLocalStagingOptions = {
  /** Scene settings from headings stay with Script analyzer, not Research. */
  promptPack?: boolean;
};

/** Keep only staging sections the user selected for this prep run. */
export function filterLocalStagingByAgents(
  staging: AgentStagingBundle,
  agents: PrepPipelineAgentId[],
  options: FilterLocalStagingOptions = {}
): AgentStagingBundle {
  const pick = (id: PrepPipelineAgentId) => agents.includes(id);
  const includeSceneSettings =
    pick("research") || (options.promptPack === true && pick("script_analyzer"));
  return {
    ...staging,
    scenes: pick("script_analyzer") ? staging.scenes : [],
    locations: includeSceneSettings ? staging.locations : [],
    characters: pick("research") ? staging.characters : [],
    shotSequences: pick("shot_list") || options.promptPack ? staging.shotSequences : [],
    budget: pick("budget") ? staging.budget : null,
    visual: pick("visual_bible") ? staging.visual : null,
    researchNotes: pick("research")
      ? staging.researchNotes
      : includeSceneSettings && staging.locations.length > 0
        ? `${staging.locations.length} scene setting${staging.locations.length === 1 ? "" : "s"} from scene headings.`
        : "",
    executiveSummary:
      pick("script_analyzer") || staging.scenes.length === 0
        ? staging.executiveSummary
        : `Quick prep — ${agents.join(", ")}.`,
  };
}
