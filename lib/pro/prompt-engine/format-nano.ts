import type { PromptBeatContext } from "@/lib/pro/prompt-engine/types";
import { compactPaletteClause, imageNegativePrompt } from "@/lib/pro/prompt-engine/prompt-context";

/** Nano Banana 2 — photoreal composite / insert detail. */
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
    ctx.palette ? `palette ${compactPaletteClause(ctx.palette)}` : "",
    ctx.camera,
    ctx.light,
    ctx.mood,
    "high micro-contrast",
    "no AI gloss",
  ].filter(Boolean);

  return {
    prompt: parts.join(", ").slice(0, 2000),
    // Nano-specific defects first so the negative differs from Midjourney at a glance.
    negativePrompt: `plastic skin, CGI sheen, floating props, seam lines, ${imageNegativePrompt(ctx)}`,
  };
}
