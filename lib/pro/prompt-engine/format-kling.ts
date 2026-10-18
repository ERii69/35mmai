import type { PromptBeatContext } from "@/lib/pro/prompt-engine/types";
import { compactPaletteClause, motionNegativePrompt } from "@/lib/pro/prompt-engine/prompt-context";

const MOTION_BY_TYPE: Record<string, string> = {
  dolly: "slow dolly push toward subject",
  pan: "slow horizontal pan following action",
  tilt: "gentle tilt reveal",
  handheld: "subtle handheld energy, documentary realism",
  aerial: "aerial drift, smooth gimbal motion",
  establishing: "slow establishing drift, reveal geography",
  wide: "locked wide with subtle environmental motion",
  medium: "slow push-in on character beat",
  close_up: "minimal motion, shallow focus breathing",
  extreme_close_up: "static macro, micro movement only",
  other: "motivated camera movement",
};

/** Kling 4.0 — motion-first video, with references and keyframes. */
export function formatKlingPrompt(ctx: PromptBeatContext): {
  prompt: string;
  negativePrompt: string;
} {
  const motion = MOTION_BY_TYPE[ctx.shotType] ?? MOTION_BY_TYPE.other!;
  const plate = ctx.hasVisualRef
    ? "image-to-video from the reference still, preserve face, wardrobe, and framing"
    : "image-to-video from the locked still of this scene, preserve face, wardrobe, and framing";

  const parts = [
    motion,
    ctx.heading,
    ctx.action,
    ctx.mood,
    ctx.palette ? `palette ${compactPaletteClause(ctx.palette) || ctx.palette}` : "",
    ctx.camera,
    ctx.light,
    plate,
    "Omni Reference: up to 15 assets for face, wardrobe, and location",
    "up to 10 keyframes for action and camera changes",
    "cinematic motion",
    "film grain",
    "2.39:1",
    "10 second clip, or one native 30 second take when the beat must stay continuous",
    "smooth temporal consistency",
  ].filter(Boolean);

  return {
    prompt: parts.join(", ").slice(0, 2000),
    negativePrompt: motionNegativePrompt(ctx),
  };
}
