/**
 * Stripe Checkout trial length (days).
 * Soft launch: public Checkout is off (`PRO_PUBLIC_CHECKOUT=0`) — ignore trial marketing; use invite allowlist.
 * Live: $15/mo from day one (`0`). Set a positive number only if a trial is turned back on.
 *
 * Prefer `NEXT_PUBLIC_PRO_SUBSCRIPTION_TRIAL_DAYS` so client marketing matches Checkout.
 * Server-only `PRO_SUBSCRIPTION_TRIAL_DAYS` is a fallback for Stripe.
 */
export function getProSubscriptionTrialDays(): number {
  const raw =
    process.env.NEXT_PUBLIC_PRO_SUBSCRIPTION_TRIAL_DAYS?.trim() ||
    process.env.PRO_SUBSCRIPTION_TRIAL_DAYS?.trim();
  if (raw === undefined || raw === "") return 0;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  // Stripe max trial is typically 730; keep a sane product cap.
  return Math.min(n, 90);
}

export function hasProSubscriptionTrial(): boolean {
  return getProSubscriptionTrialDays() > 0;
}
