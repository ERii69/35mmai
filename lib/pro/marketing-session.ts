import { getProBillingSnapshot, isProEntitled } from "@/lib/entitlements";
import { hasProInviteAccess, isProInviteOnly } from "@/lib/pro/invite-gate";
import { isSupabaseConfigured } from "@/lib/pro-stack-config";
import { createClient } from "@/lib/supabase/server";

export type ProMarketingSession = {
  stackReady: boolean;
  userEmail: string | null;
  userMetadata: { full_name?: string; name?: string } | null;
  entitled: boolean;
  signedIn: boolean;
  canManageBilling: boolean;
  /** Soft launch: invite cookie valid (or invite-only off). */
  inviteUnlocked: boolean;
  inviteOnly: boolean;
};

/** Auth + stack state for public Pro marketing and legal pages. */
export async function getProMarketingSession(): Promise<ProMarketingSession> {
  const stackReady = isSupabaseConfigured();
  const inviteOnly = isProInviteOnly();
  let userEmail: string | null = null;
  let userMetadata: { full_name?: string; name?: string } | null = null;
  let entitled = false;
  let canManageBilling = false;
  const inviteUnlocked = await hasProInviteAccess();

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
    inviteUnlocked,
    inviteOnly,
  };
}
