"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_ORIGINS = new Set([
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "https://www.35mmai.com",
  "https://35mmai.com",
]);

export type PasswordResetResult = { ok: true } | { ok: false; error: string };

function resetRedirect(origin: string): string {
  let base = getSiteUrl();
  try {
    const url = new URL(origin);
    if (ALLOWED_ORIGINS.has(url.origin)) base = url.origin;
  } catch {
    /* use the public site origin */
  }
  return `${base}/auth/callback?next=/auth/update-password`;
}

/**
 * Email a password-reset link through Resend.
 * Unknown addresses get the same success response so the form does not reveal who has an account.
 */
export async function requestPasswordReset(
  email: string,
  origin: string
): Promise<PasswordResetResult> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) {
    return { ok: false, error: "Enter a valid email." };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.PRO_WAITLIST_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return { ok: false, error: "Password reset email is not configured yet." };
  }

  let actionLink = "";
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: trimmed,
      options: { redirectTo: resetRedirect(origin) },
    });
    const actionLinkValue = data?.properties?.action_link;
    if (error || !actionLinkValue) {
      return { ok: true };
    }
    actionLink = actionLinkValue;
  } catch {
    return { ok: false, error: "Could not send the reset email. Try again." };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [trimmed],
        subject: "Reset your 35mmAiPro password",
        text: [
          "Choose a new password for 35mmAiPro.",
          "",
          actionLink,
          "",
          "If you did not ask for this, you can ignore this email.",
        ].join("\n"),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return { ok: false, error: "Could not send the reset email. Try again." };
    }
  } catch {
    return { ok: false, error: "Could not send the reset email. Try again." };
  }

  return { ok: true };
}
