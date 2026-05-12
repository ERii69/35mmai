import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { processStripeWebhookEvent } from "@/lib/stripe/process-webhook-event";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("stripe webhook: STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "webhook secret not configured" }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "invalid payload";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error("stripe webhook: admin client", e);
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }

  const { data: seen } = await admin
    .from("stripe_events_processed")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (seen?.event_id) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await processStripeWebhookEvent(event, getStripe(), admin);
  } catch (e) {
    console.error("stripe webhook handler failed", event.type, e);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  const { error: recErr } = await admin.from("stripe_events_processed").insert({ event_id: event.id });
  if (recErr && recErr.code !== "23505") {
    console.error("stripe_events_processed insert", recErr);
    return NextResponse.json({ error: "could not record event" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
