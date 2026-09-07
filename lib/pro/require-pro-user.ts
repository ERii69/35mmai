import { isProStackConfigured, PRO_STACK_ENV_HINT } from "@/lib/pro-stack-config";
import { createUserDataClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getProAccess, isProEntitled } from "@/lib/entitlements";
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
    const access = await getProAccess();
    if (access.retention) {
      throw new Error(
        "Your subscription has ended. You can export your projects for a few more days, then we delete them."
      );
    }
    throw new Error("An active 35mmAiPro studio subscription is required (cloud projects + export).");
  }

  return { supabase: createUserDataClient(supabase), user };
}

/** Signed-in user who may download exports: active Pro or 7-day post-cancel window. */
export async function requireProExportUser(): Promise<ProUserContext> {
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

  const access = await getProAccess();
  if (!access.canExport) {
    throw new Error("An active 35mmAiPro studio subscription is required (cloud projects + export).");
  }

  return { supabase: createUserDataClient(supabase), user };
}
