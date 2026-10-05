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

  const sentence = (text: string) => {
    const trimmed = text.trim().replace(/\.+$/, "");
    return trimmed ? `${trimmed}.` : "";
  };

  const sentences = [
    `Shot on ${profile}.`,
    ctx.subject ? sentence(ctx.subject) : "",
    ctx.mood ? sentence(ctx.mood) : "",
    ctx.palette ? `Color palette: ${ctx.palette}.` : "",
    ctx.camera ? `Camera: ${sentence(ctx.camera)}` : "Motivated key with soft fill and controlled contrast.",
    ctx.light ? `Texture: ${sentence(ctx.light)}` : "Fine photochemical grain with gentle halation on highlights.",
    "Cinematic color grade, shallow depth of field, 2.39:1 frame.",
    ctx.hasVisualRef ? "Match lighting and grade to reference plate." : "",
  ].filter(Boolean);

  return {
    prompt: sentences.join(" ").replace(/\s+/g, " ").trim().slice(0, 2000),
    negativePrompt: motionNegativePrompt(ctx),
  };
}
