import { isProStackConfigured, PRO_STACK_ENV_HINT } from "@/lib/pro-stack-config";
import { createClient } from "@/lib/supabase/server";
import { isProEntitled } from "@/lib/entitlements";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export type ProUserContext = {
  supabase: SupabaseClient;
  user: User;
};

/** Authenticated user with active or trialing subscription. */
export async function requireProUser(): Promise<ProUserContext> {
  if (!isProStackConfigured()) {
    throw new Error(PRO_STACK_ENV_HINT);
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sign in required.");
  }

  const entitled = await isProEntitled();
  if (!entitled) {
    throw new Error("An active 35mmAiPro studio subscription is required (cloud projects + export).");
  }

  return { supabase, user };
}
