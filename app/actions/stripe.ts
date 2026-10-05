"use server";

import type Stripe from "stripe";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canStartProCheckout } from "@/lib/pro/invite-gate";
import { isProPublicCheckoutEnabled } from "@/lib/pro/launch-flags";
import { getAppUrl, getProMonthlyPriceId, getStripe } from "@/lib/stripe";
import { getProSubscriptionTrialDays } from "@/lib/pro/subscription-trial";

const CHECKOUT_RETURN_ORIGINS = new Set([
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "https://www.35mmai.com",
  "https://35mmai.com",
]);

/** Send Stripe back to the host the user is actually on, so the login cookie still matches. */
async function checkoutReturnBase(): Promise<string> {
  const configured = getAppUrl();
  const h = await headers();
  const origin = h.get("origin")?.trim() ?? "";
  if (CHECKOUT_RETURN_ORIGINS.has(origin)) return origin;
  const referer = h.get("referer")?.trim() ?? "";
  try {
    const url = new URL(referer);
    if (CHECKOUT_RETURN_ORIGINS.has(url.origin)) return url.origin;
  } catch {
    /* fall back to the configured app URL */
  }
  return configured;
}

export async function startProCheckout() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    redirect("/login?next=/account");
  }

  if (!isProPublicCheckoutEnabled()) {
    redirect("/account?checkout=disabled");
  }

  if (!(await canStartProCheckout())) {
    redirect("/account?invite=required");
  }

  let priceId: string;
  try {
    priceId = getProMonthlyPriceId();
  } catch {
    redirect("/account?stripe=missing_price");
  }

  let stripe: ReturnType<typeof getStripe>;
  try {
    stripe = getStripe();
  } catch {
    redirect("/account?stripe=missing_secret");
  }

  let base: string;
  try {
    base = await checkoutReturnBase();
  } catch {
    redirect("/account?stripe=missing_app_url");
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const existingCustomerId = existing?.stripe_customer_id as string | undefined;

  const trialDays = getProSubscriptionTrialDays();
  const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
    metadata: { supabase_user_id: user.id },
  };
  if (trialDays > 0) {
    subscriptionData.trial_period_days = trialDays;
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id },
    subscription_data: subscriptionData,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/account?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/account?checkout=cancel`,
    allow_promotion_codes: true,
  };

  if (existingCustomerId) {
    sessionParams.customer = existingCustomerId;
  } else {
    sessionParams.customer_email = user.email;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    redirect("/account?stripe=no_session_url");
  }
  redirect(session.url);
}

async function createCustomerPortalUrl(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const customerId = profile?.stripe_customer_id as string | undefined;
  if (!customerId) {
    return null;
  }

  let stripe: ReturnType<typeof getStripe>;
  let base: string;
  try {
    stripe = getStripe();
  } catch {
    return null;
  }
  try {
    base = await checkoutReturnBase();
  } catch {
    return null;
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${base}/account`,
  });
  return portal.url ?? null;
}

/** Opens Stripe billing portal in a new tab (client-side). */
export async function getCustomerPortalUrl(): Promise<
  { url: string } | { error: "unauthenticated" | "no_customer" | "stripe_config" }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "unauthenticated" };
  }

  const url = await createCustomerPortalUrl();
  if (!url) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.stripe_customer_id) {
      return { error: "no_customer" };
    }
    return { error: "stripe_config" };
  }

  return { url };
}

export async function openCustomerPortal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  const url = await createCustomerPortalUrl();
  if (!url) {
    redirect("/account?portal=no_customer");
  }
  redirect(url);
}
