import { countPromptsInStaging } from "@/lib/pro/synthesize-visual-beats";
import type { AgentStagingBundle } from "@/lib/pro/types";

export function promptsReadyLabel(count: number): string {
  return `${count} prompt${count === 1 ? "" : "s"} ready`;
}

export function openPromptsCta(count: number): string {
  return count > 0 ? `Open Prompts (${count})` : "Open Prompts";
}

/** Short summary for prep review cards — no duplicate CTA wording. */
export function promptPackSummaryLine(parts: {
  promptCount: number;
  sceneCount: number;
  hasLook?: boolean;
  locationCount?: number;
}): string {
  const bits = [`${parts.promptCount} prompt${parts.promptCount === 1 ? "" : "s"}`];
  if (parts.sceneCount > 0) {
    bits.push(`${parts.sceneCount} scene${parts.sceneCount === 1 ? "" : "s"}`);
  }
  if (parts.hasLook) bits.push("look");
  if (parts.locationCount && parts.locationCount > 0) {
    bits.push(`${parts.locationCount} setting${parts.locationCount === 1 ? "" : "s"}`);
  }
  return bits.join(" · ");
}

export function countPromptsInBundle(staging: AgentStagingBundle): number {
  return countPromptsInStaging(staging.shotSequences);
}

export function promptsForSceneLabel(sceneNumber: number): string {
  return `Prompts for Scene ${sceneNumber}`;
}
