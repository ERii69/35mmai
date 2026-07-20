import { getProBillingSnapshot, isProEntitled } from "@/lib/entitlements";
import { isSupabaseConfigured } from "@/lib/pro-stack-config";
import { createClient } from "@/lib/supabase/server";

export type ProMarketingSession = {
  stackReady: boolean;
  userEmail: string | null;
  userMetadata: { full_name?: string; name?: string } | null;
  entitled: boolean;
  signedIn: boolean;
  canManageBilling: boolean;
};

/** Auth + stack state for public Pro marketing and legal pages. */
export async function getProMarketingSession(): Promise<ProMarketingSession> {
  const stackReady = isSupabaseConfigured();
  let userEmail: string | null = null;
  let userMetadata: { full_name?: string; name?: string } | null = null;
  let entitled = false;
  let canManageBilling = false;

  if (stackReady) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
    userMetadata =
      (user?.user_metadata as { full_name?: string; name?: string } | undefined) ?? null;
    entitled = user ? await isProEntitled() : false;
    if (user) {
      const billing = await getProBillingSnapshot();
      canManageBilling = Boolean(billing?.stripe_customer_id);
    }
  }

  return {
    stackReady,
    userEmail,
    userMetadata,
    entitled,
    signedIn: Boolean(userEmail),
    canManageBilling,
  };
}
