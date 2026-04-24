"use server";

/**
 * Pro waitlist: validates input and optionally POSTs JSON to `PRO_WAITLIST_WEBHOOK_URL`
 * (e.g. Zapier, Make, Slack incoming webhook, or your own API). If unset, the UI still
 * succeeds and offers a one-tap mailto fallback with the address pre-filled.
 */
export type ProWaitlistState =
  | { status: "idle" }
  | { status: "success"; persisted: boolean }
  | { status: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitProWaitlist(
  _prev: ProWaitlistState,
  formData: FormData
): Promise<ProWaitlistState> {
  const email = String(formData.get("email") ?? "").trim();
  const note = String(formData.get("note") ?? "")
    .trim()
    .slice(0, 500);
  if (!email) {
    return { status: "error", message: "Please enter your email." };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const webhook = process.env.PRO_WAITLIST_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          note: note || undefined,
          source: "35mmai-pro-waitlist",
          submittedAt: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        return {
          status: "error",
          message: "Could not submit right now. Please try again shortly.",
        };
      }
      return { status: "success", persisted: true };
    } catch {
      return {
        status: "error",
        message: "Could not submit right now. Please try again shortly.",
      };
    }
  }

  return { status: "success", persisted: false };
}
