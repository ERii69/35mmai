import { createClient } from "@/lib/supabase/server";

const ENTITLED_STATUSES = new Set(["active", "trialing"]);

/**
 * True when the signed-in user has an active or trialing Stripe subscription on `profiles`.
 * Uses the user-scoped Supabase client (RLS); safe for Server Components / Server Actions.
 */
export async function isProEntitled(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  const status = data?.subscription_status;
  return typeof status === "string" && ENTITLED_STATUSES.has(status);
}
