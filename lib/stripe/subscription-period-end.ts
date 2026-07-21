import type Stripe from "stripe";

/**
 * Stripe Billing API (2024+) exposes billing period bounds on each {@link Stripe.SubscriptionItem},
 * not on the root {@link Stripe.Subscription}. Read the first item, with a legacy top-level fallback.
 */
export function getSubscriptionCurrentPeriodEndUnix(sub: Stripe.Subscription): number | null {
  let best: number | null = null;
  for (const item of sub.items?.data ?? []) {
    const end = item.current_period_end;
    if (typeof end === "number" && end > 0 && (best == null || end > best)) best = end;
  }
  if (best != null) return best;

  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (typeof legacy === "number" && legacy > 0) return legacy;

  return null;
}

export function subscriptionCurrentPeriodEndIso(sub: Stripe.Subscription): string | null {
  const unix = getSubscriptionCurrentPeriodEndUnix(sub);
  if (unix == null) return null;
  return new Date(unix * 1000).toISOString();
}
