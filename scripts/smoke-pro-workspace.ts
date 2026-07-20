/**
 * PRO workspace smoke tests — import/apply/export/validate (no live DB).
 */
import assert from "node:assert/strict";
import { applyScriptToPrep } from "../lib/pro/apply-script-to-prep";
import { createEmptyProjectState } from "../lib/pro/project-state-defaults";
import { buildPreProductionReportMd } from "../lib/pro/preproduction-report-md";
import { buildScriptToPrepAgentPrompt } from "../lib/pro/script-to-prep-prompt";
import { importScenesFromJson } from "../lib/pro/import-scenes-json";
import {
  importScriptToPrepJson,
  previewScriptToPrepImport,
} from "../lib/pro/import-script-to-prep";
import { normalizeProjectState, validateProjectStatePayload } from "../lib/pro/validate-project-state";
import { locationsFromApprovedScenes } from "../lib/pro/locations-from-scenes";
import { suggestBudgetFromShotPlan } from "../lib/pro/budget-from-shot-plan";
import { suggestBudgetForPanel } from "../lib/pro/budget-from-panel";
import { hasVisionEligibleStills } from "../lib/pro/agents/reference-vision-agent";
import { ensureShotPlanFromScript } from "../lib/pro/ensure-shot-plan-from-script";
import { buildFdxExport } from "../lib/pro/fdx-export";
import { buildFountainExport } from "../lib/pro/fountain-export";
import { generateShotPlanFromPrep } from "../lib/pro/generate-shot-plan-from-prep";
import { buildStoryboardHtml } from "../lib/pro/storyboard-export";
import { getCoverageGaps } from "../lib/pro/shot-plan-stats";
import { parseScenesFromScreenplayText } from "../lib/pro/parse-scene-headings";
import { parseLocationFromHeading } from "../lib/pro/locations-from-scenes";
import { buildStagingLocationsFromScript } from "../lib/pro/build-staging-world";
import { parseCharacterNamesFromScreenplay } from "../lib/pro/parse-character-names";
import { parseLocationsFromScreenplayText } from "../lib/pro/parse-locations-from-screenplay";
import { generateWorldFromScript } from "../lib/pro/apply-world-bible";
import { formatSceneSlugline } from "../lib/pro/scene-heading-format";
import { buildLocalPrepImport, buildLocalPrepStaging, filterLocalStagingByAgents } from "../lib/pro/local-prep-from-screenplay";
import { buildScriptToPromptShotNotes } from "../lib/pro/build-script-to-prompt-shots";
import { createDefaultPrepRunSettings } from "../lib/pro/prep-run-settings";
import { applyVisualRefsToShots } from "../lib/pro/apply-visual-refs-to-shots";
import { checkVisualConsistency } from "../lib/pro/visual-consistency-check";
import { buildLookToolPrompt } from "../lib/pro/build-look-tool-prompt";
import {
  getFilledLookSections,
  shouldShowLookToolStrip,
} from "../lib/pro/look-tool-sections";
import { getLookToolSuggestions } from "../lib/pro/recommended-look-tools";
import { referenceListKey } from "../lib/pro/reference-url-utils";
import {
  activePipelineStep,
  lookTabsForState,
  usesScriptToPromptPipeline,
  workspaceNavForState,
} from "../lib/pro/workspace-pipeline";
import {
  LOOK_TABS,
  POST_TABS,
  productionTabsForState,
  WORKSPACE_MODES,
} from "../lib/pro/workspace-modes";
import { buildTemplateState, DEFAULT_DIRECTOR_PREP_TEMPLATE_ID, mergeDirectorPrepTemplate } from "../lib/pro/templates";
import { applyInstantDemoPrep } from "../lib/pro/instant-demo-prep";
import { rebuildShotPromptInState } from "../lib/pro/sync-shot-prompts";
import { SCRIPT_TO_PROMPT_DEFAULT_AGENTS } from "../lib/pro/script-to-prompt-template";
import { synthesizeVisualBeatsFromScenes, countPromptsInStaging } from "../lib/pro/synthesize-visual-beats";
import { getProjectProgressStats } from "../lib/pro/project-progress-stats";
import { getNextWorkspaceStep } from "../lib/pro/next-workspace-step";
import { buildShotToolPrompt } from "../lib/pro/build-shot-tool-prompt";
import { shotsFromNotes } from "../lib/pro/apply-agent-shot-list";
import { reconcileShotPlanForTemplate } from "../lib/pro/reconcile-template-shot-plan";
import { newPlannedShot } from "../lib/pro/shot-plan";
import { runPromptEngineSmoke } from "./prompt-engine-smoke";

const SAMPLE_AGENT_JSON = `
\`\`\`json
{
  "executiveSummary": "A tense micro-budget night interior with two exterior beats.",
  "visualMood": "Warm tungsten interiors, neon alley spill, natural daylight confrontation.",
  "locations": ["KITCHEN", "ALLEY", "APARTMENT"],
  "scenes": [
    {
      "number": 1,
      "heading": "INT. KITCHEN - NIGHT",
      "oneLine": "She discovers the letter.",
      "intExt": "INT",
      "dayNight": "NIGHT",
      "visualRefs": ["Chungking Express", "warm tungsten"],
      "shotNotes": "Wide master, slow push-in."
    },
    {
      "number": 2,
      "heading": "EXT. ALLEY - NIGHT",
      "oneLine": "He runs into the rain.",
      "intExt": "EXT",
      "dayNight": "NIGHT",
      "visualRefs": ["Blade Runner 2049 alley"],
      "shotNotes": "Handheld, neon spill."
    },
    {
      "number": 3,
      "heading": "INT. APARTMENT - DAY",
      "oneLine": "They confront each other.",
      "intExt": "INT",
      "dayNight": "DAY",
      "visualRefs": [],
      "shotNotes": "Two-shot, natural window light."
    }
  ],
  "shotSequences": [
    {
      "sceneNumber": 1,
      "title": "Scene 1 — INT. KITCHEN - NIGHT",
      "shots": ["1A — Wide master", "1B — CU letter"]
    },
    {
      "sceneNumber": 2,
      "title": "Scene 2 — EXT. ALLEY - NIGHT",
      "shots": ["2A — Handheld run"]
    }
  ],
  "budgetEstimate": {
    "tier": "indie",
    "summary": "Micro-budget AI-assisted short.",
    "monthlyToolingUsdLow": 40,
    "monthlyToolingUsdHigh": 95
  }
}
\`\`\`
`;

const LEGACY_SCENES_ONLY = `{"scenes":[{"heading":"INT. KITCHEN - NIGHT","oneLine":"Test","intExt":"INT","dayNight":"NIGHT","visualRefs":["Ref A"],"shotNotes":"Note"}]}`;

let passed = 0;
let failed = 0;

function ok(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (e) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${e instanceof Error ? e.message : String(e)}`);
    failed += 1;
  }
}

console.log("\n35mmAiPro workspace smoke\n");

ok("importScriptToPrepJson parses fenced agent JSON", () => {
  const r = importScriptToPrepJson(SAMPLE_AGENT_JSON, 0);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.data.scenes.length, 3);
  assert.equal(r.data.locations.length, 3);
  assert.equal(r.data.shotSequences.length, 2);
  assert.ok(r.data.executiveSummary.includes("micro-budget"));
  assert.equal(r.data.budgetTier, "indie");
});

ok("previewScriptToPrepImport returns counts", () => {
  const p = previewScriptToPrepImport(SAMPLE_AGENT_JSON);
  assert.equal(p.ok, true);
  if (!p.ok) return;
  assert.equal(p.sceneCount, 3);
  assert.equal(p.shotSequenceCount, 2);
});

ok("applyScriptToPrep fills workspace (replace)", () => {
  const base = createEmptyProjectState();
  base.directorPrep.screenplay.rawText = "INT. KITCHEN\nShe reads.";
  base.directorPrep.screenplay.title = "Smoke Test";
  const imported = importScriptToPrepJson(SAMPLE_AGENT_JSON, 0);
  assert.equal(imported.ok, true);
  if (!imported.ok) return;

  const next = applyScriptToPrep(base, imported.data, {
    mode: "replace",
    applyBudgetLines: true,
  });

  assert.equal(next.directorPrep.scenes.length, 3);
  assert.equal(next.shotPlan.sequences.length, 2);
  assert.ok(next.worldBible.locations.includes("KITCHEN"));
  assert.ok(next.directorPrep.agentMeta.executiveSummary.length > 0);
  assert.ok(next.directorPrep.scenes[0].linkedSequenceId);
  assert.ok(next.budget.microTools.length > 0);
  assert.ok(next.visualBible.referenceUrls.includes("Chungking Express"));
});

ok("importScenesFromJson (legacy scenes-only)", () => {
  const r = importScenesFromJson(LEGACY_SCENES_ONLY, 0);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.scenes.length, 1);
  assert.equal(r.scenes[0].status, "draft");
});

ok("buildPreProductionReportMd includes key sections", () => {
  const base = createEmptyProjectState();
  const imported = importScriptToPrepJson(SAMPLE_AGENT_JSON, 0);
  assert.equal(imported.ok, true);
  if (!imported.ok) return;
  const state = applyScriptToPrep(base, imported.data, {
    mode: "replace",
    applyBudgetLines: true,
  });
  state.directorPrep.scenes[0].status = "approved";
  state.directorPrep.scenes[1].status = "approved";
  state.directorPrep.scenes[2].status = "approved";

  const md = buildPreProductionReportMd(state, "Smoke Project", true);
  assert.ok(md.includes("# Pre-Production Report"));
  assert.ok(md.includes("## Executive summary"));
  assert.ok(md.includes("## Scene breakdown"));
  assert.ok(md.includes("INT. KITCHEN - NIGHT"));
  assert.ok(md.includes("## Shot lists"));
  assert.ok(md.includes("## Budget estimate"));
  assert.ok(md.includes("## Next steps"));
});

ok("buildScriptToPrepAgentPrompt includes script text", () => {
  const rules = createEmptyProjectState().directorPrep.directorRules;
  const prompt = buildScriptToPrepAgentPrompt(rules, "INT. TEST - DAY\nHello.", "My Film");
  assert.ok(prompt.includes("Script-to-Pre-Production Agent"));
  assert.ok(prompt.includes("INT. TEST - DAY"));
  assert.ok(prompt.includes("shotSequences"));
  assert.ok(prompt.includes("My Film"));
});

ok("normalizeProjectState adds agentMeta on legacy v3 payload", () => {
  const legacy = {
    schemaVersion: 3,
    kit: [],
    workflow: { stageIndex: 0 },
    budget: createEmptyProjectState().budget,
    worldBible: { notes: "", characters: [], locations: [] },
    visualBible: createEmptyProjectState().visualBible,
    shotPlan: { sequences: [] },
    postChecklist: { items: [] },
    directorPrep: {
      directorRules: createEmptyProjectState().directorPrep.directorRules,
      screenplay: createEmptyProjectState().directorPrep.screenplay,
      scenes: [],
      snapshots: [],
    },
  };
  const n = normalizeProjectState(legacy);
  assert.ok(n.directorPrep.agentMeta);
  assert.equal(n.directorPrep.agentMeta.executiveSummary, "");
  assert.ok(n.directorPrep.agentMemory);
  assert.equal(n.directorPrep.agentMemory.decisions.length, 0);
  assert.equal(n.directorPrep.agentStaging, null);
});

ok("normalizeAgentStaging round-trips shot/location/budget/visual", () => {
  const staging = {
    runId: "run-test",
    status: "review" as const,
    createdAt: new Date().toISOString(),
    executiveSummary: "Test summary",
    researchNotes: "Long research offloaded",
    refineHint: null,
    scenes: [
      {
        suggestionId: "sg-1",
        status: "pending" as const,
        confidence: 88,
        scene: {
          id: "scene-1",
          number: 1,
          heading: "INT. TEST - DAY",
          oneLine: "Test scene",
          intExt: "INT" as const,
          dayNight: "DAY" as const,
          visualRefs: [],
          shotNotes: "",
          status: "draft" as const,
          linkedSequenceId: null,
        },
      },
    ],
    shotSequences: [
      {
        suggestionId: "shot-1",
        status: "pending" as const,
        confidence: 75,
        sceneNumber: 1,
        title: "Scene 1 shots",
        notes: "Wide, CU",
      },
    ],
    locations: [
      {
        suggestionId: "loc-1",
        status: "approved" as const,
        confidence: 90,
        name: "TEST",
        notes: "Studio backlot",
      },
    ],
    characters: [],
    budget: {
      suggestionId: "budget-1",
      status: "pending" as const,
      confidence: 65,
      tier: "indie" as const,
      summary: "Micro budget",
      monthlyToolingUsdLow: 40,
      monthlyToolingUsdHigh: 90,
    },
    visual: {
      suggestionId: "visual-1",
      status: "pending" as const,
      confidence: 80,
      mood: "Neo-noir warmth",
      palette: ["#1a1a1a", "#e11d48"],
      designNotes: "High contrast",
      referenceUrls: ["https://example.com/ref"],
    },
  };
  const base = createEmptyProjectState();
  base.directorPrep.agentStaging = staging;
  const n = normalizeProjectState(base);
  const s = n.directorPrep.agentStaging;
  assert.ok(s);
  assert.equal(s!.shotSequences.length, 1);
  assert.equal(s!.locations[0].name, "TEST");
  assert.equal(s!.budget?.summary, "Micro budget");
  assert.equal(s!.visual?.mood, "Neo-noir warmth");
});

ok("locationsFromApprovedScenes parses headings", () => {
  const imported = importScriptToPrepJson(SAMPLE_AGENT_JSON, 0);
  assert.equal(imported.ok, true);
  if (!imported.ok) return;
  const scenes = imported.data.scenes.map((s) => ({ ...s, status: "approved" as const }));
  const locs = locationsFromApprovedScenes(scenes);
  assert.ok(locs.includes("Kitchen"));
  assert.ok(locs.includes("Alley"));
});

ok("buildStagingLocationsFromScript prefers scene-linked notes", () => {
  const scenes = parseScenesFromScreenplayText("DAY - FIELDS\n\nShe runs.\n\nINT. KITCHEN - DAY\n\nMaya reads.");
  const staged = buildStagingLocationsFromScript("DAY - FIELDS\n\nINT. KITCHEN - DAY", scenes, "test-loc", {
    promptPack: true,
  });
  const fields = staged.find((l) => l.name === "Fields");
  assert.ok(fields);
  if (!fields) return;
  assert.match(fields.notes, /Scenes 1/);
  assert.match(fields.notes, /DAY - FIELDS/);
  assert.equal(fields.shootSuggestions?.length ?? 0, 0);
  assert.equal(fields.mapQuery, undefined);
});

ok("filterLocalStagingByAgents keeps scene settings for prompt pack without research", () => {
  const built = buildLocalPrepImport({
    screenplay: {
      title: "Test",
      draftLabel: "",
      pageEstimate: null,
      rawText: "EXT. FIELDS - DAY\n\nWide.\n\nINT. HOUSE - DAY\n\nTable.",
      lastImportedAt: null,
    },
    rules: createEmptyProjectState().directorPrep.directorRules,
    prepRunSettings: createDefaultPrepRunSettings(),
    projectName: "Test",
  });
  assert.equal("error" in built, false);
  if ("error" in built) return;
  const full = buildLocalPrepStaging(built, "run-1", "EXT. FIELDS - DAY\n\nINT. HOUSE - DAY", {
    promptPack: true,
  });
  const filtered = filterLocalStagingByAgents(full, ["script_analyzer", "visual_bible"], {
    promptPack: true,
  });
  assert.ok(filtered.locations.length > 0, "scene settings should stay with script analyzer");
  assert.equal(filtered.characters?.length ?? 0, 0, "characters require research agent");
  assert.ok(filtered.shotSequences.length > 0, "promptPack keeps visual beats without shot_list agent");
});

ok("script-to-prompt default agents omit shot_list", () => {
  assert.deepEqual(SCRIPT_TO_PROMPT_DEFAULT_AGENTS, ["script_analyzer", "visual_bible"]);
});

ok("synthesizeVisualBeatsFromScenes builds multiple prompts per scene", () => {
  const scenes = parseScenesFromScreenplayText(
    "INT. KITCHEN - DAY\n\nShe pours coffee.\n\nEXT. STREET - NIGHT\n\nRain on pavement."
  );
  const rules = createEmptyProjectState().directorPrep.directorRules;
  const beats = synthesizeVisualBeatsFromScenes(scenes, rules);
  assert.equal(beats.length, scenes.length);
  assert.ok(countPromptsInStaging(beats) >= scenes.length * 3);
});

ok("buildScriptToPromptShotNotes writes copy-ready generation prompts", () => {
  const scenes = parseScenesFromScreenplayText(
    "EXT. FIELDS - DAY\n\nSummer yellow fields. Camera approaches stone house covered in green vines.\n\nINT. HOUSE - DAY\n\nDoor opens. Huge room. Big wooden table."
  );
  assert.ok(scenes.length >= 2);
  const rules = createEmptyProjectState().directorPrep.directorRules;
  const extNotes = buildScriptToPromptShotNotes(scenes[0]!, rules);
  assert.match(extNotes, /\[establishing\]/i);
  assert.match(extNotes, /cinematic/i);
  assert.match(extNotes, /yellow fields|stone house|green vines/i);
  assert.doesNotMatch(extNotes, /Director note:/i);
  assert.doesNotMatch(extNotes, /character beat/i);

  const built = buildLocalPrepImport({
    screenplay: {
      title: "Test",
      draftLabel: "",
      pageEstimate: null,
      rawText: "EXT. FIELDS - DAY\n\nSummer yellow fields.\n\nINT. HOUSE - DAY\n\nDoor opens.",
      lastImportedAt: null,
    },
    rules,
    prepRunSettings: createDefaultPrepRunSettings(),
    projectName: "Test",
    promptPack: true,
  });
  assert.equal("error" in built, false);
  if ("error" in built) return;
  assert.match(built.shotSequences[0]?.notes ?? "", /cinematic/i);
  assert.doesNotMatch(built.shotSequences[0]?.notes ?? "", /Medium two-shot or singles/i);
});

ok("hasVisionEligibleStills detects data URLs", () => {
  const base = createEmptyProjectState();
  assert.equal(hasVisionEligibleStills(base), false);
  base.visualBible.referenceUrls = [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  ];
  assert.equal(hasVisionEligibleStills(base), true);
});

ok("checkVisualConsistency ignores library-synced photo refs", () => {
  const base = createEmptyProjectState();
  const photo =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  base.visualBible.referenceUrls = [photo];
  base.visualBible.palette = ["Muted sage", "Overcast sky grey"];
  base.directorPrep.agentMeta.visualMood = "Slow-burn, Naturalistic, Intimate";
  base.directorPrep.scenes = [
    {
      id: "s1",
      number: 1,
      heading: "INT. KITCHEN - DAY",
      oneLine: "Maya reads.",
      shotNotes: "",
      visualRefs: [photo],
      status: "approved",
      intExt: "INT",
      dayNight: "DAY",
      linkedSequenceId: null,
    },
  ];
  base.shotPlan.sequences = [
    {
      id: "seq-1",
      title: "Kitchen",
      sceneNumber: 1,
      notes: "",
      shots: [],
    },
  ];
  const synced = applyVisualRefsToShots(base);
  assert.equal(synced.directorPrep.scenes[0].visualRefs.length, 0, "strips duplicated photos from scenes");
  assert.equal(checkVisualConsistency(synced).length, 0);
  assert.ok(synced.shotPlan.sequences[0]?.notes.includes("1 reference photo"));
});

ok("parseScenesFromScreenplayText handles INT/EXT and numbered headings", () => {
  assert.equal(parseScenesFromScreenplayText("INT. COFFEE SHOP - DAY\n\nAction.").length, 1);
  assert.equal(parseScenesFromScreenplayText("INT/EXT. KITCHEN - NIGHT\n\nAction.").length, 1);
  assert.equal(parseScenesFromScreenplayText("12A INT. WAREHOUSE - NIGHT\n\nAction.").length, 1);
  assert.equal(parseScenesFromScreenplayText("INTERIOR. KITCHEN - DAY\n\nAction.").length, 1);
  assert.equal(parseScenesFromScreenplayText("INT. KITCHEN - NIGHT Maya reads.\n\nMore.").length, 1);
  assert.equal(parseScenesFromScreenplayText("INT.\u00A0KITCHEN - DAY\n\nAction.").length, 1);
  assert.equal(
    formatSceneSlugline("INT. COFFEE SHOP - DAY and Maya stirs."),
    "INT. COFFEE SHOP - DAY"
  );
  assert.equal(parseLocationFromHeading("INT. COFFEE SHOP - DAY"), "Coffee Shop");
  assert.equal(parseLocationFromHeading("EXT. FIRE ESCAPE - NIGHT"), "Fire Escape");
  assert.equal(parseLocationFromHeading("DAY - FIELDS"), "Fields");
  assert.equal(parseLocationFromHeading("HOUSE - DAY"), "House");
  assert.equal(parseLocationFromHeading("INT. COFFEE - DAY"), null);

  const docScript = [
    "DAY - FIELDS",
    "",
    "Maria Lopez",
    "We plant every spring.",
    "",
    "HOUSE - DAY",
    "",
    "JAMES",
    "This is home.",
  ].join("\n");
  const chars = parseCharacterNamesFromScreenplay(docScript);
  assert.ok(chars.includes("Maria Lopez"));
  assert.ok(chars.includes("James"));
  const locs = parseLocationsFromScreenplayText(docScript);
  assert.ok(locs.includes("Fields"));
  assert.ok(locs.includes("House"));

  const base = createEmptyProjectState();
  const world = generateWorldFromScript({
    ...base,
    directorPrep: {
      ...base.directorPrep,
      screenplay: { ...base.directorPrep.screenplay, rawText: docScript },
    },
  });
  assert.ok(world.characters.length >= 2);
  assert.ok(world.locations.length >= 2);
  assert.equal(
    parseScenesFromScreenplayText(
      "```fountain\nINT. COFFEE SHOP - DAY\n\nAction.\n\nEXT. ALLEY - NIGHT\n\nMore.\n```"
    ).length,
    2
  );
  assert.equal(
    parseScenesFromScreenplayText('\u201cINT. COFFEE SHOP - DAY\u201d\n\nAction.').length,
    1
  );
  assert.equal(
    parseScenesFromScreenplayText("<p>INT. COFFEE SHOP - DAY</p><p>Action.</p>").length,
    1
  );
  assert.equal(
    parseScenesFromScreenplayText(
      "INT. COFFEE SHOP - DAY Maya stirs. EXT. ALLEY - NIGHT He runs."
    ).length,
    2
  );
  assert.equal(
    parseScenesFromScreenplayText(
      '<Paragraph Type="Scene Heading"><Text>INT. COFFEE SHOP - DAY</Text></Paragraph><Paragraph Type="Action"><Text>Action.</Text></Paragraph>'
    ).length,
    1
  );
  const demoScript = `INT. COFFEE SHOP - DAY

MAYA (30s) stirs an espresso.

EXT. ALLEY - NIGHT

She runs.

INT. APARTMENT - NIGHT

MAYA slams the envelope.

INT. ROOFTOP - DAWN

Wide city.`;
  assert.equal(parseScenesFromScreenplayText(demoScript).length, 4);
  assert.equal(
    parseScenesFromScreenplayText("INT. COFFEE SHOP - DAY\n\nest and closes her eyes.\n\nest heaving, hands raised in fists.").length,
    1
  );
  assert.equal(
    parseScenesFromScreenplayText("INT. SAFE HOUSE - DAWN\n\nShe rests.\n\nEXT. ROOFTOP - NIGHT\n\nWide.").length,
    2
  );
  assert.equal(parseScenesFromScreenplayText("EST. WIDE CITY - DAY\n\nEstablishing.").length, 1);
  const withExcerptTrap = buildLocalPrepImport({
    screenplay: {
      title: "",
      draftLabel: "",
      pageEstimate: null,
      rawText: "INT. KITCHEN - NIGHT\n\nShe reads.",
      lastImportedAt: null,
    },
    rules: createEmptyProjectState().directorPrep.directorRules,
    prepRunSettings: { ...createDefaultPrepRunSettings(), analysisExcerpt: "No headings here." },
    projectName: "Test",
  });
  assert.ok(!("error" in withExcerptTrap));
  if (!("error" in withExcerptTrap)) {
    assert.equal(withExcerptTrap.scenes.length, 1);
  }
});

ok("ensureShotPlanFromScript parses headings when no scenes", () => {
  const base = createEmptyProjectState();
  base.directorPrep.screenplay.rawText =
    "INT. KITCHEN - NIGHT\n\nShe reads.\n\nEXT. ALLEY - NIGHT\n\nHe runs.";
  const { state: next, didParseScenes, didGenerateShots } = ensureShotPlanFromScript(base);
  assert.equal(didParseScenes, true);
  assert.equal(didGenerateShots, true);
  assert.ok(next.directorPrep.scenes.length >= 2);
  assert.ok(next.shotPlan.sequences.some((s) => s.shots.length > 0));
});

ok("generateShotPlanFromPrep builds sequences from scenes", () => {
  const base = createEmptyProjectState();
  const imported = importScriptToPrepJson(SAMPLE_AGENT_JSON, 0);
  assert.equal(imported.ok, true);
  if (!imported.ok) return;
  let state = applyScriptToPrep(base, imported.data, { mode: "replace", applyBudgetLines: false });
  state = generateShotPlanFromPrep(state);
  assert.ok(state.shotPlan.sequences.length > 0);
  assert.ok(state.shotPlan.sequences.some((s) => s.shots.length > 0));
});

ok("suggestBudgetFromShotPlan uses shot counts", () => {
  const base = createEmptyProjectState();
  const imported = importScriptToPrepJson(SAMPLE_AGENT_JSON, 0);
  if (!imported.ok) return;
  let state = applyScriptToPrep(base, imported.data, { mode: "replace", applyBudgetLines: false });
  state = generateShotPlanFromPrep(state);
  const suggestion = suggestBudgetFromShotPlan(state);
  assert.ok(suggestion.summary.includes("shots"));
  assert.ok(suggestion.microTools.length > 0);
});

ok("legacy Post mode uses edit-grade-deliver hint and sub-tabs", () => {
  const legacy = createEmptyProjectState();
  const postMode = WORKSPACE_MODES.find((m) => m.id === "post");
  assert.equal(postMode?.hint, "Edit · grade · deliver");
  assert.equal(POST_TABS.length, 5);
  assert.ok(POST_TABS.some((t) => t.id === "pipeline"));
  assert.equal(usesScriptToPromptPipeline(legacy), false);
});

ok("suggestBudgetForPanel reacts to role and budget band", () => {
  const base = createEmptyProjectState();
  const indie = suggestBudgetForPanel({
    ...base,
    budget: { ...base.budget, selectedBudget: "indie", selectedRole: "Production Designer" },
    directorPrep: {
      ...base.directorPrep,
      directorRules: { ...base.directorPrep.directorRules, budgetTier: "indie" },
    },
  });
  const high = suggestBudgetForPanel({
    ...base,
    budget: { ...base.budget, selectedBudget: "high", selectedRole: "Production Designer" },
    directorPrep: {
      ...base.directorPrep,
      directorRules: { ...base.directorPrep.directorRules, budgetTier: "high" },
    },
  });
  const dop = suggestBudgetForPanel({
    ...base,
    budget: { ...base.budget, selectedBudget: "high", selectedRole: "DOP (Director of Photography)" },
    directorPrep: {
      ...base.directorPrep,
      directorRules: { ...base.directorPrep.directorRules, budgetTier: "high" },
    },
  });

  assert.equal(indie.lowTools.length, 0, "indie band has no low lines");
  assert.ok(high.lowTools.length > 0, "high band includes low lines");
  assert.ok(high.microTools.length >= indie.microTools.length);

  const pdNames = new Set(indie.microTools.map((t) => t.name));
  const dopNames = new Set(dop.microTools.map((t) => t.name));
  const overlap = [...pdNames].filter((n) => dopNames.has(n));
  assert.ok(overlap.length < pdNames.size, "role changes tool lineup");
});

ok("buildFdxExport produces valid Final Draft XML", () => {
  const base = createEmptyProjectState();
  const imported = importScriptToPrepJson(SAMPLE_AGENT_JSON, 0);
  if (!imported.ok) return;
  let state = applyScriptToPrep(base, imported.data, { mode: "replace", applyBudgetLines: false });
  state = generateShotPlanFromPrep(state);
  const fdx = buildFdxExport(state, "Smoke Test");
  assert.ok(fdx.includes("<FinalDraft"));
  assert.ok(fdx.includes('Type="Scene Heading"'));
  assert.ok(fdx.includes("INT. KITCHEN"));
  assert.ok(fdx.includes("35mmAiPro"));
});

ok("buildStoryboardHtml and fountain export", () => {
  const base = createEmptyProjectState();
  const imported = importScriptToPrepJson(SAMPLE_AGENT_JSON, 0);
  if (!imported.ok) return;
  let state = applyScriptToPrep(base, imported.data, { mode: "replace", applyBudgetLines: false });
  state = generateShotPlanFromPrep(state);
  const html = buildStoryboardHtml(state, "Smoke Test");
  assert.ok(html.includes("Storyboard"));
  const fountain = buildFountainExport(state, "Smoke Test");
  assert.ok(fountain.includes("Title:"));
  const gaps = getCoverageGaps(state);
  assert.ok(Array.isArray(gaps));
});

ok("validateProjectStatePayload accepts agent apply result", () => {
  const base = createEmptyProjectState();
  const imported = importScriptToPrepJson(SAMPLE_AGENT_JSON, 0);
  assert.equal(imported.ok, true);
  if (!imported.ok) return;
  const state = applyScriptToPrep(base, imported.data, {
    mode: "replace",
    applyBudgetLines: true,
  });
  const v = validateProjectStatePayload(state);
  assert.equal(v.ok, true);
});

ok("look tool strip suggests prompts when mood board sections exist", () => {
  const state = createEmptyProjectState();
  state.directorPrep.agentMeta.visualMood = "Neo-noir rain, sodium vapor and cyan fill";
  state.visualBible.lensAndFraming = "35mm anamorphic, shallow depth of field";
  state.visualBible.grainAndTexture = "Fine 35mm grain, slight halation on highlights";
  state.visualBible.palette = ["#1a2a3a", "#e8c4a0"];
  state.visualBible.negativePromptNotes = "No stock photo lighting, no AI gloss";

  assert.deepEqual(getFilledLookSections(state), ["mood", "lens", "grain", "palette"]);
  assert.equal(shouldShowLookToolStrip(state), true);

  const suggestions = getLookToolSuggestions(state);
  assert.ok(suggestions.length >= 2);
  for (const s of suggestions) {
    assert.ok(s.tool.name.length > 0);
    assert.ok(s.prompt.length > 20);
    assert.ok(s.prompt.includes("Avoid") || s.section === "mood");
  }

  const lensPrompt = buildLookToolPrompt(state, "lens", 1);
  assert.ok(lensPrompt.includes("anamorphic") || lensPrompt.includes("35mm"));
});

ok("workspace pipeline: script-to-prompt uses 3-step nav", () => {
  const state = buildTemplateState(DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
  assert.equal(usesScriptToPromptPipeline(state), true);
  const nav = workspaceNavForState(state);
  assert.equal(nav.length, 3);
  assert.deepEqual(
    nav.map((n) => n.id),
    ["script", "look", "finish"]
  );
});

ok("workspace pipeline: look tabs use full list with More split on mobile", () => {
  const state = buildTemplateState(DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
  const tabs = lookTabsForState(state, LOOK_TABS);
  assert.equal(tabs.length, LOOK_TABS.length);
  assert.ok(tabs.some((t) => t.id === "details"));
});

ok("workspace pipeline: Finish sub-nav follows delivery workflow", () => {
  const state = buildTemplateState(DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
  const tabs = productionTabsForState(state);
  assert.deepEqual(
    tabs.map((t) => t.id),
    ["prompts", "export", "finish", "shots", "kit", "workflow", "world", "budget"]
  );
  assert.equal(tabs.find((t) => t.id === "finish")?.label, "Sign-off");
  assert.equal(tabs.at(0)?.id, "prompts");
  assert.equal(tabs.at(1)?.id, "export");
  assert.equal(tabs.at(2)?.id, "finish");
});

ok("workspace pipeline: active step maps prep to Script", () => {
  const state = buildTemplateState(DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
  assert.equal(activePipelineStep(state, "prep", "prompts", "photos"), "script");
  assert.equal(activePipelineStep(state, "look", "prompts", "photos"), "look");
  assert.equal(activePipelineStep(state, "production", "prompts", "photos"), "finish");
  assert.equal(activePipelineStep(state, "production", "shots", "photos"), "finish");
  assert.equal(activePipelineStep(state, "production", "finish", "photos"), "finish");
});

ok("dashboard stats: script-to-prompt summary uses prompts ready", () => {
  const state = buildTemplateState(DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
  state.directorPrep.scenes = [
    {
      id: "scene-1",
      number: 1,
      heading: "INT. ROOM - DAY",
      oneLine: "Test",
      intExt: "INT",
      dayNight: "DAY",
      visualRefs: [],
      shotNotes: "",
      status: "approved",
      linkedSequenceId: null,
    },
  ];
  const stats = getProjectProgressStats(state);
  assert.equal(stats.scriptToPrompt, true);
  assert.ok(stats.summaryLine.includes("scenes"));
  assert.ok(stats.summaryLine.includes("prompts") && stats.summaryLine.includes("/"));
});

ok("next step: script-to-prompt routes to Prompts not Shots", () => {
  const state = buildTemplateState(DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
  state.directorPrep.screenplay.rawText = "INT. ROOM - DAY\n\nAction.";
  state.directorPrep.scenes = [
    {
      id: "scene-1",
      number: 1,
      heading: "INT. ROOM - DAY",
      oneLine: "Test",
      intExt: "INT",
      dayNight: "DAY",
      visualRefs: [],
      shotNotes: "",
      status: "approved",
      linkedSequenceId: null,
    },
  ];
  state.visualBible.palette = ["#112233"];
  const step = getNextWorkspaceStep(state);
  assert.ok(step);
  assert.equal(step!.productionTab, "prompts");
  assert.ok(!step!.detail.includes("Shots"));
});

ok("shotsFromNotes uses classical coverage for indie feature template", () => {
  const state = buildTemplateState("director-prep-feature");
  const notes = [
    "- Establishing wide — Fields · DAY (geography)",
    "- Medium two-shot or singles — character beat",
    "- Close-up — reaction or story detail",
  ].join("\n");
  const shots = shotsFromNotes(notes, state, "scene-1");
  assert.ok(shots.length >= 3);
  assert.ok(shots.every((s) => (s.label.length ?? 0) < 80));
  assert.ok(shots.every((s) => !s.aiGenerationPrompt?.includes("cinematic film still")));
});

ok("mergeDirectorPrepTemplate rebuilds shots when switching to indie feature", () => {
  let state = buildTemplateState("director-prep-script-to-prompt");
  state.directorPrep.scenes = [
    {
      id: "scene-1",
      number: 1,
      heading: "EXT. FIELDS - DAY",
      oneLine: "Camera approaches the stone house.",
      intExt: "EXT",
      dayNight: "DAY",
      visualRefs: [],
      shotNotes: "",
      status: "approved",
      linkedSequenceId: null,
    },
  ];
  state = reconcileShotPlanForTemplate(state);
  assert.ok(state.shotPlan.sequences[0]?.shots[0]?.aiGenerationPrompt?.trim());

  const feature = buildTemplateState("director-prep-feature");
  const merged = mergeDirectorPrepTemplate(state, feature);
  const firstLabel = merged.shotPlan.sequences[0]?.shots[0]?.label ?? "";
  assert.ok(!/cinematic film still/i.test(firstLabel));
  assert.ok(/establishing|master|wide/i.test(firstLabel));
});

ok("buildShotToolPrompt formats differently per tool", () => {
  const state = createEmptyProjectState();
  state.directorPrep.agentMeta.visualMood = "Melancholic, intimate";
  state.directorPrep.scenes = [
    {
      id: "scene-1",
      number: 1,
      heading: "INT. KITCHEN - NIGHT",
      oneLine: "She discovers the letter on the table.",
      intExt: "INT",
      dayNight: "NIGHT",
      visualRefs: [],
      shotNotes: "",
      status: "approved",
      linkedSequenceId: null,
    },
  ];
  const fullLabel =
    "Cinematic medium shot, interior kitchen at night, motivated practical lighting, She discovers the letter on the table, character and environment in frame, 35mm lens feel, Melancholic intimate, 2.39:1 film still, shallow depth of field, film grain, no text, no watermark";
  const shot = {
    ...newPlannedShot("medium", fullLabel),
    sceneId: "scene-1",
    aiGenerationPrompt: fullLabel,
  };
  const sequence = {
    id: "seq-1",
    title: "Scene 1",
    notes: `- [medium] ${fullLabel}`,
    sceneNumber: 1,
    shots: [shot],
  };

  const midjourney = buildShotToolPrompt({ state, shot, sequence, toolRank: 6 });
  const elevenLabs = buildShotToolPrompt({ state, shot, sequence, toolRank: 3 });
  const ltx = buildShotToolPrompt({ state, shot, sequence, toolRank: 4 });

  assert.notEqual(midjourney.prompt, elevenLabs.prompt);
  assert.ok(midjourney.prompt.includes("--ar 21:9") || midjourney.prompt.includes("2.39"));
  assert.ok(elevenLabs.prompt.includes("Read aloud"));
  assert.ok(ltx.prompt.includes("Scene:"));
});

ok("referenceListKey stays unique when JPEG prefixes collide", () => {
  const prefix = "data:image/jpeg;base64,/9j/4AAQSkZJRgABA";
  const urls = [`${prefix}AAA`, `${prefix}BBB`, `${prefix}CCC`];
  const keys = urls.map((url, i) => referenceListKey(url, i));
  assert.equal(new Set(keys).size, keys.length);
});

ok("applyInstantDemoPrep loads 3-scene script with prompts", () => {
  const base = buildTemplateState(DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
  const result = applyInstantDemoPrep(base, "Demo");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(result.sceneCount >= 3);
  assert.ok(result.promptCount >= 6);
  assert.ok(result.state.directorPrep.scenes.some((s) => s.status === "approved"));
  assert.ok(result.state.shotPlan.sequences.some((s) => s.shots.length > 0));
});

ok("rebuildShotPromptInState changes prompt when tool rank changes", () => {
  const base = buildTemplateState(DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
  const demo = applyInstantDemoPrep(base, "Tool switch");
  assert.equal(demo.ok, true);
  if (!demo.ok) return;
  const state = demo.state;
  const mj = rebuildShotPromptInState(state, 0, 0, 6);
  const kling = rebuildShotPromptInState(state, 0, 0, 21);
  const mjPrompt = mj.shotPlan.sequences[0]!.shots[0]!.aiGenerationPrompt ?? "";
  const klingPrompt = kling.shotPlan.sequences[0]!.shots[0]!.aiGenerationPrompt ?? "";
  assert.notEqual(mjPrompt, klingPrompt);
  assert.ok(mjPrompt.length > 20);
  assert.ok(klingPrompt.length > 20);
});

ok("getProjectProgressStats includes look and prompt fraction", () => {
  let state = buildTemplateState(DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
  const demo = applyInstantDemoPrep(state, "Stats");
  if (!demo.ok) return;
  state = demo.state;
  const stats = getProjectProgressStats(state);
  assert.equal(stats.scriptToPrompt, true);
  assert.equal(stats.hasScript, true);
  assert.equal(stats.hasLook, true);
  assert.ok(stats.totalPromptSlots > 0);
  assert.ok(stats.summaryLine.includes("/"));
});

const phase4 = runPromptEngineSmoke();
passed += phase4.passed;
failed += phase4.failed;

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
