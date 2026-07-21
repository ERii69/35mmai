import type {
  AgentProgressStep,
  AgentStagingBundle,
  DirectorPrepState,
  VisualBibleState,
} from "@/lib/pro/types";
import { runBudgetAgent } from "@/lib/pro/agents/budget-agent";
import { runResearchAgent } from "@/lib/pro/agents/research-agent";
import { runScriptAnalyzerAgent } from "@/lib/pro/agents/script-analyzer";
import { runShotListAgent } from "@/lib/pro/agents/shot-list-agent";
import { runVisualBibleAgent } from "@/lib/pro/agents/visual-bible-agent";
import { fingerprintScript } from "@/lib/pro/agents/context";
import { agentLabel, type PrepPipelineAgentId } from "@/lib/pro/agent-roster";
import { scriptTextForAnalysis } from "@/lib/pro/script-for-analysis";
import { parseScenesFromScreenplayText } from "@/lib/pro/parse-scene-headings";
import { scenesToStagedSuggestions } from "@/lib/pro/local-prep-from-screenplay";
import {
  buildStagingCharactersFromScript,
  buildStagingLocationsFromScript,
  mergeStagingCharacters,
  mergeStagingLocations,
} from "@/lib/pro/build-staging-world";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import { synthesizeVisualBeatsFromScenes, countPromptsInStaging } from "@/lib/pro/synthesize-visual-beats";
import type { AgentPartialPatch } from "@/lib/pro/agents/stream-types";

export type { AgentPartialPatch } from "@/lib/pro/agents/stream-types";
export { planRefineAgents } from "@/lib/pro/plan-refine-agents";

export type AgentStreamEvent =
  | { type: "progress"; step: AgentProgressStep; message: string }
  | { type: "thinking"; step: PrepPipelineAgentId; message: string }
  | { type: "partial"; step: PrepPipelineAgentId; message: string; patch: AgentPartialPatch }
  | { type: "complete"; staging: AgentStagingBundle; memoryPatch: Partial<DirectorPrepState["agentMemory"]> }
  | { type: "error"; message: string };

export type OrchestratorInput = {
  directorPrep: DirectorPrepState;
  visualBible?: VisualBibleState;
  refineHint?: string;
  agents?: PrepPipelineAgentId[];
};

export async function* runDirectorAgentPipeline(
  input: OrchestratorInput
): AsyncGenerator<AgentStreamEvent> {
  const dp = input.directorPrep;
  const agents = input.agents ?? [
    "script_analyzer",
    "research",
    "shot_list",
    "budget",
    "visual_bible",
  ];
  const refineHint = input.refineHint?.trim() || undefined;
  const existing = dp.agentStaging;
  const runId = `run-${Date.now()}`;
  const { text: scriptForAnalyzer, modeLabel } = scriptTextForAnalysis(
    dp.screenplay,
    dp.prepRunSettings
  );

  let executiveSummary = existing?.executiveSummary ?? "";
  let researchNotes = existing?.researchNotes ?? "";
  let scenes = existing?.scenes ?? [];
  let shotSequences = existing?.shotSequences ?? [];
  let locations = existing?.locations ?? [];
  let characters = existing?.characters ?? [];
  let budget = existing?.budget ?? null;
  let visual = existing?.visual ?? null;
  let compressedSummary = dp.agentMemory.compressedScriptSummary;

  const sceneRows = () => scenes.map((s) => s.scene);
  const promptPack = isScriptToPromptTemplate(dp.appliedTemplateId);

  const emitPartial = function* (
    step: PrepPipelineAgentId,
    message: string,
    patch: AgentPartialPatch
  ) {
    yield { type: "partial" as const, step, message, patch };
  };

  try {
    if (agents.includes("script_analyzer")) {
      yield {
        type: "thinking",
        step: "script_analyzer",
        message: `${agentLabel("script_analyzer")} is reading your script (${modeLabel})…`,
      };
      yield { type: "progress", step: "script_analyzer", message: "Analyzing scenes and continuity…" };
      const analyzed = await runScriptAnalyzerAgent({
        rules: dp.directorRules,
        screenplayRaw: scriptForAnalyzer,
        title: dp.screenplay.title,
        memory: dp.agentMemory,
        refineHint,
      });
      executiveSummary = analyzed.summary;
      compressedSummary = analyzed.compressedSummary;
      scenes = analyzed.scenes;
      if (scenes.length === 0) {
        const parsed = parseScenesFromScreenplayText(dp.screenplay.rawText);
        if (parsed.length > 0) {
          scenes = scenesToStagedSuggestions(parsed);
          executiveSummary =
            analyzed.summary ||
            `Parsed ${parsed.length} scene${parsed.length === 1 ? "" : "s"} from INT./EXT. headings.`;
        }
      }
      yield* emitPartial("script_analyzer", `${scenes.length} scene${scenes.length === 1 ? "" : "s"} found`, {
        executiveSummary,
        scenes,
      });
    }

    if (agents.includes("research")) {
      yield {
        type: "thinking",
        step: "research",
        message: `${agentLabel("research")} is finding locations and references…`,
      };
      yield { type: "progress", step: "research", message: "Researching locations and references…" };
      const research = await runResearchAgent({
        scenes: sceneRows(),
        memory: dp.agentMemory,
        refineHint,
        screenplayExcerpt: scriptForAnalyzer,
      });
      researchNotes = research.researchNotes;
      const scriptLocations = buildStagingLocationsFromScript(scriptForAnalyzer, sceneRows(), "local-loc", {
        promptPack,
      });
      locations = promptPack
        ? scriptLocations
        : mergeStagingLocations(research.locations, scriptLocations);
      characters = mergeStagingCharacters(
        research.characters,
        buildStagingCharactersFromScript(scriptForAnalyzer)
      );
      if (!researchNotes.trim() && (characters.length || locations.length)) {
        researchNotes = [
          characters.length
            ? `${characters.length} character${characters.length === 1 ? "" : "s"} from your script.`
            : null,
          locations.length
            ? promptPack
              ? `${locations.length} scene setting${locations.length === 1 ? "" : "s"} from scene headings.`
              : `${locations.length} filming location${locations.length === 1 ? "" : "s"} from scene headings.`
            : null,
        ]
          .filter(Boolean)
          .join(" ");
      }
      yield* emitPartial(
        "research",
        `${characters.length} character${characters.length === 1 ? "" : "s"}, ${locations.length} location${locations.length === 1 ? "" : "s"}`,
        { researchNotes, locations, characters }
      );
    }

    if (agents.includes("shot_list")) {
      yield {
        type: "thinking",
        step: "shot_list",
        message: `${agentLabel("shot_list")} is planning coverage…`,
      };
      yield { type: "progress", step: "shot_list", message: "Generating shot lists…" };
      shotSequences = await runShotListAgent({
        rules: dp.directorRules,
        scenes: sceneRows(),
        memory: dp.agentMemory,
        visualBible: input.visualBible ?? {
          designSheetNotes: "",
          referenceUrls: [],
          palette: [],
          lensAndFraming: "",
          grainAndTexture: "",
          moodBoardReferences: [],
          negativePromptNotes: "",
          consistencyChecklist: [],
        },
        visualMood: dp.agentMeta.visualMood,
        refineHint,
        promptPack,
      });
      yield* emitPartial(
        "shot_list",
        `${shotSequences.length} shot sequence${shotSequences.length === 1 ? "" : "s"}`,
        { shotSequences }
      );
    }

    if (agents.includes("budget")) {
      yield {
        type: "thinking",
        step: "budget",
        message: `${agentLabel("budget")} is estimating costs…`,
      };
      yield { type: "progress", step: "budget", message: "Estimating budget band…" };
      budget = await runBudgetAgent({
        rules: dp.directorRules,
        scenes: sceneRows(),
        memory: dp.agentMemory,
        refineHint,
      });
      yield* emitPartial("budget", budget?.summary ?? "Budget estimate ready", { budget });
    }

    if (agents.includes("visual_bible")) {
      yield {
        type: "thinking",
        step: "visual_bible",
        message: `${agentLabel("visual_bible")} is building your look…`,
      };
      yield { type: "progress", step: "visual_bible", message: "Building visual bible…" };
      visual = await runVisualBibleAgent({
        rules: dp.directorRules,
        scenes: sceneRows(),
        memory: dp.agentMemory,
        state: {
          visualBible: input.visualBible ?? {
            designSheetNotes: "",
            referenceUrls: [],
            palette: [],
            lensAndFraming: "",
            grainAndTexture: "",
            moodBoardReferences: [],
            negativePromptNotes: "",
            consistencyChecklist: [],
          },
          directorPrep: dp,
        },
        mode: "full_bible",
        refineHint,
      });
      yield* emitPartial("visual_bible", visual?.mood ?? "Visual mood ready", { visual });
    }

    if (promptPack && !agents.includes("shot_list") && sceneRows().length > 0) {
      yield {
        type: "progress",
        step: "visual_bible",
        message: "Building visual beats from your scenes…",
      };
      const hints = {
        mood: visual?.mood ?? dp.agentMeta.visualMood,
        palette: visual?.palette,
        lens: visual?.lensAndFraming,
        lighting: visual?.lightingApproach,
      };
      shotSequences = synthesizeVisualBeatsFromScenes(
        sceneRows(),
        dp.directorRules,
        hints,
        runId
      );
      const promptCount = countPromptsInStaging(shotSequences);
      yield* emitPartial(
        "visual_bible",
        `${promptCount} prompt${promptCount === 1 ? "" : "s"} across ${shotSequences.length} scene${shotSequences.length === 1 ? "" : "s"}`,
        { shotSequences }
      );
    }

    const staging: AgentStagingBundle = {
      runId,
      status: "review",
      createdAt: new Date().toISOString(),
      executiveSummary,
      researchNotes,
      scenes,
      shotSequences,
      locations,
      characters,
      budget,
      visual,
      refineHint: refineHint ?? null,
    };

    yield {
      type: "complete",
      staging,
      memoryPatch: {
        compressedScriptSummary: compressedSummary,
        lastScriptFingerprint: fingerprintScript(dp.screenplay.rawText),
      },
    };
    yield { type: "progress", step: "complete", message: "All agents finished — review below." };
  } catch (e) {
    yield {
      type: "error",
      message: e instanceof Error ? e.message : "Agent run failed.",
    };
  }
}
