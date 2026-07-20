import { NextResponse } from "next/server";
import {
  isProInviteOnly,
  isValidInviteCode,
  normalizeInviteCode,
  PRO_INVITE_COOKIE,
  PRO_INVITE_POST_ACCEPT_HREF,
} from "@/lib/pro/invite-gate";

export const runtime = "nodejs";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 60;

type Ctx = { params: Promise<{ code: string }> };

/**
 * Invite link entry: /pro/invite/YOUR-CODE
 * Validates against PRO_INVITE_CODES, sets httpOnly cookie, sends filmmaker to sign-up.
 */
export async function GET(request: Request, context: Ctx) {
  const { code: raw } = await context.params;
  const code = normalizeInviteCode(decodeURIComponent(raw ?? ""));

  if (!isProInviteOnly()) {
    return NextResponse.redirect(new URL("/pro", request.url));
  }

  if (!isValidInviteCode(code)) {
    return NextResponse.redirect(new URL("/pro?invite=invalid", request.url));
  }

  const dest = new URL(PRO_INVITE_POST_ACCEPT_HREF, request.url);
  dest.searchParams.set("invited", "1");
  const res = NextResponse.redirect(dest);
  res.cookies.set(PRO_INVITE_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
  return res;
}
