import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/pro-stack-config";
import { createClient } from "@/lib/supabase/server";

const ENTITLED_STATUSES = new Set(["active", "trialing"]);

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

  const { data } = await supabase
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
 * True when the signed-in user has an active or trialing Stripe subscription on `profiles`.
 * Uses the user-scoped Supabase client (RLS); safe for Server Components / Server Actions.
 */
export async function isProEntitled(): Promise<boolean> {
  const snap = await getProBillingSnapshot();
  const status = snap?.subscription_status;
  return typeof status === "string" && ENTITLED_STATUSES.has(status);
}
