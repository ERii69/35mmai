import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { upsertProfileStripe } from "@/lib/stripe/profile-upsert";

/** Shape we read from Stripe subscription objects (API 2024+ typings omit some fields). */
type SubscriptionLike = {
  id: string;
  status: string;
  customer: string | Stripe.Customer | Stripe.DeletedCustomer;
  metadata?: Stripe.Metadata | null;
  current_period_end?: number | null;
  items: { data: Array<{ price?: { id?: string } | null }> };
};

function periodEndIso(sub: SubscriptionLike): string | null {
  if (!sub.current_period_end) return null;
  return new Date(sub.current_period_end * 1000).toISOString();
}

function priceIdFromSubscription(sub: SubscriptionLike): string | null {
  return sub.items.data[0]?.price?.id ?? null;
}

async function onCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  admin: SupabaseClient
): Promise<void> {
  if (session.mode !== "subscription") return;

  const userId = session.metadata?.supabase_user_id ?? session.client_reference_id ?? undefined;
  if (!userId) return;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer && "deleted" in session.customer && session.customer.deleted
        ? null
        : session.customer && "id" in session.customer
          ? session.customer.id
          : null;
  if (!customerId) return;

  const subRef = session.subscription;
  const subId = typeof subRef === "string" ? subRef : subRef && "id" in subRef ? subRef.id : null;
  if (!subId) return;

  const sub = (await stripe.subscriptions.retrieve(subId)) as SubscriptionLike;

  await upsertProfileStripe(admin, {
    id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    subscription_status: sub.status,
    subscription_current_period_end: periodEndIso(sub),
    stripe_price_id: priceIdFromSubscription(sub),
    updated_at: new Date().toISOString(),
  });
}

async function onSubscriptionChange(sub: SubscriptionLike, admin: SupabaseClient): Promise<void> {
  const customerId =
    typeof sub.customer === "string"
      ? sub.customer
      : sub.customer && "deleted" in sub.customer && sub.customer.deleted
        ? null
        : sub.customer && "id" in sub.customer
          ? sub.customer.id
          : null;
  if (!customerId) return;

  let userId = sub.metadata?.supabase_user_id ?? null;
  if (!userId) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = profile?.id ?? null;
  }
  if (!userId) return;

  await upsertProfileStripe(admin, {
    id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    subscription_status: sub.status,
    subscription_current_period_end: periodEndIso(sub),
    stripe_price_id: priceIdFromSubscription(sub),
    updated_at: new Date().toISOString(),
  });
}

export async function processStripeWebhookEvent(
  event: Stripe.Event,
  stripe: Stripe,
  admin: SupabaseClient
): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await onCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, stripe, admin);
      break;
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await onSubscriptionChange(event.data.object as SubscriptionLike, admin);
      break;
    default:
      break;
  }
}
