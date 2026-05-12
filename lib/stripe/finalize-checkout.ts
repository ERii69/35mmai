import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { upsertProfileStripe } from "@/lib/stripe/profile-upsert";
import type Stripe from "stripe";

/**
 * After Checkout redirect, persist Stripe customer + subscription ids for this user.
 * Webhooks (`checkout.session.completed`, `customer.subscription.*`) keep rows authoritative.
 */
export async function finalizeCheckoutSession(sessionId: string, userId: string): Promise<void> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"],
  });

  const metaUid = session.metadata?.supabase_user_id;
  if (!metaUid || metaUid !== userId) {
    throw new Error("Checkout session does not belong to this account.");
  }

  const customerId = resolveCustomerId(session.customer);
  if (!customerId) {
    throw new Error("No Stripe customer on checkout session.");
  }

  const subId = resolveSubscriptionId(session.subscription);
  if (!subId) {
    throw new Error("No subscription on checkout session.");
  }

  const sub = (await stripe.subscriptions.retrieve(subId)) as {
    id: string;
    status: string;
    current_period_end?: number | null;
    items: { data: Array<{ price?: { id?: string } | null }> };
  };

  const admin = createAdminClient();
  await upsertProfileStripe(admin, {
    id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    subscription_status: sub.status,
    subscription_current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    stripe_price_id: sub.items.data[0]?.price?.id ?? null,
    updated_at: new Date().toISOString(),
  });
}

function resolveCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): string | null {
  if (typeof customer === "string") return customer;
  if (customer && "deleted" in customer && customer.deleted) return null;
  if (customer && "id" in customer) return customer.id;
  return null;
}

function resolveSubscriptionId(
  sub: string | Stripe.Subscription | null
): string | null {
  if (typeof sub === "string") return sub;
  if (sub && "id" in sub) return sub.id;
  return null;
}
