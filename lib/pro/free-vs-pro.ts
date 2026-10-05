/**
 * How Pro differs from the free 35mmAi session — original copy for in-app callouts.
 */

import { BRAND_NAME, BRAND_NAME_PRO } from "@/lib/brand/brand-identity";

export const FREE_VS_PRO = {
  freeTitle: `Free ${BRAND_NAME}`,
  freeBody:
    "A directory of AI tools for filmmakers. Find what each person on set needs, and build a simple budget from the tools that fit.",
  proTitle: BRAND_NAME_PRO,
  proBody: "Leave with a prompt for every shot, written in the look of your film, ready to paste into the tools you already use.",
  principle:
    "AI can support a real film when human judgment leads. The story bible carries consistency; tools help you execute. They are not the film on their own.",
} as const;

export const FREE_VS_PRO_HIGHLIGHTS = {
  free: [
    "The right tool for each person on set",
    "Simple budgets built from those AI tools",
    "Steps and a starter prompt on each tool",
    "Workflows from pre-production to delivery",
  ] as const,
  pro: [
    "A prompt for every shot in your script",
    "Your look locked into each one",
    "Paste them into Midjourney, Kling, LTX, and more",
  ] as const,
};

/** Short principle used in the location-pass playbook intro (original wording). */
export const AI_MEDIUM_NOTE =
  "Generators rarely match your first idea. Treat them like a stubborn collaborator: learn how they behave, give clear references, and leave room for surprises.";
