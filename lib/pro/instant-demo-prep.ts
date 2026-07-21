import { buildScriptToPromptPackState } from "@/lib/pro/build-script-to-prompt-pack";
import { commitAgentStaging } from "@/lib/pro/commit-agent-staging";
import {
  DEMO_SCRIPT_THREE_SCENES,
  DEMO_SCRIPT_THREE_SCENES_TITLE,
} from "@/lib/pro/demo-script-three-scenes";
import {
  buildLocalPrepImport,
  buildLocalPrepStaging,
  filterLocalStagingByAgents,
} from "@/lib/pro/local-prep-from-screenplay";
import { createDefaultPrepRunSettings } from "@/lib/pro/prep-run-settings";
import { SCRIPT_TO_PROMPT_DEFAULT_AGENTS } from "@/lib/pro/script-to-prompt-template";
import { refreshScriptToPromptStagingShots } from "@/lib/pro/build-script-to-prompt-shots";
import { approveAllStagingItems } from "@/lib/pro/staging-review-sync";
import { synthesizeVisualBeatsFromScenes } from "@/lib/pro/synthesize-visual-beats";
import { DEFAULT_DIRECTOR_PREP_TEMPLATE_ID } from "@/lib/pro/templates";
import type { AgentStagingBundle, ProjectStatePayload } from "@/lib/pro/types";

const DEMO_PALETTE = ["#1a1a2e", "#16213e", "#e94560", "#0f3460"];
const DEMO_MOOD = "Rain-soaked neo-noir — sodium streetlight, wet brick, intimate diner glow.";

function promptPackVisualHints(bundle: AgentStagingBundle) {
  return {
    mood: bundle.visual?.mood ?? DEMO_MOOD,
    palette: bundle.visual?.palette?.length ? bundle.visual.palette : DEMO_PALETTE,
    lens: bundle.visual?.lensAndFraming,
    lighting: bundle.visual?.lightingApproach,
  };
}

export type InstantDemoResult =
  | { ok: true; state: ProjectStatePayload; sceneCount: number; promptCount: number }
  | { ok: false; error: string };

/**
 * One-click demo: load 3-scene script, run local prep, approve, build prompts + minimal look.
 */
export function applyInstantDemoPrep(
  state: ProjectStatePayload,
  projectName: string
): InstantDemoResult {
  const prepRunSettings = state.directorPrep.prepRunSettings ?? createDefaultPrepRunSettings();
  const rules = state.directorPrep.directorRules;

  const base: ProjectStatePayload = {
    ...state,
    directorPrep: {
      ...state.directorPrep,
      appliedTemplateId:
        state.directorPrep.appliedTemplateId ?? DEFAULT_DIRECTOR_PREP_TEMPLATE_ID,
      screenplay: {
        ...state.directorPrep.screenplay,
        rawText: DEMO_SCRIPT_THREE_SCENES,
        title: DEMO_SCRIPT_THREE_SCENES_TITLE,
      },
      prepRunSettings,
    },
  };

  const built = buildLocalPrepImport({
    screenplay: base.directorPrep.screenplay,
    rules,
    prepRunSettings,
    projectName,
    promptPack: true,
  });

  if ("error" in built) {
    return { ok: false, error: built.error };
  }

  const pipeline = [...SCRIPT_TO_PROMPT_DEFAULT_AGENTS];
  const runId = `demo-${Date.now()}`;
  let staging = buildLocalPrepStaging(built, runId, DEMO_SCRIPT_THREE_SCENES, { promptPack: true });
  staging = filterLocalStagingByAgents(staging, pipeline, { promptPack: true });

  if (staging.shotSequences.length === 0 && staging.scenes.length > 0) {
    staging = {
      ...staging,
      shotSequences: synthesizeVisualBeatsFromScenes(
        staging.scenes.map((s) => s.scene),
        rules,
        promptPackVisualHints(staging),
        runId
      ),
    };
  }

  staging = refreshScriptToPromptStagingShots(staging, rules, promptPackVisualHints(staging));
  staging = approveAllStagingItems(staging);

  let next = commitAgentStaging(base, staging);
  next = buildScriptToPromptPackState(next);

  next = {
    ...next,
    visualBible: {
      ...next.visualBible,
      palette: next.visualBible.palette.length > 0 ? next.visualBible.palette : DEMO_PALETTE,
    },
    directorPrep: {
      ...next.directorPrep,
      agentMeta: {
        ...next.directorPrep.agentMeta,
        visualMood: next.directorPrep.agentMeta.visualMood.trim() || DEMO_MOOD,
      },
    },
  };

  const sceneCount = next.directorPrep.scenes.filter((s) => s.status === "approved").length;
  const promptCount = next.shotPlan.sequences.reduce((n, seq) => n + seq.shots.length, 0);

  return { ok: true, state: next, sceneCount, promptCount };
}
