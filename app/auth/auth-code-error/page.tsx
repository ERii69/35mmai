import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col justify-center gap-6 px-4 text-center text-zinc-100">
      <h1 className="text-xl font-semibold">Sign-in link problem</h1>
      <p className="text-sm text-zinc-400">
        This link may have expired or already been used. Request a new sign-in link or try email and password.
      </p>
      <Link
        href="/login"
        className="text-sm font-medium text-[#e11d48] underline-offset-4 hover:underline"
      >
        Back to sign in
      </Link>
    </div>
  );
}
