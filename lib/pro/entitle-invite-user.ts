import { createAdminClient } from "@/lib/supabase/admin";
import { hasProInviteAccess, isProInviteOnly } from "@/lib/pro/invite-gate";

/** Soft-launch allowlist window stored as profile `trialing` (not a Stripe Checkout trial). */
const ALLOWLIST_ACCESS_DAYS = 30;

/**
 * Soft launch: valid invite cookie → grant studio access (`trialing` on profiles)
 * so filmmakers can open `/pro/app` without Stripe. Does not downgrade `active`.
 * Returns true when the user is entitled after this call.
 */
export async function ensureInviteTrialEntitlement(userId: string): Promise<boolean> {
  if (!isProInviteOnly()) return false;
  if (!(await hasProInviteAccess())) return false;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return false;
  }

  const { data: existing } = await admin
    .from("profiles")
    .select("subscription_status")
    .eq("id", userId)
    .maybeSingle();

  const status = existing?.subscription_status as string | null | undefined;
  if (status === "active" || status === "trialing") {
    return true;
  }

  const periodEnd = new Date(
    Date.now() + ALLOWLIST_ACCESS_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error } = await admin.from("profiles").upsert(
    {
      id: userId,
      subscription_status: "trialing",
      subscription_current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("[ensureInviteTrialEntitlement]", error.message);
    return false;
  }
  return true;
}
