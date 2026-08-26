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

/**
 * PostgREST data client after `auth.getUser()`.
 * Fresh user JWTs can be rejected with PGRST303 "JWT issued at future" when Auth's
 * clock is slightly ahead of the REST gateway. Service role skips that check.
 * Always filter by the verified `user.id` — this bypasses RLS.
 */
export function createUserDataClient(fallback: SupabaseClient): SupabaseClient {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return fallback;
  try {
    return createAdminClient();
  } catch {
    return fallback;
  }
}
