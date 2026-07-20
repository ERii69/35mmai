/**
 * Detect whether optional 35mmAiPro backend env is present.
 * Used so catalog-only deploys on `main` (no Supabase/Stripe) stay healthy per PRD §4.9.
 */

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_PRICE_ID_PRO_MONTHLY?.trim() &&
      process.env.NEXT_PUBLIC_APP_URL?.trim()
  );
}

/** Supabase + Stripe — required for subscribe, workspace, and exports. */
export function isProStackConfigured(): boolean {
  return isSupabaseConfigured() && isStripeConfigured();
}

/** Server-side Anthropic key — enables native Director's Agent (Phase 2). */
export function isClaudeAgentsStackConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export const PRO_STACK_ENV_HINT =
  "Add Supabase + Stripe keys from .env.example to .env.local (or Vercel env) to enable 35mmAiPro.";
