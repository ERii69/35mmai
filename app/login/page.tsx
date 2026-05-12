"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  const configError = searchParams.get("error") === "config";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(configError ? "Server is missing Supabase env vars." : null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-extrabold tracking-widest text-white">
            <span className="text-[#e11d48]">35</span>mm<span className="text-[#e11d48]">AI</span>
          </Link>
          <p className="mt-3 text-sm text-zinc-400">Sign in to 35mmPRO</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm text-zinc-400">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-[#e11d48]/30 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm text-zinc-400">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-[#e11d48]/30 focus:ring-2"
            />
          </div>
          {error ? (
            <p className="text-sm text-amber-400" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full bg-[#e11d48] hover:bg-[#c91840]" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          No account?{" "}
          <Link href="/sign-up" className="font-medium text-[#e11d48] underline-offset-2 hover:underline">
            Create one
          </Link>
        </p>
        <p className="text-center text-sm">
          <Link href="/" className="text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline">
            ← Home
          </Link>
        </p>
      </div>
    </div>
  );
}
