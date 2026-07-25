import { cookies } from "next/headers";
import { isProPublicCheckoutEnabled } from "@/lib/pro/launch-flags";

/** httpOnly cookie set after a valid /pro/invite/[code] visit. */
export const PRO_INVITE_COOKIE = "pro_invite_code";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 60; // 60 days

/** Soft launch: public CTAs require a valid invite cookie. */
export function isProInviteOnly(): boolean {
  const raw = process.env.PRO_INVITE_ONLY?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

/** Comma/whitespace-separated codes from PRO_INVITE_CODES. */
export function getProInviteCodes(): string[] {
  const raw = process.env.PRO_INVITE_CODES?.trim() ?? "";
  if (!raw) return [];
  return [
    ...new Set(
      raw
        .split(/[\s,]+/)
        .map((c) => c.trim())
        .filter(Boolean)
    ),
  ];
}

export function normalizeInviteCode(code: string): string {
  return code.trim();
}

export function isValidInviteCode(code: string | null | undefined): boolean {
  if (!code) return false;
  const normalized = normalizeInviteCode(code);
  if (!normalized) return false;
  return getProInviteCodes().some((c) => c === normalized);
}

export async function getInviteCodeFromCookie(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(PRO_INVITE_COOKIE)?.value;
  return value ? normalizeInviteCode(value) : null;
}

/** True when invite-only is off, or cookie holds a still-valid code. */
export async function hasProInviteAccess(): Promise<boolean> {
  if (!isProInviteOnly()) return true;
  const code = await getInviteCodeFromCookie();
  return isValidInviteCode(code);
}

/**
 * May start Stripe Checkout: invite OK (if required) + public checkout flag on.
 * Soft launch with PRO_PUBLIC_CHECKOUT=0 uses SQL allowlist instead.
 */
export async function canStartProCheckout(): Promise<boolean> {
  if (!isProPublicCheckoutEnabled()) return false;
  return hasProInviteAccess();
}

export async function setProInviteCookie(code: string): Promise<void> {
  const jar = await cookies();
  jar.set(PRO_INVITE_COOKIE, normalizeInviteCode(code), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
}

/** After invite: password create/sign-in → studio (auto-entitled when invite cookie valid). */
export const PRO_INVITE_POST_ACCEPT_HREF = "/pro/invite/accept?next=/pro/app";
