/**
 * Soft-launch / kill-switch flags.
 * Deploy order: Local → Preview → Production.
 */

function envFlagTrue(name: string): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

function envFlagFalse(name: string): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  return raw === "0" || raw === "false" || raw === "no";
}

/**
 * Stripe Subscribe / Start trial CTAs + startProCheckout.
 * Soft launch: PRO_PUBLIC_CHECKOUT=0 (invite allowlist — ignore Stripe trial).
 * Live: PRO_PUBLIC_CHECKOUT=1.
 * Unset → enabled (backward compatible).
 */
export function isProPublicCheckoutEnabled(): boolean {
  if (envFlagFalse("PRO_PUBLIC_CHECKOUT")) return false;
  if (envFlagTrue("PRO_PUBLIC_CHECKOUT")) return true;
  return true;
}

/** True when Anthropic API key is present (does not enable agents alone). */
export function isAnthropicKeyConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

/**
 * Native Director agents / cloud AI assist.
 * Soft launch: PRO_AGENTS_ENABLED=0 (or unset) → local quick prep only, even if a key exists.
 * On: PRO_AGENTS_ENABLED=1|true|yes AND ANTHROPIC_API_KEY set.
 */
export function areProAgentsEnabled(): boolean {
  if (envFlagFalse("PRO_AGENTS_ENABLED")) return false;
  if (!envFlagTrue("PRO_AGENTS_ENABLED")) return false;
  return isAnthropicKeyConfigured();
}

/** Waitlist webhook configured (Zapier / Make / Slack). */
export function isProWaitlistWebhookConfigured(): boolean {
  return Boolean(process.env.PRO_WAITLIST_WEBHOOK_URL?.trim());
}
