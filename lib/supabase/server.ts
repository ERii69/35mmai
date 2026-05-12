import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    const missing = [
      !url?.trim() && "NEXT_PUBLIC_SUPABASE_URL",
      !key?.trim() && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ].filter(Boolean);
    throw new Error(
      `Missing or empty Supabase env: ${missing.join(", ")}. Add them to .env.local in the project root (publishable key → NEXT_PUBLIC_SUPABASE_ANON_KEY), then restart \`npm run dev\`.`
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; middleware refreshes the session.
        }
      },
    },
  });
}
