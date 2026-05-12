import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export const metadata = {
  title: "Account — 35mmAI",
  description: "Your 35mmAI account",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100">
      <div className="mx-auto max-w-md space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-extrabold tracking-widest text-white">
            <span className="text-[#e11d48]">35</span>mm<span className="text-[#e11d48]">AI</span>
          </Link>
          <Link href="/pro" className="text-sm text-zinc-400 hover:text-[#e11d48]">
            Pro
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h1 className="text-lg font-semibold text-white">Account</h1>
          <p className="mt-1 text-sm text-zinc-400">Signed in as</p>
          <p className="mt-2 break-all font-mono text-sm text-zinc-200">{user.email}</p>
          <p className="mt-1 text-xs text-zinc-500">User id: {user.id}</p>

          <form action={signOut} className="mt-6">
            <Button type="submit" variant="outline" className="border-zinc-600 text-zinc-200 hover:bg-zinc-800">
              Sign out
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500">
          <Link href="/" className="underline-offset-2 hover:text-zinc-300 hover:underline">
            ← Home
          </Link>
        </p>
      </div>
    </div>
  );
}
