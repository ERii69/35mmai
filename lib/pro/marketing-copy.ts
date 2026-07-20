/** Public /pro marketing — Script to prompt refocus (phase-0 lock). */

import { BRAND_NAME, BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import { PRO_SUBSCRIPTION_TRIAL_DAYS } from "@/lib/pro/subscription-trial";

/** Primary hero line — names templates/workflows, not just pipeline steps. */
export const PRO_MARKETING_EYEBROW = "Script to Prompt · Default workflow";

export const PRO_MARKETING_HERO = "Script templates → ready prompts";

export const PRO_MARKETING_HEADLINE = "From screenplay to copy-ready prompts.";

/** One line under headline — paste → prep → export. */
export const PRO_MARKETING_SUBHEAD =
  "Pick a workflow, paste your script, lock your look, export a prompt pack for Midjourney, Kling, LTX, and more.";

/** Compact pitch on the free catalog (All Tools / landing). */
export const FREE_CATALOG_PRO_TEASER =
  "Have a script? Get copy-ready prompts for Midjourney, Kling, LTX, and more.";

/** Supporting line under the free → Pro handoff card. */
export const FREE_CATALOG_PRO_TEASER_DETAIL = `Free ${BRAND_NAME} helps you discover tools. Pro turns your screenplay and look into a prompt pack for the tools you already picked.`;

export const FREE_CATALOG_PRO_CTA = `Explore ${BRAND_NAME_PRO}`;

export const PRO_MARKETING_TEASER = FREE_CATALOG_PRO_TEASER;

/** Display price — keep in sync with Stripe Price (docs/35mmpro-api-free-summary.md). */
export const PRO_MARKETING_PRICE = {
  amountUsd: 9,
  label: "$9",
  suffix: "/mo",
  fullLabel: "$9/mo",
  trialDays: PRO_SUBSCRIPTION_TRIAL_DAYS,
  trialLabel: `${PRO_SUBSCRIPTION_TRIAL_DAYS}-day free trial`,
  trialThenLabel: `${PRO_SUBSCRIPTION_TRIAL_DAYS}-day free trial, then $9/mo`,
  currencyNote: "USD · cancel anytime",
  checkoutNote: "Card required at checkout. Cancel before the trial ends to pay nothing.",
} as const;

export const PRO_MARKETING_TRUST = [
  `${PRO_SUBSCRIPTION_TRIAL_DAYS}-day free trial — cancel before it ends to pay nothing`,
  "You approve scenes and look before prompts are final",
  "Projects stay private to your account",
] as const;

export const PRO_MARKETING_SIGNUP_NEXT = `Next step: start your ${PRO_MARKETING_PRICE.trialLabel} on Account to open ${BRAND_NAME_PRO}.`;

/** Sign-up page lead — short, scannable. */
export const PRO_MARKETING_SIGNUP_LEAD = `${PRO_MARKETING_PRICE.trialLabel}, then ${PRO_MARKETING_PRICE.fullLabel}. After sign-up, continue on Account to start checkout.`;

export const PRO_MARKETING_CTA_TRIAL = `Start ${PRO_SUBSCRIPTION_TRIAL_DAYS}-day free trial`;

export const PRO_MARKETING_CTA_CREATE_TRIAL = "Create account · free trial";

/** One paragraph for mobile — replaces feature card grid below sm. */
export const PRO_MARKETING_FEATURES_MOBILE =
  "Script → Look → Prompt pack: paste screenplay, lock look, export copy-ready prompts for Midjourney, Kling, LTX, Nano, and Higgsfield. Cloud projects and crew-ready exports.";
