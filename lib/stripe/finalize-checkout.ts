import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

/**
 * After Checkout redirect, persist Stripe customer + subscription ids for this user.
 * Task 4 webhooks will keep rows authoritative; this bridges until then.
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

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer as Stripe.Customer | Stripe.DeletedCustomer | null)?.id;
  if (!customerId) {
    throw new Error("No Stripe customer on checkout session.");
  }

  let subscriptionId: string | null = null;
  let subscriptionStatus: string | null = null;
  const sub = session.subscription;
  if (typeof sub === "string") {
    subscriptionId = sub;
    const full = await stripe.subscriptions.retrieve(sub);
    subscriptionStatus = full.status;
  } else if (sub && typeof sub === "object" && "id" in sub) {
    subscriptionId = sub.id;
    subscriptionStatus = sub.status;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: subscriptionStatus,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}
