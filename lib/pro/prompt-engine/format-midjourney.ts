import type { PromptBeatContext } from "@/lib/pro/prompt-engine/types";
import { compactPaletteClause, imageNegativePrompt } from "@/lib/pro/prompt-engine/prompt-context";

const SHOT_FLAVOR: Record<string, string> = {
  establishing: "establishing vista, readable geography",
  wide: "wide master, architectural depth",
  medium: "medium framing, face and gesture readable",
  close_up: "tight close-up, tactile detail in focus",
  extreme_close_up: "extreme close-up, micro texture",
  dolly: "slow dolly, motivated camera move",
  pan: "slow pan following action",
  tilt: "tilt reveal",
  handheld: "handheld energy, documentary realism",
  aerial: "aerial geography",
  other: "cinematic still",
};

/**
 * Midjourney web treats a leading `--ar` / `--style` / `--no` as the whole
 * prompt being parameters, then errors "Prompt can't be empty".
 * Description first; native params last.
 */
export function formatMidjourneyPrompt(ctx: PromptBeatContext): {
  prompt: string;
  negativePrompt: string;
} {
  const flavor = SHOT_FLAVOR[ctx.shotType] ?? SHOT_FLAVOR.other!;
  const palette = compactPaletteClause(ctx.palette);
  const body = [
    ctx.subject,
    flavor,
    ctx.mood && ctx.mood.length <= 90 ? ctx.mood : "",
    ctx.films ? `refs ${ctx.films}` : "",
    palette,
  ].filter(Boolean);

  const params = "--ar 21:9 --style raw --no text, watermark, logo, vertical crop";
  const prompt = `${body.join(", ")} ${params}`.trim().slice(0, 2000);

  return {
    prompt,
    negativePrompt: imageNegativePrompt(ctx),
  };
}
