import type { PromptBeatContext } from "@/lib/pro/prompt-engine/types";
import { imageNegativePrompt } from "@/lib/pro/prompt-engine/prompt-context";

/** Midjourney v6 — weighted tags + parameter tail. */
export function formatMidjourneyPrompt(ctx: PromptBeatContext): {
  prompt: string;
  negativePrompt: string;
} {
  const tags = [
    ctx.subject,
    ctx.mood,
    ctx.palette ? `color palette ${ctx.palette}` : "",
    ctx.films ? `film reference ${ctx.films}` : "",
    ctx.camera,
    ctx.light,
    "cinematic film still",
    "dramatic motivated lighting",
    "photorealistic",
    "shallow depth of field",
    "fine film grain",
  ].filter(Boolean);

  const body = tags.join(", ");
  const params = "--ar 21:9 --style raw --no text, watermark, logo, vertical crop";
  const prompt = `${body} ${params}`.trim().slice(0, 2000);

  return {
    prompt,
    negativePrompt: imageNegativePrompt(ctx),
  };
}
