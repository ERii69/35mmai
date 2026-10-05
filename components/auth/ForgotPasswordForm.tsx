"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthChrome } from "@/components/auth/AuthChrome";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/app/actions/password-reset";
import { proAuth, proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const linkFailed = searchParams.get("error") === "link";
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(
    linkFailed ? "That link expired or was already used. Request a new one." : null
  );
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await requestPasswordReset(email.trim(), window.location.origin);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell mode="login">
      <AuthChrome subtitle="Choose a new password" showLogo={false} showTagline={false} />
      {sent ? (
        <div className={proAuth.card}>
          <p className="text-sm leading-relaxed text-pro-text-secondary">
            Check {email.trim()} for the reset email. Open that link in this same browser.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className={proAuth.card}>
          <p className="text-sm leading-relaxed text-pro-text-secondary">
            Enter the email on your account. We will send a link to set a new password.
          </p>
          <div>
            <label htmlFor="forgot-email" className={proAuth.label}>
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={proSurface.field}
            />
          </div>
          {error ? (
            <p className="text-sm text-pro-warning" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className={proBtn.primaryFull} disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
      <p className="text-center text-sm text-pro-text-secondary">
        <Link href="/login" className={proAuth.link}>
          Back to sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
