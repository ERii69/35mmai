import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { openCustomerPortal, startProCheckout } from "@/app/actions/stripe";
import { finalizeCheckoutSession } from "@/lib/stripe/finalize-checkout";

type Search = {
  session_id?: string;
  checkout?: string;
  stripe?: string;
  portal?: string;
};

function bannerForStripe(code: string | undefined): string | null {
  if (!code) return null;
  const map: Record<string, string> = {
    missing_price: "Stripe is not configured: add STRIPE_PRICE_ID_PRO_MONTHLY to .env.local.",
    missing_secret: "Stripe is not configured: add STRIPE_SECRET_KEY to .env.local.",
    missing_app_url: "Add NEXT_PUBLIC_APP_URL to .env.local (e.g. http://localhost:3000).",
    no_session_url: "Checkout did not return a URL. Check Stripe Dashboard logs.",
    sync_failed: "Could not confirm checkout. Try again or contact support.",
  };
  return map[code] ?? `Something went wrong (${code}).`;
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  if (sp.session_id) {
    try {
      await finalizeCheckoutSession(sp.session_id, user.id);
    } catch {
      redirect("/account?stripe=sync_failed");
    }
    redirect("/account");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, stripe_subscription_id, subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  const row = profile as
    | {
        stripe_customer_id: string | null;
        stripe_subscription_id: string | null;
        subscription_status: string | null;
      }
    | null;

  const subscribed =
    row?.subscription_status === "active" || row?.subscription_status === "trialing";
  const hasCustomer = Boolean(row?.stripe_customer_id);

  const cancelMsg = sp.checkout === "cancel" ? "Checkout was canceled. No charge was made." : null;
  const stripeMsg = bannerForStripe(sp.stripe);
  const portalMsg =
    sp.portal === "no_customer"
      ? "Subscribe first — we need a Stripe customer before opening the billing portal."
      : null;

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

        {cancelMsg ? (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {cancelMsg}
          </p>
        ) : null}
        {stripeMsg ? (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {stripeMsg}
          </p>
        ) : null}
        {portalMsg ? (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {portalMsg}
          </p>
        ) : null}

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h1 className="text-lg font-semibold text-white">Account</h1>
          <p className="mt-1 text-sm text-zinc-400">Signed in as</p>
          <p className="mt-2 break-all font-mono text-sm text-zinc-200">{user.email}</p>
          <p className="mt-1 text-xs text-zinc-500">User id: {user.id}</p>

          <div className="mt-6 border-t border-zinc-800 pt-6">
            <h2 className="text-sm font-semibold text-zinc-200">35mmPRO billing</h2>
            <p className="mt-1 text-xs text-zinc-500">
              {subscribed
                ? "Subscription is active (sandbox or live, depending on your Stripe keys)."
                : "Subscribe for monthly access. Use test card 4242… in Checkout when in Stripe test/sandbox."}
            </p>
            {row?.subscription_status ? (
              <p className="mt-2 text-xs text-zinc-400">
                Stripe status: <span className="font-mono text-zinc-300">{row.subscription_status}</span>
              </p>
            ) : null}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {!subscribed ? (
                <form action={startProCheckout}>
                  <Button type="submit" className="bg-[#e11d48] hover:bg-[#c91840]">
                    Subscribe to 35mmPRO
                  </Button>
                </form>
              ) : null}
              {hasCustomer ? (
                <form action={openCustomerPortal}>
                  <Button type="submit" variant="outline" className="border-zinc-600 text-zinc-200 hover:bg-zinc-800">
                    Manage billing
                  </Button>
                </form>
              ) : null}
            </div>
          </div>

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
