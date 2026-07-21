import type { PromptBeatContext } from "@/lib/pro/prompt-engine/types";
import { motionNegativePrompt } from "@/lib/pro/prompt-engine/prompt-context";

/** LTX Studio — structured scene block for script-to-visual. */
export function formatLtxPrompt(ctx: PromptBeatContext): {
  prompt: string;
  negativePrompt: string;
} {
  const lines = [
    `Scene: ${ctx.heading}`,
    `Shot: ${ctx.shotLabel || ctx.shotType.replace(/_/g, " ")}`,
    `Action: ${ctx.action || ctx.subject}`,
    ctx.camera ? `Camera: ${ctx.camera}` : null,
    ctx.light ? `Lighting: ${ctx.light}` : null,
    `Look: ${[ctx.mood, ctx.palette ? `palette ${ctx.palette}` : "", ctx.films ? `refs ${ctx.films}` : ""].filter(Boolean).join(". ")}`,
    "Duration: 5s",
    "Aspect: 2.39:1 cinematic",
  ].filter(Boolean);

  return {
    prompt: lines.join("\n").slice(0, 2000),
    negativePrompt: motionNegativePrompt(ctx),
  };
}
