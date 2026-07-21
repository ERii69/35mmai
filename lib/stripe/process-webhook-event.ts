import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { upsertProfileStripe } from "@/lib/stripe/profile-upsert";
import { subscriptionCurrentPeriodEndIso } from "@/lib/stripe/subscription-period-end";

function priceIdFromSubscription(sub: Stripe.Subscription): string | null {
  const price = sub.items?.data?.[0]?.price;
  if (typeof price === "string") return price;
  if (price && typeof price === "object" && "id" in price) return price.id;
  return null;
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

  const sub = await stripe.subscriptions.retrieve(subId, {
    expand: ["items.data.price"],
  });

  await upsertProfileStripe(admin, {
    id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    subscription_status: sub.status,
    subscription_current_period_end: subscriptionCurrentPeriodEndIso(sub),
    stripe_price_id: priceIdFromSubscription(sub),
    updated_at: new Date().toISOString(),
  });
}

async function onSubscriptionChange(
  subFromEvent: Stripe.Subscription,
  stripe: Stripe,
  admin: SupabaseClient
): Promise<void> {
  /** Webhook payloads can omit nested item fields; always load the canonical object from the API. */
  const sub = await stripe.subscriptions.retrieve(subFromEvent.id, {
    expand: ["items.data.price"],
  });

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
    subscription_current_period_end: subscriptionCurrentPeriodEndIso(sub),
    stripe_price_id: priceIdFromSubscription(sub),
    updated_at: new Date().toISOString(),
  });
}

/**
 * Customer Portal billing / address saves often emit `customer.updated` without a
 * `customer.subscription.updated` event. Re-load the linked subscription so period end stays fresh.
 */
async function onCustomerUpdated(
  customer: Stripe.Customer | Stripe.DeletedCustomer,
  stripe: Stripe,
  admin: SupabaseClient
): Promise<void> {
  if ("deleted" in customer && customer.deleted) return;
  const customerId = customer.id;

  const { data: profile } = await admin
    .from("profiles")
    .select("id, stripe_subscription_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile?.id || !profile.stripe_subscription_id) return;

  const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id, {
    expand: ["items.data.price"],
  });

  await upsertProfileStripe(admin, {
    id: profile.id,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    subscription_status: sub.status,
    subscription_current_period_end: subscriptionCurrentPeriodEndIso(sub),
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
      await onSubscriptionChange(event.data.object as Stripe.Subscription, stripe, admin);
      break;
    case "customer.updated":
      await onCustomerUpdated(event.data.object as Stripe.Customer, stripe, admin);
      break;
    default:
      break;
  }
}
