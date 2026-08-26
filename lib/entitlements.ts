import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/pro-stack-config";
import { createUserDataClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ENTITLED_STATUSES = new Set(["active", "trialing"]);

/**
 * What a Pro subscription unlocks (Phase 4).
 * Cloud AI / Director agents are NOT included — gated by `areProAgentsEnabled()` + `lib/pro/ai-quota.ts`.
 */
export const PRO_SUBSCRIPTION_INCLUDES = [
  "Private studio (/pro/app)",
  "Cloud project save & sync",
  "Prompt pack export",
] as const;

export type ProBillingSnapshot = {
  subscription_status: string | null;
  subscription_current_period_end: string | null;
  stripe_customer_id: string | null;
};

/** Cached per request — use in `/pro/app` layout + page without duplicate round-trips. */
export const getProBillingSnapshot = cache(async (): Promise<ProBillingSnapshot | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await createUserDataClient(supabase)
    .from("profiles")
    .select("subscription_status, subscription_current_period_end, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;
  return {
    subscription_status: data.subscription_status as string | null,
    subscription_current_period_end: data.subscription_current_period_end as string | null,
    stripe_customer_id: data.stripe_customer_id as string | null,
  };
});

/**
 * Studio access: signed-in user with `active` or `trialing` on `profiles`.
 * Soft launch: invite allowlist grants `trialing` via `ensureInviteTrialEntitlement` (not a Stripe trial).
 * Paid: Stripe Checkout / webhooks set `active` or Stripe `trialing`.
 * Does not grant cloud AI — that is `areProAgentsEnabled()` + `consumeAiQuotaOrReject`.
 */
export async function isProEntitled(): Promise<boolean> {
  const snap = await getProBillingSnapshot();
  const status = snap?.subscription_status;
  return typeof status === "string" && ENTITLED_STATUSES.has(status);
}
