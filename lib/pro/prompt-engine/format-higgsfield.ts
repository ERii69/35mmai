import type { PromptBeatContext } from "@/lib/pro/prompt-engine/types";
import { motionNegativePrompt } from "@/lib/pro/prompt-engine/prompt-context";

/** Higgsfield Cinema Studio — camera profile + grade language (profile first). */
export function formatHiggsfieldPrompt(ctx: PromptBeatContext): {
  prompt: string;
  negativePrompt: string;
} {
  const profile = ctx.lens.toLowerCase().includes("anamorphic")
    ? "ARRI Alexa Mini LF with anamorphic lenses"
    : "ARRI Alexa 35 with spherical cinema primes";

  const sentences = [
    `Shot on ${profile}.`,
    ctx.subject ? `${ctx.subject}.` : "",
    ctx.mood ? `${ctx.mood}.` : "",
    ctx.palette ? `Color palette: ${ctx.palette}.` : "",
    ctx.camera ? `Camera: ${ctx.camera}.` : "Motivated key with soft fill and controlled contrast.",
    ctx.light ? `Texture: ${ctx.light}.` : "Fine photochemical grain with gentle halation on highlights.",
    "Cinematic color grade, shallow depth of field, 2.39:1 frame.",
    ctx.hasVisualRef ? "Match lighting and grade to reference plate." : "",
  ].filter(Boolean);

  return {
    prompt: sentences.join(" ").replace(/\s+/g, " ").trim().slice(0, 2000),
    negativePrompt: motionNegativePrompt(ctx),
  };
}
