"use server";

import type Stripe from "stripe";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl, getProMonthlyPriceId, getStripe } from "@/lib/stripe";

export async function startProCheckout() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    redirect("/login?next=/account");
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
    base = getAppUrl();
  } catch {
    redirect("/account?stripe=missing_app_url");
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const existingCustomerId = existing?.stripe_customer_id as string | undefined;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id },
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
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

export async function openCustomerPortal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const customerId = profile?.stripe_customer_id as string | undefined;
  if (!customerId) {
    redirect("/account?portal=no_customer");
  }

  let stripe: ReturnType<typeof getStripe>;
  let base: string;
  try {
    stripe = getStripe();
  } catch {
    redirect("/account?stripe=missing_secret");
  }
  try {
    base = getAppUrl();
  } catch {
    redirect("/account?stripe=missing_app_url");
  }
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${base}/account`,
  });
  redirect(portal.url);
}
