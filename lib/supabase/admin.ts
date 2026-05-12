import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminSingleton: SupabaseClient | null = null;

/**
 * Service-role client for server-only paths (e.g. Stripe webhooks). Bypasses RLS.
 * Never import this from client components.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (required for Stripe webhooks)."
    );
  }
  if (!adminSingleton) {
    adminSingleton = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminSingleton;
}
