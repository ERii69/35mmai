"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthChrome } from "@/components/auth/AuthChrome";
import {
  PRO_PRIVACY_PATH,
  PRO_TERMS_PATH,
} from "@/lib/pro/membership-policy";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import {
  PRO_INVITE_MAGIC_LEAD,
  PRO_INVITE_MAGIC_SENT,
} from "@/lib/pro/marketing-copy";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/client";
import { proAuth, proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";

type Props = {
  next?: string;
};

export function InviteMagicLinkForm({ next: nextProp }: Props) {
  const next = safeNextPath(nextProp, "/pro/app");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!acceptedTerms) {
      setError("Please agree to the Privacy & data policy and Terms of use.");
      return;
    }
    setLoading(true);
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL ?? "";
      const redirectTo = `${origin}/auth/callback?${new URLSearchParams({ next }).toString()}`;
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });
      if (otpError) {
        setError(otpError.message);
        return;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send sign-in link.");
    } finally {
      setLoading(false);
    }
  }

  const passwordHref =
    next === "/account" || next === "/pro/app"
      ? "/login"
      : `/login?${new URLSearchParams({ next }).toString()}`;

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <AuthChrome subtitle="Check your email" showLogo={false} showTagline={false} />
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-pro-text-secondary">
          {PRO_INVITE_MAGIC_SENT}{" "}
          <span className="font-medium text-pro-text">{email.trim()}</span>
        </p>
        <p className="text-xs text-pro-text-secondary/80">
          Open the link in that email — you’ll land in your projects dashboard.
        </p>
        <button
          type="button"
          className={proAuth.link}
          onClick={() => {
            setSent(false);
            setError(null);
          }}
        >
          Use a different email
        </button>
      </div>
    );
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
          {PRO_INVITE_MAGIC_LEAD}
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
          {loading ? "Sending link…" : "Email me a sign-in link"}
        </button>
      </form>

      <p className="text-center text-sm leading-relaxed text-pro-text-secondary">
        Prefer a password?{" "}
        <Link href={passwordHref} className={proAuth.link}>
          Sign in with password
        </Link>
      </p>
    </>
  );
}
