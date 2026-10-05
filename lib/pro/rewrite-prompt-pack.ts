import { buildShotToolPrompt } from "@/lib/pro/build-shot-tool-prompt";
import {
  PROMPT_REWRITE_CAP,
  charactersInScene,
  placeForScene,
  stampPromptLocks,
} from "@/lib/pro/prompt-locks";
import type { PlannedShot, ProjectStatePayload, SceneRow, ShotSequence } from "@/lib/pro/types";

function lockLead(
  state: ProjectStatePayload,
  shot: PlannedShot,
  scene: SceneRow | undefined
): string {
  const people = charactersInScene(state, scene)
    .map((person) => `${person.name}, ${person.look}`)
    .join("; ");
  const place = placeForScene(state, scene)?.look.trim() ?? "";
  const still =
    shot.recommendedToolRank === 5 && people
      ? `Start from the Midjourney reference still of ${people.split(",")[0]}.`
      : "";
  return [still, people, place].filter(Boolean).join(" ");
}

function rewrittenPrompt(
  state: ProjectStatePayload,
  shot: PlannedShot,
  sequence: ShotSequence,
  scene: SceneRow | undefined
): string {
  const rank = shot.recommendedToolRank ?? 6;
  const built = buildShotToolPrompt({ state, shot, sequence, toolRank: rank });
  const lead = lockLead(state, shot, scene);
  if (!lead) return built.prompt;

  if (built.prompt.startsWith("Scene:")) {
    return built.prompt.replace("Action:", `Keep: ${lead}\nAction:`);
  }
  if (/^Shot on ARRI/i.test(built.prompt)) {
    return built.prompt.replace(/^Shot on ARRI[^.]*\./i, (open) => `${open} ${lead}.`);
  }
  if (/^photorealistic/i.test(built.prompt)) {
    return built.prompt.replace(/^photorealistic[^,]*,/i, (open) => `${open} ${lead},`);
  }
  return `${lead}. ${built.prompt}`.replace(/\s+/g, " ").trim();
}

/**
 * One local rewrite from the locks. Tool assignment stays. No model call.
 * Capped per project so a membership cannot rewrite without limit.
 */
export function rewritePromptPack(
  state: ProjectStatePayload
): { ok: true; state: ProjectStatePayload } | { ok: false; error: string } {
  const locked = stampPromptLocks(state);
  const used = locked.directorPrep.promptLocks?.rewriteCount ?? 0;
  if (used >= PROMPT_REWRITE_CAP) {
    return {
      ok: false,
      error: `Rewrite limit reached (${PROMPT_REWRITE_CAP} on this project).`,
    };
  }

  const sequences = locked.shotPlan.sequences.map((seq) => {
    const scene = locked.directorPrep.scenes.find((row) => row.number === seq.sceneNumber);
    return {
      ...seq,
      shots: seq.shots.map((shot) => {
        const rank = shot.recommendedToolRank ?? 6;
        return {
          ...shot,
          recommendedToolRank: rank,
          aiGenerationPrompt: rewrittenPrompt(locked, shot, seq, scene),
        };
      }),
    };
  });

  return {
    ok: true,
    state: {
      ...locked,
      shotPlan: { sequences },
      directorPrep: {
        ...locked.directorPrep,
        promptLocks: {
          characters: locked.directorPrep.promptLocks?.characters ?? [],
          places: locked.directorPrep.promptLocks?.places ?? [],
          builtFingerprints: locked.directorPrep.promptLocks?.builtFingerprints ?? {},
          rewriteCount: used + 1,
        },
      },
    },
  };
}
