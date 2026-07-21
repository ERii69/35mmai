import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { ensureInviteTrialEntitlement } from "@/lib/pro/entitle-invite-user";
import { isProInviteOnly } from "@/lib/pro/invite-gate";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = safeNextPath(searchParams.get("next"), "/account");

  if (code) {
    const cookieStore = await cookies();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return NextResponse.redirect(`${origin}/login?error=config`);
    }

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const userId = data.session?.user?.id ?? data.user?.id;
      if (userId && isProInviteOnly()) {
        const entitled = await ensureInviteTrialEntitlement(userId);
        if (entitled && (next === "/account" || next.startsWith("/account?"))) {
          next = "/pro/app";
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
