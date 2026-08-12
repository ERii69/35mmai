/**
 * Phase 4 prompt engine tests — formatters, routing, 5-scene quality gate.
 */
import assert from "node:assert/strict";
import { buildShotToolPrompt } from "../lib/pro/build-shot-tool-prompt";
import { rebuildAllPromptsInState } from "../lib/pro/build-script-to-prompt-pack";
import { buildScriptToPromptPackState } from "../lib/pro/build-script-to-prompt-pack";
import { DEMO_SCRIPT_FIVE_SCENES } from "../lib/pro/demo-script-five-scenes";
import { parseScenesFromScreenplayText } from "../lib/pro/parse-scene-headings";
import { buildPromptPackCsv, buildPromptPackMd, iterPromptPackRows } from "../lib/pro/prompt-pack-export";
import { suggestToolForBeat } from "../lib/pro/prompt-engine/suggest-prompt-tool";
import { PHASE4_PROMPT_TOOL_RANKS } from "../lib/pro/prompt-engine/types";
import { newPlannedShot } from "../lib/pro/shot-plan";
import { buildTemplateState, DEFAULT_DIRECTOR_PREP_TEMPLATE_ID } from "../lib/pro/templates";
import { resolvePromptToolRank } from "../lib/pro/sync-shot-prompts";
import type { ProjectStatePayload, ShotType } from "../lib/pro/types";

function tokenOverlapRatio(a: string, b: string): number {
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3)
    );
  const A = tokenize(a);
  const B = tokenize(b);
  let inter = 0;
  for (const t of A) {
    if (B.has(t)) inter += 1;
  }
  return inter / Math.max(A.size, B.size, 1);
}

function fixtureState(): ProjectStatePayload {
  const state = buildTemplateState(DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
  state.directorPrep.agentMeta.visualMood = "Intimate drama, warm tungsten and cool dawn contrast";
  state.visualBible.palette = ["#1C1917", "#44403C", "#78716C"];
  state.visualBible.lensAndFraming = "35mm spherical, composed for 2.39:1 wides";
  state.visualBible.grainAndTexture = "Fine photochemical grain, gentle halation";
  state.directorPrep.scenes = [
    {
      id: "scene-1",
      number: 1,
      heading: "INT. APARTMENT - NIGHT",
      oneLine: "Mara reads a letter by the window.",
      intExt: "INT",
      dayNight: "NIGHT",
      visualRefs: [],
      shotNotes: "",
      status: "approved",
      linkedSequenceId: null,
    },
  ];
  return state;
}

function fixtureShot(shotType: ShotType, label: string) {
  return {
    ...newPlannedShot(shotType, label),
    sceneId: "scene-1",
    cameraNotes: "35mm spherical",
    lightingNotes: "Warm practical key",
  };
}

export function runPromptEngineSmoke(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function ok(name: string, fn: () => void) {
    try {
      fn();
      passed += 1;
      console.log(`  ✓ ${name}`);
    } catch (e) {
      failed += 1;
      console.error(`  ✗ ${name}`);
      console.error(e);
    }
  }

  console.log("\nPhase 4 prompt engine\n");

  ok("PHASE4_PROMPT_TOOL_RANKS is five tools", () => {
    assert.deepEqual([...PHASE4_PROMPT_TOOL_RANKS], [6, 18, 5, 4, 21]);
  });

  ok("suggestToolForBeat routes motion to Kling", () => {
    const s = suggestToolForBeat("dolly", "slow dolly approach");
    assert.equal(s.rank, 5);
  });

  ok("suggestToolForBeat routes establishing to Midjourney", () => {
    const s = suggestToolForBeat("establishing", "exterior wide");
    assert.equal(s.rank, 6);
  });

  ok("suggestToolForBeat offers Nano alt on close-up detail", () => {
    const s = suggestToolForBeat("close_up", "hands on letter");
    assert.equal(s.rank, 6);
    assert.equal(s.altRank, 18);
  });

  ok("Midjourney formatter uses native --ar params", () => {
    const state = fixtureState();
    const shot = fixtureShot("wide", "Establishing exterior");
    const seq = { id: "seq-1", title: "Scene 1", notes: "", sceneNumber: 1, shots: [shot] };
    const built = buildShotToolPrompt({ state, shot, sequence: seq, toolRank: 6 });
    assert.equal(built.syntax, "mj-params");
    assert.ok(built.prompt.includes("--ar 21:9"));
    assert.ok(built.prompt.includes("--style raw"));
  });

  ok("LTX formatter uses Scene block syntax", () => {
    const state = fixtureState();
    const shot = fixtureShot("medium", "Two-shot");
    const seq = { id: "seq-1", title: "Scene 1", notes: "", sceneNumber: 1, shots: [shot] };
    const built = buildShotToolPrompt({ state, shot, sequence: seq, toolRank: 4 });
    assert.equal(built.syntax, "ltx-scene");
    assert.ok(built.prompt.includes("Scene:"));
    assert.ok(built.prompt.includes("Action:"));
  });

  ok("Kling formatter is motion-first", () => {
    const state = fixtureState();
    const shot = fixtureShot("dolly", "Dolly push");
    const seq = { id: "seq-1", title: "Scene 1", notes: "", sceneNumber: 1, shots: [shot] };
    const built = buildShotToolPrompt({ state, shot, sequence: seq, toolRank: 5 });
    assert.equal(built.syntax, "kling-motion");
    assert.ok(/dolly|motion|clip/i.test(built.prompt));
    assert.ok(!built.prompt.includes("--ar"));
  });

  ok("Nano formatter targets composite insert", () => {
    const state = fixtureState();
    const shot = fixtureShot("close_up", "Letter in hands");
    const seq = { id: "seq-1", title: "Scene 1", notes: "", sceneNumber: 1, shots: [shot] };
    const built = buildShotToolPrompt({ state, shot, sequence: seq, toolRank: 18 });
    assert.equal(built.syntax, "nano-composite");
    assert.ok(/composite|photorealistic/i.test(built.prompt));
  });

  ok("Higgsfield formatter uses camera profile prose", () => {
    const state = fixtureState();
    const shot = fixtureShot("wide", "Master");
    const seq = { id: "seq-1", title: "Scene 1", notes: "", sceneNumber: 1, shots: [shot] };
    const built = buildShotToolPrompt({ state, shot, sequence: seq, toolRank: 21 });
    assert.equal(built.syntax, "higgsfield-grade");
    assert.ok(/ARRI|Alexa/i.test(built.prompt));
  });

  ok("same beat differs across tools (<80% token overlap)", () => {
    const state = fixtureState();
    const shot = fixtureShot("establishing", "Exterior approach");
    const seq = { id: "seq-1", title: "Scene 1", notes: "", sceneNumber: 1, shots: [shot] };
    const mj = buildShotToolPrompt({ state, shot, sequence: seq, toolRank: 6 }).prompt;
    const kling = buildShotToolPrompt({ state, shot, sequence: seq, toolRank: 5 }).prompt;
    const ltx = buildShotToolPrompt({ state, shot, sequence: seq, toolRank: 4 }).prompt;
    assert.ok(tokenOverlapRatio(mj, kling) < 0.8);
    assert.ok(tokenOverlapRatio(mj, ltx) < 0.8);
  });

  ok("look-bible instructions do not leak into every prompt", () => {
    const state = fixtureState();
    state.directorPrep.agentMeta.visualMood =
      "Modular AI generation. One shot, one self-contained prompt. Match the look bible on every pass.";
    state.directorPrep.directorRules.styleNotes =
      "Modular AI generation. One shot, one self-contained prompt. Match the look bible on every pass.";
    state.directorPrep.directorRules.toneAndRefs =
      "Midjourney, Kling, LTX, Nano, Higgsfield. 2.39:1 film still discipline; no vertical or social crops.";
    state.directorPrep.directorRules.preferredShots =
      "Establishing first, then medium and detail beats";
    state.visualBible.designSheetNotes =
      "**Scene rhythm:** 2 exterior / 2 interior · 0 night scenes\n**Genre:** ai-native, prompt pack\n**Shot preference:** Establishing first, then medium and detail beats";
    state.directorPrep.scenes[0]!.oneLine =
      "Yellow harvest fields stretch to the horizon under soft daylight.";

    const estLabel =
      "Cinematic establishing wide shot, exterior FIELDS in daylight, natural motivated light, Yellow harvest fields stretch to the horizon under soft daylight, geography and scale, Cinematic naturalistic film still, 2.39:1 film still, shallow depth of field, film grain, no text, no watermark";
    const medLabel =
      "Cinematic medium shot, FIELDS in daylight, natural motivated light, Yellow harvest fields stretch to the horizon under soft daylight, character and environment in frame, 35mm lens feel, Cinematic naturalistic film still, 2.39:1 film still, shallow depth of field, film grain, no text, no watermark";
    const cuLabel =
      "Cinematic close-up, stone wall with climbing green vines, organic texture, FIELDS, in daylight, natural motivated light, tactile texture and story detail, Cinematic naturalistic film still, 2.39:1 film still, shallow depth of field, film grain, no text, no watermark";

    const notes = [
      `- [establishing] ${estLabel}`,
      `- [medium] ${medLabel}`,
      `- [close_up] ${cuLabel}`,
    ].join("\n");

    const shots = [
      { ...fixtureShot("establishing", estLabel), lightingNotes: state.visualBible.designSheetNotes },
      { ...fixtureShot("medium", medLabel), lightingNotes: state.visualBible.designSheetNotes },
      { ...fixtureShot("close_up", cuLabel), lightingNotes: state.visualBible.designSheetNotes },
    ];
    const seq = { id: "seq-1", title: "EXT. FIELDS - DAY", notes, sceneNumber: 1, shots };

    const prompts = shots.map((shot) =>
      buildShotToolPrompt({ state, shot, sequence: seq, toolRank: 6 })
    );

    for (const built of prompts) {
      assert.ok(!/Scene rhythm/i.test(built.prompt), built.prompt.slice(0, 200));
      assert.ok(!/look bible/i.test(built.prompt), built.prompt.slice(0, 200));
      assert.ok(!/Modular AI/i.test(built.prompt), built.prompt.slice(0, 200));
      assert.ok(!/Genre:\s*ai-native/i.test(built.prompt), built.prompt.slice(0, 200));
      assert.ok(!/Shot preference/i.test(built.prompt), built.prompt.slice(0, 200));
    }

    assert.ok(tokenOverlapRatio(prompts[0]!.prompt, prompts[2]!.prompt) < 0.92);
    assert.notEqual(prompts[0]!.negativePrompt, prompts[2]!.negativePrompt);
    assert.ok(/geography|portrait crop/i.test(prompts[0]!.negativePrompt));
    assert.ok(/busy wide|unfocused/i.test(prompts[2]!.negativePrompt));
  });

  ok("rebuildAllPromptsInState clears Modular AI clutter", () => {
    const state = buildTemplateState(DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
    state.directorPrep.screenplay.rawText =
      "EXT. FIELDS - DAY\n\nYellow harvest fields stretch to the horizon.\n\nINT. STONE HOUSE - DAY\n\nA door opens into the dim room.";
    state.directorPrep.scenes = [
      {
        id: "s1",
        number: 1,
        heading: "EXT. FIELDS - DAY",
        oneLine: "Yellow harvest fields stretch to the horizon.",
        intExt: "EXT",
        dayNight: "DAY",
        visualRefs: [],
        shotNotes:
          "- [establishing] Modular AI generation. One shot, one self-contained prompt. Match the look bible.",
        status: "approved",
        linkedSequenceId: null,
      },
      {
        id: "s2",
        number: 2,
        heading: "INT. STONE HOUSE - DAY",
        oneLine: "A door opens into the dim room.",
        intExt: "INT",
        dayNight: "DAY",
        visualRefs: [],
        shotNotes: "",
        status: "approved",
        linkedSequenceId: null,
      },
    ];
    state.directorPrep.agentMeta.visualMood =
      "Modular AI generation. One shot, one self-contained prompt. Match the look bible on every pass.";
    state.visualBible.palette = ["#1C1917", "#44403C"];
    state.shotPlan.sequences = [
      {
        id: "seq-1",
        title: "EXT. FIELDS - DAY",
        notes: "",
        sceneNumber: 1,
        shots: [
          {
            ...fixtureShot("establishing", "Establishing"),
            aiGenerationPrompt:
              "establishing wide shot, EXT. FIELDS · DAY: Yellow harvest fields., Modular AI generation. One shot, one self-contained prompt.",
            aiNegativePrompt: "vertical framing, watermark",
          },
        ],
      },
    ];

    const rebuilt = rebuildAllPromptsInState(state);
    const prompts = rebuilt.shotPlan.sequences.flatMap((s) =>
      s.shots.map((sh) => sh.aiGenerationPrompt ?? "")
    );
    assert.ok(prompts.length >= 4);
    for (const p of prompts) {
      assert.ok(p.trim().length > 40);
      assert.ok(!/Modular AI/i.test(p), p.slice(0, 180));
      assert.ok(!/look bible/i.test(p), p.slice(0, 180));
    }
    const negatives = rebuilt.shotPlan.sequences[0]!.shots.map((s) => s.aiNegativePrompt ?? "");
    assert.ok(negatives.length >= 2);
    assert.ok(negatives.some((n) => n !== negatives[0]));
  });

  ok("resolvePromptToolRank applies routing when no override", () => {
    const shot = fixtureShot("dolly", "tracking");
    assert.equal(resolvePromptToolRank(shot, { forceRouting: false }), 5);
  });

  ok("5-scene drama produces routed prompt pack", () => {
    const parsed = parseScenesFromScreenplayText(DEMO_SCRIPT_FIVE_SCENES);
    assert.ok(parsed.length >= 5);

    const state = buildTemplateState(DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
    state.directorPrep.screenplay.rawText = DEMO_SCRIPT_FIVE_SCENES;
    state.directorPrep.scenes = parsed.map((row) => ({
      ...row,
      status: "approved" as const,
      linkedSequenceId: null,
    }));
    state.visualBible.palette = ["#1a1a1a", "#8b7355", "#e8dcc8"];
    state.directorPrep.agentMeta.visualMood = "Intimate drama, rain and neon, dawn resolution";
    state.visualBible.lensAndFraming = "35mm anamorphic feel";

    const pack = buildScriptToPromptPackState(state);
    const shots = pack.shotPlan.sequences.flatMap((s) => s.shots);
    assert.ok(shots.length >= 15, "expect ~3-4 prompts per scene x 5 scenes");
    assert.ok(shots.every((s) => s.aiGenerationPrompt?.trim()));
    assert.ok(shots.every((s) => s.recommendedToolRank != null));

    const motionShots = shots.filter((s) => s.shotType === "dolly");
    if (motionShots.length > 0) {
      assert.equal(motionShots[0]!.recommendedToolRank, 5);
    }

    const avgLen =
      shots.reduce((n, s) => n + (s.aiGenerationPrompt?.length ?? 0), 0) / shots.length;
    assert.ok(avgLen >= 80 && avgLen <= 900, "prompts should be substantial but not bloated");
  });

  ok("buildPromptPackMd includes tool outbound URLs", () => {
    const state = fixtureState();
    const pack = buildScriptToPromptPackState(state);
    const md = buildPromptPackMd(pack, "Smoke Test");
    assert.ok(md.includes("**Open tool:** https://"));
    assert.ok(md.includes("**Tool:**"));
    assert.ok(md.includes("Scene 1"));
  });

  ok("buildPromptPackCsv has scene_order and tool_url columns", () => {
    const state = fixtureState();
    const pack = buildScriptToPromptPackState(state);
    const csv = buildPromptPackCsv(pack, "Smoke Test");
    assert.ok(csv.includes("scene_order"));
    assert.ok(csv.includes("tool_url"));
    const rows = iterPromptPackRows(pack);
    assert.ok(rows.length > 0);
    assert.equal(rows[0]!.sceneOrder, 1);
    assert.ok(rows[0]!.toolUrl.startsWith("https://"));
  });

  return { passed, failed };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { passed, failed } = runPromptEngineSmoke();
  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}
