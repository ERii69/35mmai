import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.trim() || !key?.trim()) {
    const missing = [
      !url?.trim() && "NEXT_PUBLIC_SUPABASE_URL",
      !key?.trim() && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ].filter(Boolean);
    throw new Error(
      `Missing or empty Supabase env: ${missing.join(", ")}. Set .env.local in project root and restart the dev server.`
    );
  }
  return createBrowserClient(url, key);
}
