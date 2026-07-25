import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { ensureInviteTrialEntitlement } from "@/lib/pro/entitle-invite-user";
import { isProInviteOnly } from "@/lib/pro/invite-gate";

/**
 * Auth callback/confirm: exchange or verify, set cookies on the redirect response,
 * then send invited users into the studio when entitled.
 */
export async function completeAuthAndRedirect(
  request: NextRequest,
  authenticate: (
    supabase: ReturnType<typeof createServerClient>
  ) => Promise<{ userId: string | null; errorMessage: string | null }>
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  let next = safeNextPath(searchParams.get("next"), "/pro/app");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  let response = NextResponse.redirect(new URL(next, request.url));

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.redirect(new URL(next, request.url));
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { userId, errorMessage } = await authenticate(supabase);
  if (errorMessage) {
    console.error("[auth]", errorMessage);
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
  }

  if (userId && isProInviteOnly()) {
    const entitled = await ensureInviteTrialEntitlement(userId);
    if (entitled && (next === "/account" || next.startsWith("/account?"))) {
      next = "/pro/app";
      // Rebuild redirect so Set-Cookie headers from exchange stay on the final response.
      const rebuilt = NextResponse.redirect(new URL(next, request.url));
      response.cookies.getAll().forEach((cookie) => {
        rebuilt.cookies.set(cookie);
      });
      response = rebuilt;
    }
  }

  return response;
}
