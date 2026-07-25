import { type NextRequest, NextResponse } from "next/server";
import { completeAuthAndRedirect } from "@/lib/auth/complete-auth-redirect";

export async function GET(request: NextRequest) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
  }

  return completeAuthAndRedirect(request, async (supabase) => {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return { userId: null, errorMessage: error.message };
    }
    return {
      userId: data.session?.user?.id ?? data.user?.id ?? null,
      errorMessage: null,
    };
  });
}
