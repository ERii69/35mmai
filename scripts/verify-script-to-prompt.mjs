/**
 * Fast verification: Script to prompt produces copy-ready generation prompts end-to-end.
 * Run: node scripts/verify-script-to-prompt.mjs
 */
import assert from "node:assert/strict";
import { parseScenesFromScreenplayText } from "../lib/pro/parse-scene-headings.ts";
import { buildLocalPrepImport, buildLocalPrepStaging } from "../lib/pro/local-prep-from-screenplay.ts";
import { createDefaultPrepRunSettings } from "../lib/pro/prep-run-settings.ts";
import { createEmptyProjectState } from "../lib/pro/project-state-defaults.ts";
import {
  buildScriptToPromptShotNotes,
  isLegacyCoverageShotNotes,
  refreshScriptToPromptStagingShots,
} from "../lib/pro/build-script-to-prompt-shots.ts";
import { approveAllStagingItems } from "../lib/pro/staging-review-sync.ts";
import { commitAgentStaging } from "../lib/pro/commit-agent-staging.ts";
import { syncShotPromptsInState, countShotsWithPrompts } from "../lib/pro/sync-shot-prompts.ts";
import { SCRIPT_TO_PROMPT_DEFAULT_AGENTS } from "../lib/pro/script-to-prompt-template.ts";

const SAMPLE = `EXT. FIELDS - DAY

Summer, yellow fields harvest. Camera approaching a house built from stones and covered all over by green vines.

INT. HOUSE - DAY

The door slowly opens and we see the inside huge room. In the middle there is a big wooden table.`;

const rules = createEmptyProjectState().directorPrep.directorRules;

const scenes = parseScenesFromScreenplayText(SAMPLE);
assert.ok(scenes.length >= 2, "expected 2 scenes");

const extNotes = buildScriptToPromptShotNotes(scenes[0], rules);
assert.match(extNotes, /\[establishing\].*cinematic/i);
assert.match(extNotes, /yellow fields|stone|green vines/i);
assert.doesNotMatch(extNotes, /character beat|Director note:/i);

const legacy = "- Establishing wide — Fields · DAY (geography)\n- Medium two-shot or singles — character beat";
assert.equal(isLegacyCoverageShotNotes(legacy), true);
assert.equal(isLegacyCoverageShotNotes(extNotes), false);

const built = buildLocalPrepImport({
  screenplay: { title: "Test", draftLabel: "", pageEstimate: null, rawText: SAMPLE, lastImportedAt: null },
  rules,
  prepRunSettings: createDefaultPrepRunSettings(),
  projectName: "Test",
  promptPack: true,
});
assert.equal("error" in built, false);
if ("error" in built) process.exit(1);

const staging = buildLocalPrepStaging(built, "verify-run", SAMPLE, { promptPack: true });
assert.ok(staging.shotSequences.length >= 2);
for (const seq of staging.shotSequences) {
  assert.match(seq.notes, /cinematic/i, `sequence ${seq.title} missing cinematic prompt`);
  assert.doesNotMatch(seq.notes, /character beat/i);
}

const legacyStaging = {
  ...staging,
  shotSequences: staging.shotSequences.map((s) => ({
    ...s,
    notes: legacy,
  })),
};
const refreshed = refreshScriptToPromptStagingShots(legacyStaging, rules);
assert.notEqual(refreshed.shotSequences[0].notes, legacy);

const approved = approveAllStagingItems(refreshed);
let state = createEmptyProjectState();
state.directorPrep.appliedTemplateId = "director-prep-script-to-prompt";
state = commitAgentStaging(state, approved);
state = syncShotPromptsInState(state, { onlyEmpty: false });
const { total, withPrompt } = countShotsWithPrompts(state);
assert.ok(total >= 6, `expected shots, got ${total}`);
assert.equal(withPrompt, total, `expected all prompts filled, got ${withPrompt}/${total}`);
for (const seq of state.shotPlan.sequences) {
  for (const shot of seq.shots) {
    assert.ok(shot.aiGenerationPrompt && shot.aiGenerationPrompt.length > 40);
  }
}

console.log(`OK script-to-prompt: ${total} shots, ${withPrompt} prompts, ${SCRIPT_TO_PROMPT_DEFAULT_AGENTS.length} default agents`);
