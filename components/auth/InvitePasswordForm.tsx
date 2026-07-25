"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthChrome } from "@/components/auth/AuthChrome";
import {
  PRO_PRIVACY_PATH,
  PRO_TERMS_PATH,
} from "@/lib/pro/membership-policy";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import { PRO_INVITE_PASSWORD_LEAD } from "@/lib/pro/marketing-copy";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/client";
import { proAuth, proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";

type Props = {
  next?: string;
};

/**
 * Soft-launch invite accept: create password (or sign in) → studio.
 * No magic-link email step.
 */
export function InvitePasswordForm({ next: nextProp }: Props) {
  const next = safeNextPath(nextProp, "/pro/app");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const loginHref =
    next === "/account" || next === "/pro/app"
      ? "/login?next=/pro/app"
      : `/login?${new URLSearchParams({ next }).toString()}`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!acceptedTerms) {
      setError("Please agree to the Privacy & data policy and Terms of use.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signError) {
        const msg = signError.message.toLowerCase();
        if (msg.includes("already") || msg.includes("registered")) {
          setError("That email already has an account. Sign in with your password.");
          return;
        }
        setError(signError.message);
        return;
      }
      if (data.session) {
        // Full navigation so middleware + /pro/app layout see session cookies.
        window.location.assign(next);
        return;
      }
      setError(
        "Account created, but email confirmation is still required in Supabase. Disable Confirm email for soft launch, or confirm once, then sign in."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-2 text-center">
        <AuthChrome
          subtitle={`You’re invited to ${BRAND_NAME_PRO}`}
          showLogo={false}
          showTagline={false}
        />
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-pro-text-secondary">
          {PRO_INVITE_PASSWORD_LEAD}
        </p>
      </div>

      <form onSubmit={onSubmit} className={`${proAuth.card} mt-2`}>
        <div>
          <label htmlFor="invite-email" className={proAuth.label}>
            Email
          </label>
          <input
            id="invite-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={proSurface.field}
            placeholder="you@studio.com"
          />
        </div>

        <div>
          <label htmlFor="invite-password" className={proAuth.label}>
            Password
          </label>
          <input
            id="invite-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={proSurface.field}
          />
          <p className="mt-1.5 text-xs text-pro-text-secondary">At least 8 characters.</p>
        </div>

        <div className={proAuth.cardInner}>
          <label className="grid cursor-pointer grid-cols-[1.125rem_1fr] items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 size-[1.125rem] shrink-0 rounded border-white/20 accent-white"
              required
            />
            <span className="text-left text-[13px] leading-relaxed text-pro-text-secondary">
              I agree to the{" "}
              <Link href={PRO_PRIVACY_PATH} className={proAuth.link}>
                Privacy &amp; data policy
              </Link>{" "}
              and{" "}
              <Link href={PRO_TERMS_PATH} className={proAuth.link}>
                Terms of use
              </Link>
              . Projects stay private to your account and are not used to train AI models.
            </span>
          </label>
        </div>

        {error ? (
          <p className="text-sm text-pro-warning" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className={proBtn.primaryFull}
          disabled={loading || !acceptedTerms}
        >
          {loading ? "Opening studio…" : "Create account & open studio"}
        </button>
      </form>

      <p className="text-center text-sm leading-relaxed text-pro-text-secondary">
        Already have an account?{" "}
        <Link href={loginHref} className={proAuth.link}>
          Sign in
        </Link>
      </p>
    </>
  );
}
