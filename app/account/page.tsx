import { redirect } from "next/navigation";
import Link from "next/link";
import { AccountDisplayNameForm } from "@/components/account/AccountDisplayNameForm";
import { ManageBillingButton } from "@/components/account/ManageBillingButton";
import { Button } from "@/components/ui/button";
import { ProStackUnavailable } from "@/components/pro/ProStackUnavailable";
import { ProPrivateStudioBadge } from "@/components/pro/ProPrivateStudioBadge";
import { proAuth, proBtn, proWebShell } from "@/components/pro/ux/pro-surfaces";
import { headerDisplayName } from "@/lib/pro/header-user-display";
import { bootstrapDefaultProject, listProjectsForUser } from "@/lib/pro/bootstrap-default-project";
import { pickWorkspaceRedirectProject } from "@/lib/pro/pick-continue-project";
import { ensureInviteTrialEntitlement } from "@/lib/pro/entitle-invite-user";
import {
  PRO_CHECKOUT_DISABLED_ACCOUNT,
  PRO_INVITE_REQUIRED_ACCOUNT,
  PRO_MARKETING_CTA_TRIAL,
  PRO_MARKETING_PRICE,
} from "@/lib/pro/marketing-copy";
import {
  PRO_CANCEL_RETENTION_SUMMARY,
  PRO_DATA_RETENTION_DAYS,
} from "@/lib/pro/membership-policy";
import { canStartProCheckout, hasProInviteAccess } from "@/lib/pro/invite-gate";
import { isProPublicCheckoutEnabled } from "@/lib/pro/launch-flags";
import { isSupabaseConfigured } from "@/lib/pro-stack-config";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { startProCheckout } from "@/app/actions/stripe";
import { finalizeCheckoutSession } from "@/lib/stripe/finalize-checkout";

type Search = {
  session_id?: string;
  checkout?: string;
  stripe?: string;
  portal?: string;
  invite?: string;
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

  if (!isSupabaseConfigured()) {
    return <ProStackUnavailable context="account" />;
  }

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

  // Soft launch: invite cookie → auto-trial so Account always shows “Open projects”.
  await ensureInviteTrialEntitlement(user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "stripe_customer_id, stripe_subscription_id, subscription_status, subscription_current_period_end"
    )
    .eq("id", user.id)
    .maybeSingle();

  const row = profile as
    | {
        stripe_customer_id: string | null;
        stripe_subscription_id: string | null;
        subscription_status: string | null;
        subscription_current_period_end: string | null;
      }
    | null;

  const subscribed =
    row?.subscription_status === "active" || row?.subscription_status === "trialing";
  const hasCustomer = Boolean(row?.stripe_customer_id);

  let workspaceHref = "/pro/app";
  if (subscribed) {
    await bootstrapDefaultProject(supabase, user.id);
    const { projects } = await listProjectsForUser(supabase, user.id);
    const projectId = pickWorkspaceRedirectProject(projects);
    workspaceHref = projectId ? `/pro/app/workspace/${projectId}` : "/pro/app";
  }

  const displayName = headerDisplayName(user.email ?? "", user.user_metadata);

  const cancelMsg = sp.checkout === "cancel" ? "Checkout was canceled. No charge was made." : null;
  const stripeMsg = bannerForStripe(sp.stripe);
  const portalMsg =
    sp.portal === "no_customer"
      ? "Subscribe first — we need a Stripe customer before opening the billing portal."
      : null;
  const inviteUnlocked = await hasProInviteAccess();
  const checkoutEnabled = isProPublicCheckoutEnabled();
  const canCheckout = await canStartProCheckout();
  const inviteRequiredMsg =
    sp.invite === "required" || (!subscribed && !inviteUnlocked)
      ? PRO_INVITE_REQUIRED_ACCOUNT
      : null;
  const checkoutDisabledMsg =
    !subscribed &&
    inviteUnlocked &&
    (!checkoutEnabled || sp.checkout === "disabled")
      ? PRO_CHECKOUT_DISABLED_ACCOUNT
      : null;

  return (
    <div className={proAuth.page}>
      <div className={`${proAuth.shellWide} mx-auto w-full max-w-pro space-y-4`}>
        {cancelMsg ? (
          <p className="rounded-xl border border-pro-warning/40 bg-pro-warning/10 px-3 py-2 text-sm text-pro-warning">
            {cancelMsg}
          </p>
        ) : null}
        {stripeMsg ? (
          <p className="rounded-xl border border-pro-warning/40 bg-pro-warning/10 px-3 py-2 text-sm text-pro-warning">
            {stripeMsg}
          </p>
        ) : null}
        {portalMsg ? (
          <p className="rounded-xl border border-pro-warning/40 bg-pro-warning/10 px-3 py-2 text-sm text-pro-warning">
            {portalMsg}
          </p>
        ) : null}
        {inviteRequiredMsg ? (
          <p className="rounded-xl border border-pro-warning/40 bg-pro-warning/10 px-3 py-2 text-sm text-pro-warning">
            {inviteRequiredMsg}
          </p>
        ) : null}
        {checkoutDisabledMsg ? (
          <p className="rounded-xl border border-pro-warning/40 bg-pro-warning/10 px-3 py-2 text-sm text-pro-warning">
            {checkoutDisabledMsg}
          </p>
        ) : null}

        {subscribed ? (
          <div className="rounded-2xl border border-pro-primary/35 bg-pro-primary/10 px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-pro-primary">
              Your studio
            </p>
            <h2 className="mt-1 text-lg font-semibold text-pro-text sm:text-xl">
              Projects &amp; dashboard
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-pro-text-secondary">
              Open the app to create projects, run Script → Prompt, and manage your workspace.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href={workspaceHref} className={`${proBtn.secondary} inline-flex h-11 px-5`}>
                Open projects dashboard
              </Link>
              <Link href="/pro/app" className={`${proBtn.outline} inline-flex h-11 px-5`}>
                All projects
              </Link>
            </div>
          </div>
        ) : null}

        <div className={proAuth.card}>
          <h1 className={proWebShell.pageTitle}>Account</h1>
          <p className="mt-1 text-sm text-pro-text-secondary">Signed in as</p>
          <p className="mt-2 break-all text-sm font-medium text-pro-text">{user.email}</p>
          <AccountDisplayNameForm initialName={displayName} />
          <p className="mt-4 text-xs text-pro-text-secondary">User id: {user.id}</p>

          {subscribed ? (
            <div className="mt-4">
              <ProPrivateStudioBadge />
            </div>
          ) : null}

          <div className="mt-6 border-t border-white/[0.06] pt-6">
            <h2 className="text-sm font-semibold text-pro-text">35mmAiPro billing</h2>
            <p className="mt-1 text-xs text-pro-text-secondary">
              {subscribed
                ? "Studio access is on — cloud projects, save, and prompt pack export. AI assist is separate (flag + quota)."
                : checkoutEnabled
                  ? `${PRO_MARKETING_PRICE.valueProp}. ${PRO_MARKETING_PRICE.trialThenLabel}. ${PRO_MARKETING_PRICE.checkoutNote} Use test card 4242… in Checkout when in Stripe test/sandbox.`
                  : "Soft launch: card Checkout is off. Studio access is granted from the invite allowlist — not a Stripe trial."}
            </p>
            {row?.subscription_status ? (
              <p className="mt-2 text-xs text-pro-text-secondary">
                Stripe status:{" "}
                <span className="font-mono text-pro-text">{row.subscription_status}</span>
              </p>
            ) : null}
            {row?.subscription_current_period_end ? (
              <p className="mt-1 text-xs text-pro-text-secondary">
                Current period ends:{" "}
                <span className="font-mono text-pro-text">
                  {new Date(row.subscription_current_period_end).toLocaleString()}
                </span>
              </p>
            ) : null}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {!subscribed && canCheckout ? (
                <form action={startProCheckout}>
                  <Button type="submit" variant="secondary" className={proBtn.secondary}>
                    {PRO_MARKETING_CTA_TRIAL}
                  </Button>
                </form>
              ) : null}
              {hasCustomer ? <ManageBillingButton /> : null}
            </div>
            <div className={`mt-4 ${proAuth.cardInner}`}>
              <p className="text-xs font-medium text-pro-text">If you cancel</p>
              <p className="mt-1 text-xs leading-relaxed text-pro-text-secondary">
                {PRO_CANCEL_RETENTION_SUMMARY}
              </p>
              <p className="mt-2 text-xs text-pro-text-secondary">
                Retention window: {PRO_DATA_RETENTION_DAYS} days after access ends.
              </p>
            </div>
          </div>

          <form action={signOut} className="mt-6">
            <Button type="submit" variant="outline" className={proBtn.outline}>
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
