import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}

export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL");
  }
  return url.replace(/\/$/, "");
}

export function getProMonthlyPriceId(): string {
  const id = process.env.STRIPE_PRICE_ID_PRO_MONTHLY?.trim();
  if (!id) {
    throw new Error("Missing STRIPE_PRICE_ID_PRO_MONTHLY");
  }
  return id;
}
