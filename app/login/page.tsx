"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthChrome } from "@/components/auth/AuthChrome";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui/button";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import { createClient } from "@/lib/supabase/client";
import { proAuth, proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";

function signUpHref(next: string) {
  if (next === "/account") return "/sign-up";
  return `/sign-up?${new URLSearchParams({ next }).toString()}`;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const configError = searchParams.get("error") === "config";

  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    configError ? "Server is missing Supabase env vars." : null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hydrated || loading) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signError) {
        setError(signError.message);
        return;
      }
      // Full navigation so middleware + server layout see the new session cookies.
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const submitDisabled = !hydrated || loading;

  return (
    <AuthPageShell mode="login" next={next}>
      <AuthChrome subtitle={`Sign in to ${BRAND_NAME_PRO}`} showLogo={false} showTagline={false} />

      <form onSubmit={onSubmit} className={proAuth.card} noValidate={false}>
        <div>
          <label htmlFor="login-email" className={proAuth.label}>
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={proSurface.field}
          />
        </div>
        <div>
          <label htmlFor="login-password" className={proAuth.label}>
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={proSurface.field}
          />
        </div>
        {error ? (
          <p className="text-sm text-pro-warning" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className={proBtn.primaryFull} disabled={submitDisabled}>
          {!hydrated ? "Preparing…" : loading ? "Signing in…" : "Sign in"}
        </Button>
        {!hydrated ? (
          <p className="text-center text-xs text-pro-text-secondary" aria-live="polite">
            Getting sign-in ready…
          </p>
        ) : null}
      </form>

      <p className="text-center text-sm leading-relaxed text-pro-text-secondary">
        No account?{" "}
        <Link href={signUpHref(next)} className={proAuth.link}>
          Create one
        </Link>
      </p>
    </AuthPageShell>
  );
}
