/**
 * Stripe Checkout trial length (days).
 * Soft launch: public Checkout is off (`PRO_PUBLIC_CHECKOUT=0`) — ignore trial marketing; use invite allowlist.
 * Live: keep 7 (default), or set `0` for pay-from-day-one (marketing labels follow via `PRO_MARKETING_PRICE`).
 *
 * Prefer `NEXT_PUBLIC_PRO_SUBSCRIPTION_TRIAL_DAYS` so client marketing matches Checkout.
 * Server-only `PRO_SUBSCRIPTION_TRIAL_DAYS` is a fallback for Stripe.
 */
export function getProSubscriptionTrialDays(): number {
  const raw =
    process.env.NEXT_PUBLIC_PRO_SUBSCRIPTION_TRIAL_DAYS?.trim() ||
    process.env.PRO_SUBSCRIPTION_TRIAL_DAYS?.trim();
  if (raw === undefined || raw === "") return 7;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return 7;
  // Stripe max trial is typically 730; keep a sane product cap.
  return Math.min(n, 90);
}

export function hasProSubscriptionTrial(): boolean {
  return getProSubscriptionTrialDays() > 0;
}
