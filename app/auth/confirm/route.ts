import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { completeAuthAndRedirect } from "@/lib/auth/complete-auth-redirect";

/**
 * Magic-link confirm for SSR — uses token_hash from the email template.
 * More reliable than PKCE emailRedirectTo when Gmail/security scanners open the link.
 *
 * Template (Authentication → Email Templates → Magic Link):
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/pro/app
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
  }

  return completeAuthAndRedirect(request, async (supabase) => {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) {
      return { userId: null, errorMessage: error.message };
    }
    return {
      userId: data.session?.user?.id ?? data.user?.id ?? null,
      errorMessage: null,
    };
  });
}
