import type { PrepPipelineAgentId } from "@/lib/pro/agent-roster";
import type { ProTemplateId } from "@/lib/pro/templates";

export const SCRIPT_TO_PROMPT_TEMPLATE_ID: ProTemplateId = "director-prep-script-to-prompt";

/** Default prep sections for Script to prompt (no location scouting or cast research). */
/** Scenes + look only — visual beats are synthesized locally (no shot-list agent). */
export const SCRIPT_TO_PROMPT_DEFAULT_AGENTS: PrepPipelineAgentId[] = [
  "script_analyzer",
  "visual_bible",
];

/** Default kit picks for Script to prompt template (Phase 4 five tools). */
export const SCRIPT_TO_PROMPT_KIT_RANKS = [6, 18, 21, 4, 1] as const;

/** Primary image / video tools for per-shot prompt formatting. */
export const SCRIPT_TO_PROMPT_DEFAULT_TOOL_RANKS = [6, 18, 21, 4, 1] as const;

export function isScriptToPromptTemplate(templateId: string | null | undefined): boolean {
  return templateId === SCRIPT_TO_PROMPT_TEMPLATE_ID;
}

export const SCRIPT_TO_PROMPT_STYLE_CHIPS = [
  "Modular prompts",
  "2.39:1 film still",
  "One shot one prompt",
  "Look bible locked",
  "No vertical crops",
] as const;

export const SCRIPT_TO_PROMPT_TONE_CHIPS = [
  "Midjourney stills",
  "Higgsfield motion",
  "LTX video",
  "Film grain discipline",
  "External tools only",
] as const;

export const SCRIPT_TO_PROMPT_CAMERA_CHIPS = [
  "Establishing first",
  "Medium and detail beats",
  "One generation per prompt",
  "Locked aspect ratio",
  "Copy-ready prompts",
] as const;

export function suggestVisionForScriptToPrompt() {
  return {
    styleNotes:
      "Modular AI generation. One shot, one self-contained prompt. Match the look bible on every pass.",
    toneAndRefs:
      "Midjourney, Kling, LTX, Nano, Higgsfield. 2.39:1 film still discipline; no vertical or social crops.",
    preferredShots:
      "Establishing, medium, and detail beats per scene. One modular prompt per generation pass.",
  };
}
