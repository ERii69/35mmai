import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col justify-center gap-6 px-4 text-center text-zinc-100">
      <h1 className="text-xl font-semibold">Sign-in link problem</h1>
      <p className="text-sm text-zinc-400">
        This link may have expired, already been used, or opened in a different browser than the one
        that requested it. Request a new link and open it in the same browser — or sign in with a
        password.
      </p>
      <div className="flex flex-col items-center gap-3 text-sm">
        <Link
          href="/pro/invite/accept?next=/pro/app"
          className="font-medium text-[#e11d48] underline-offset-4 hover:underline"
        >
          Request a new sign-in link
        </Link>
        <Link href="/login?next=/pro/app" className="text-zinc-400 underline-offset-4 hover:underline">
          Sign in with password
        </Link>
      </div>
    </div>
  );
}
