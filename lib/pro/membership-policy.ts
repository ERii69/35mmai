/** Shared membership privacy & retention copy — keep in sync with /pro/privacy and /pro/terms. */

import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";

/** Days after subscription ends before project data is deleted from our database. */
export const PRO_DATA_RETENTION_DAYS = 7;

const MS_PER_DAY = 86_400_000;

export const PRO_PRIVACY_PATH = "/pro/privacy";
export const PRO_TERMS_PATH = "/pro/terms";

export const PRO_SIGNUP_CONSENT_LABEL =
  `I agree to the Privacy & data policy and Terms of use for ${BRAND_NAME_PRO}. I understand my projects are private to my account and are not used to train AI models.`;

export const PRO_CANCEL_RETENTION_SUMMARY = `If you cancel, you keep access until the end of your billing period. After access ends, we keep your projects for ${PRO_DATA_RETENTION_DAYS} days so you can export or resubscribe, then we delete them.`;

/** Dashboard + account — short private-account cue (link to legal pages for detail). */
export const PRO_PRIVATE_STUDIO_TAGLINE =
  "Your projects stay on your account. Only you can open them when signed in.";

export const PRO_SCRIPT_PASTE_PRIVACY_CALLOUT =
  "Saved to your account only — we don’t send this script to our servers for AI or model training.";

export function isEntitledSubscriptionStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

/** Instant paid access ended (period end). Retention is counted from this timestamp. */
export function dataRetentionDeadline(accessEndedAt: Date | string): Date {
  const t =
    typeof accessEndedAt === "string" ? new Date(accessEndedAt).getTime() : accessEndedAt.getTime();
  return new Date(t + PRO_DATA_RETENTION_DAYS * MS_PER_DAY);
}

export function isPastDataRetentionDeadline(
  accessEndedAt: Date | string,
  now: Date = new Date()
): boolean {
  return now.getTime() >= dataRetentionDeadline(accessEndedAt).getTime();
}

export type ProAccessKind = "full" | "retention" | "none";

export type ProAccess = {
  kind: ProAccessKind;
  entitled: boolean;
  retention: boolean;
  canOpenStudio: boolean;
  canWrite: boolean;
  canExport: boolean;
  periodEndIso: string | null;
  deleteAtIso: string | null;
};

export function proAccessFromSnapshot(
  snap: {
    subscription_status: string | null;
    subscription_current_period_end: string | null;
  } | null,
  now: Date = new Date()
): ProAccess {
  const entitled = isEntitledSubscriptionStatus(snap?.subscription_status);
  const periodEndIso = snap?.subscription_current_period_end ?? null;
  const deleteAt = periodEndIso ? dataRetentionDeadline(periodEndIso) : null;
  const retention = !entitled && deleteAt != null && now.getTime() < deleteAt.getTime();
  const kind: ProAccessKind = entitled ? "full" : retention ? "retention" : "none";
  return {
    kind,
    entitled,
    retention,
    canOpenStudio: entitled || retention,
    canWrite: entitled,
    canExport: entitled || retention,
    periodEndIso,
    deleteAtIso: deleteAt?.toISOString() ?? null,
  };
}

export function shouldPurgeExpiredProjects(
  profile: {
    subscription_status: string | null;
    subscription_current_period_end: string | null;
  },
  now: Date = new Date()
): boolean {
  if (isEntitledSubscriptionStatus(profile.subscription_status)) return false;
  if (!profile.subscription_current_period_end) return false;
  return isPastDataRetentionDeadline(profile.subscription_current_period_end, now);
}
