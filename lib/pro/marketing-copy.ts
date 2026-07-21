/** Public /pro marketing — Script to prompt (Phase 2 product honesty + Phase 4 billing). */

import { BRAND_NAME, BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import {
  getProSubscriptionTrialDays,
  hasProSubscriptionTrial,
} from "@/lib/pro/subscription-trial";

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

const trialDays = getProSubscriptionTrialDays();
const withTrial = hasProSubscriptionTrial();

/**
 * Display price — keep in sync with Stripe Price.
 * Subscription = cloud studio + save + export (prompt packs). AI assist is separate (flag + quota).
 */
export const PRO_MARKETING_PRICE = {
  amountUsd: 9,
  label: "$9",
  suffix: "/mo",
  fullLabel: "$9/mo",
  trialDays,
  trialLabel: withTrial ? `${trialDays}-day free trial` : "$9/mo",
  trialThenLabel: withTrial
    ? `${trialDays}-day free trial, then $9/mo`
    : "$9/mo · cancel anytime",
  currencyNote: "USD · cancel anytime",
  /** What you pay for — never “unlimited AI”. */
  valueProp: "Cloud projects + prompt packs",
  checkoutNote: withTrial
    ? "Cloud projects + prompt packs. Card required at checkout. Cancel before the trial ends to pay nothing. AI assist is separate when enabled — not unlimited AI."
    : "Cloud projects + prompt packs. Card required at checkout. AI assist is separate when enabled — not unlimited AI.",
} as const;

/** Soft-launch trust — beta SLA first; trial is not the primary promise while checkout is off. */
export const PRO_MARKETING_BETA_SLA = "Private beta · limited · support via email";

export const PRO_MARKETING_TRUST = [
  PRO_MARKETING_BETA_SLA,
  "Script → Look → Prompt pack — you approve scenes and look before prompts are final",
  "Projects stay private to your account",
] as const;

/** After public checkout returns: trial-forward signup (Account still owns billing). */
export const PRO_MARKETING_SIGNUP_NEXT = withTrial
  ? `Next step: open Account to start your ${PRO_MARKETING_PRICE.trialLabel}, or continue in the studio if you’re already entitled.`
  : "Next step: open Account to subscribe, or continue in the studio if you’re already entitled.";

/** Soft launch / invite — sign-up lead when public Subscribe is off. */
export const PRO_MARKETING_SIGNUP_LEAD =
  "Invite soft launch: create your account, then we’ll unlock studio access for your email. Card checkout stays off for now.";

export const PRO_MARKETING_CTA_TRIAL = withTrial
  ? `Start ${trialDays}-day free trial`
  : "Subscribe to Pro";

export const PRO_MARKETING_CTA_CREATE_TRIAL = withTrial
  ? "Create account · free trial"
  : "Create account · Subscribe";

/** Soft launch / invite-only — prefer waitlist over trial CTAs. */
export const PRO_MARKETING_CTA_WAITLIST = "Join waitlist";

/** Soft launch — invite link required. */
export const PRO_INVITE_ONLY_EYEBROW = "Private beta · invite only";

export const PRO_INVITE_ONLY_HEADLINE = "Invite-only soft launch";

export const PRO_INVITE_ONLY_BODY =
  "We’re opening 35mmAiPro to a small group of filmmakers first. If you received an invite link, open it and we’ll email you a one-click sign-in link. Everyone else can join the waitlist.";

export const PRO_INVITE_INVALID =
  "That invite link isn’t valid or has been revoked. Ask for a fresh link, or join the waitlist below.";

export const PRO_INVITE_REQUIRED_ACCOUNT =
  "Studio access is invite-only right now. Open the invite link we emailed you, then return here.";

export const PRO_CHECKOUT_DISABLED_ACCOUNT =
  "Checkout is paused for soft launch. If you used your invite link, we’ll enable your studio from the allowlist — no card needed yet.";

export const PRO_INVITE_UNLOCKED_NO_CHECKOUT =
  "You’re invited. Enter your email for a one-click sign-in link — we’ll turn on studio access for that email. Card checkout stays off until we open public Subscribe.";

/** Invite accept page — magic link. */
export const PRO_INVITE_MAGIC_LEAD =
  "Enter the email you’ll use for this soft launch. We’ll send a one-click sign-in link — no password needed.";

export const PRO_INVITE_MAGIC_SENT =
  "Sign-in link sent to";

/** Unpaid user bounced from /pro/app — soft vs live wording. */
export const PRO_SUBSCRIBE_REQUIRED_SOFT =
  "Studio access needs an invite unlock (soft launch — no card checkout yet).";

export const PRO_SUBSCRIBE_REQUIRED_LIVE =
  "Subscribe to open the workspace — cloud projects + prompt packs.";

/** One paragraph for mobile — replaces feature card grid below sm. */
export const PRO_MARKETING_FEATURES_MOBILE =
  "Script → Look → Prompt pack: paste screenplay, lock look, export copy-ready prompts for Midjourney, Kling, LTX, Nano, and Higgsfield. Cloud projects you can reopen anytime.";
