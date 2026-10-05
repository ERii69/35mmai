"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthChrome } from "@/components/auth/AuthChrome";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/PasswordField";
import { proAuth, proBtn } from "@/components/pro/ux/pro-surfaces";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD = 8;

export function UpdatePasswordForm() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    function apply(session: { user: { id: string } } | null) {
      if (!active) return;
      setSignedIn(Boolean(session));
      setReady(true);
    }

    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session));

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      window.location.assign("/pro/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the password.");
      setLoading(false);
    }
  }

  return (
    <AuthPageShell mode="login">
      <AuthChrome subtitle="Set a new password" showLogo={false} showTagline={false} />
      {!ready ? (
        <p className="text-center text-sm text-pro-text-secondary">Checking your sign-in link…</p>
      ) : signedIn ? (
        <form onSubmit={onSubmit} className={proAuth.card}>
          <PasswordField
            id="new-password"
            label="New password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD}
            value={password}
            onChange={setPassword}
          />
          <PasswordField
            id="confirm-password"
            label="Confirm password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD}
            value={confirm}
            onChange={setConfirm}
          />
          {error ? (
            <p className="text-sm text-pro-warning" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className={proBtn.primaryFull} disabled={loading}>
            {loading ? "Saving…" : "Save password"}
          </Button>
        </form>
      ) : (
        <div className={`${proAuth.card} space-y-3 text-sm text-pro-text-secondary`}>
          <p>This page needs the link from your email. Request a new one if it expired.</p>
          <Link href="/auth/forgot-password" className={proAuth.link}>
            Send a reset link
          </Link>
        </div>
      )}
    </AuthPageShell>
  );
}
