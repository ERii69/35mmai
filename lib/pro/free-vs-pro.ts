/**
 * How Pro differs from the free 35mmAi session — original copy for in-app callouts.
 */

import { BRAND_NAME, BRAND_NAME_PRO } from "@/lib/brand/brand-identity";

export const FREE_VS_PRO = {
  freeTitle: `Free ${BRAND_NAME}`,
  freeBody: "Discover tools in the catalog — browse, compare, and plan kit and budget in your browser.",
  proTitle: BRAND_NAME_PRO,
  proBody: "Script + look → prompt pack — cloud projects and export for Midjourney, Kling, LTX, Nano, and Higgsfield.",
  principle:
    "AI can support a real film when human judgment leads. The story bible carries consistency; tools help you execute. They are not the film on their own.",
} as const;

export const FREE_VS_PRO_HIGHLIGHTS = {
  free: ["Discover tools in catalog", "Local kit & budget math", "Free forever"] as const,
  pro: [
    "Cloud projects + prompt packs",
    "Script → look → export",
    "Private studio save & sync",
    "AI assist separate (when enabled)",
  ] as const,
};

/** Short principle used in the location-pass playbook intro (original wording). */
export const AI_MEDIUM_NOTE =
  "Generators rarely match your first idea. Treat them like a stubborn collaborator: learn how they behave, give clear references, and leave room for surprises.";
