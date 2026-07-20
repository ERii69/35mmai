/** Shared membership privacy & retention copy — keep in sync with /pro/privacy and /pro/terms. */

import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";

/** Days after subscription ends before project data is deleted from our database. */
export const PRO_DATA_RETENTION_DAYS = 60;

export const PRO_PRIVACY_PATH = "/pro/privacy";
export const PRO_TERMS_PATH = "/pro/terms";

export const PRO_SIGNUP_CONSENT_LABEL =
  `I agree to the Privacy & data policy and Terms of use for ${BRAND_NAME_PRO}. I understand my projects are private to my account and are not used to train AI models.`;

export const PRO_CANCEL_RETENTION_SUMMARY = `If you cancel, you keep access until the end of your billing period. After that, your workspace is read-only for ${PRO_DATA_RETENTION_DAYS} days so you can export. We then delete your projects and screenplay content from our database unless you resubscribe or contact us about export.`;

/** Dashboard + account — short private-account cue (link to legal pages for detail). */
export const PRO_PRIVATE_STUDIO_TAGLINE =
  "Your projects stay on your account. Only you can open them when signed in.";

export const PRO_SCRIPT_PASTE_PRIVACY_CALLOUT =
  "Saved to your account only — we don’t send this script to our servers for AI or model training.";
