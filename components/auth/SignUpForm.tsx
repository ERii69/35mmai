"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthChrome } from "@/components/auth/AuthChrome";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui/button";
import {
  PRO_PRIVACY_PATH,
  PRO_TERMS_PATH,
} from "@/lib/pro/membership-policy";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import {
  PRO_MARKETING_PRICE,
  PRO_MARKETING_SIGNUP_LEAD,
  PRO_MARKETING_SIGNUP_NEXT,
} from "@/lib/pro/marketing-copy";
import { proAuth, proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";
import { createClient } from "@/lib/supabase/client";

function signInHref(next: string) {
  if (next === "/account") return "/login";
  return `/login?${new URLSearchParams({ next }).toString()}`;
}

type Props = {
  /** PRO_PUBLIC_CHECKOUT — when false, hide trial/card checkout copy. */
  checkoutEnabled: boolean;
};

export function SignUpForm({ checkoutEnabled }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!acceptedTerms) {
      setError("Please agree to the Privacy & data policy and Terms of use.");
      return;
    }
    setLoading(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL ?? "";
      const supabase = createClient();
      const { data, error: signError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });
      if (signError) {
        setError(signError.message);
        return;
      }
      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }
      setMessage("Check your email for a confirmation link, then sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell mode="signup" next={next}>
      <div className="space-y-2 text-center">
        <AuthChrome subtitle={`Create your ${BRAND_NAME_PRO} account`} showLogo={false} showTagline={false} />
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-pro-text-secondary">
          {checkoutEnabled ? PRO_MARKETING_SIGNUP_NEXT : PRO_MARKETING_SIGNUP_LEAD}
        </p>
        {checkoutEnabled ? (
          <p className="text-xs text-pro-text-secondary/80">{PRO_MARKETING_PRICE.checkoutNote}</p>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className={`${proAuth.card} mt-2`}>
        <div className="space-y-4">
          <div>
            <label htmlFor="signup-email" className={proAuth.label}>
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={proSurface.field}
            />
          </div>
          <div>
            <label htmlFor="signup-password" className={proAuth.label}>
              Password
            </label>
            <input
              id="signup-password"
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
        </div>

        <div className={proAuth.cardInner}>
          <label className="grid cursor-pointer grid-cols-[1.125rem_1fr] items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 size-[1.125rem] shrink-0 rounded border-white/20 accent-pro-primary"
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
        {message ? (
          <p className="text-sm text-pro-success" role="status">
            {message}
          </p>
        ) : null}

        <Button
          type="submit"
          className={proBtn.primaryFull}
          disabled={loading || !acceptedTerms}
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm leading-relaxed text-pro-text-secondary">
        Already have an account?{" "}
        <Link href={signInHref(next)} className={proAuth.link}>
          Sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
