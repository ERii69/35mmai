import type { PromptBeatContext } from "@/lib/pro/prompt-engine/types";
import { imageNegativePrompt } from "@/lib/pro/prompt-engine/prompt-context";

/** Nano Banana Pro — photoreal composite / insert detail. */
export function formatNanoPrompt(ctx: PromptBeatContext): {
  prompt: string;
  negativePrompt: string;
} {
  const isDetail =
    /close|detail|insert|hands|object|texture|prop|ecu/i.test(ctx.shotLabel) ||
    ctx.shotType === "close_up" ||
    ctx.shotType === "extreme_close_up";

  const lead = isDetail
    ? `Nano composite insert · ${ctx.action || ctx.subject}`
    : `Nano photoreal still · ${ctx.subject}`;

  const parts = [
    lead,
    "seamless integration with plate",
    "sharp focus on story detail",
    "natural material texture",
    ctx.palette ? `palette ${ctx.palette}` : "",
    ctx.camera,
    ctx.light,
    ctx.mood,
    "high micro-contrast",
    "no AI gloss",
  ].filter(Boolean);

  return {
    prompt: parts.join(", ").slice(0, 2000),
    negativePrompt: `plastic skin, CGI sheen, floating props, ${imageNegativePrompt(ctx)}`,
  };
}
