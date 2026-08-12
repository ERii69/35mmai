import type { PromptBeatContext } from "@/lib/pro/prompt-engine/types";
import { motionNegativePrompt } from "@/lib/pro/prompt-engine/prompt-context";

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

/** Kling — motion-first video from text or plate. */
export function formatKlingPrompt(ctx: PromptBeatContext): {
  prompt: string;
  negativePrompt: string;
} {
  const motion = MOTION_BY_TYPE[ctx.shotType] ?? MOTION_BY_TYPE.other!;
  const plate = ctx.hasVisualRef
    ? "image-to-video from reference still, preserve composition"
    : "text-to-video";

  const parts = [
    `Kling video · ${motion}`,
    ctx.heading,
    ctx.action,
    ctx.mood,
    ctx.palette ? `palette ${ctx.palette}` : "",
    ctx.camera,
    ctx.light,
    plate,
    "cinematic motion",
    "film grain",
    "2.39:1",
    "5 second clip",
    "smooth temporal consistency",
  ].filter(Boolean);

  return {
    prompt: parts.join(", ").slice(0, 2000),
    negativePrompt: motionNegativePrompt(ctx),
  };
}
