import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileStripeRow = {
  id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  subscription_current_period_end: string | null;
  stripe_price_id: string | null;
  updated_at: string;
};

export async function upsertProfileStripe(
  admin: SupabaseClient,
  row: ProfileStripeRow
): Promise<void> {
  const { error } = await admin.from("profiles").upsert(row, { onConflict: "id" });
  if (error) {
    throw new Error(`profiles upsert: ${error.message}`);
  }
}
