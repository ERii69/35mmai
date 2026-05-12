"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
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
        router.push("/account");
        router.refresh();
        return;
      }
      setMessage("Check your email for a confirmation link, then sign in.");
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
          <p className="mt-3 text-sm text-zinc-400">Create a 35mmPRO account</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div>
            <label htmlFor="signup-email" className="mb-1.5 block text-sm text-zinc-400">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-[#e11d48]/30 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="mb-1.5 block text-sm text-zinc-400">
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
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-[#e11d48]/30 focus:ring-2"
            />
            <p className="mt-1 text-xs text-zinc-500">At least 8 characters.</p>
          </div>
          {error ? (
            <p className="text-sm text-amber-400" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="text-sm text-emerald-400" role="status">
              {message}
            </p>
          ) : null}
          <Button type="submit" className="w-full bg-[#e11d48] hover:bg-[#c91840]" disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#e11d48] underline-offset-2 hover:underline">
            Sign in
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
