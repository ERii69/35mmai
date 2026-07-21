import type { ShotType } from "@/lib/pro/types";

/** Phase 4 script-to-prompt kit — five generation tools only. */
export const PHASE4_PROMPT_TOOL_RANKS = [6, 18, 21, 4, 1] as const;

export type Phase4PromptToolRank = (typeof PHASE4_PROMPT_TOOL_RANKS)[number];

export type PromptSyntaxKind =
  | "mj-params"
  | "nano-composite"
  | "kling-motion"
  | "ltx-scene"
  | "higgsfield-grade";

export type ToolSuggestion = {
  rank: Phase4PromptToolRank;
  reason: string;
  altRank?: Phase4PromptToolRank;
  altReason?: string;
};

export type PromptBeatContext = {
  subject: string;
  heading: string;
  action: string;
  shotType: ShotType;
  shotLabel: string;
  mood: string;
  palette: string;
  lens: string;
  grain: string;
  films: string;
  camera: string;
  light: string;
  hasVisualRef: boolean;
  customNegative: string;
};

export type FormattedToolPrompt = {
  prompt: string;
  negativePrompt: string;
  toolRank: number;
  toolName: string;
  syntax: PromptSyntaxKind;
};

export function isPhase4PromptToolRank(rank: number): rank is Phase4PromptToolRank {
  return (PHASE4_PROMPT_TOOL_RANKS as readonly number[]).includes(rank);
}
