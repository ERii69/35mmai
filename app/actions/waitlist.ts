"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Pro waitlist: persist first, then send a best-effort private Resend notification.
 * The browser never receives the notification address or Resend credentials.
 */
export type ProWaitlistState =
  | { status: "idle" }
  | { status: "success"; persisted: boolean }
  | { status: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCE = "35mmai-pro";

async function sendWaitlistNotification(email: string, requestedAt: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.PRO_WAITLIST_NOTIFY_EMAIL?.trim();
  const from = process.env.PRO_WAITLIST_FROM_EMAIL?.trim();
  if (!apiKey || !to || !from) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: "35mmAiPro private beta access request",
        text: `A filmmaker requested 35mmAiPro access.\n\nEmail: ${email}\nRequested: ${requestedAt}\n`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function submitProWaitlist(
  _prev: ProWaitlistState,
  formData: FormData
): Promise<ProWaitlistState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const note = String(formData.get("note") ?? "")
    .trim()
    .slice(0, 500);
  const website = String(formData.get("website") ?? "").trim();

  // Honeypot: report success without storing or notifying bots.
  if (website) return { status: "success", persisted: true };

  if (!email) {
    return { status: "error", message: "Please enter your email." };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  try {
    const admin = createAdminClient();
    const requestedAt = new Date().toISOString();
    const { data, error } = await admin
      .from("pro_waitlist_requests")
      .insert({
        email,
        note: note || null,
        source: SOURCE,
        requested_at: requestedAt,
      })
      .select("id")
      .single();

    // Repeated requests remain successful without duplicate rows or notifications.
    if (error?.code === "23505") {
      return { status: "success", persisted: true };
    }
    if (error || !data?.id) {
      console.error("[submitProWaitlist]", error?.message ?? "Insert returned no row");
      return {
        status: "error",
        message: "Could not submit right now. Please try again shortly.",
      };
    }

    if (await sendWaitlistNotification(email, requestedAt)) {
      await admin
        .from("pro_waitlist_requests")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", data.id);
    }

    return { status: "success", persisted: true };
  } catch (error) {
    console.error(
      "[submitProWaitlist]",
      error instanceof Error ? error.message : "Unknown request error"
    );
    return {
      status: "error",
      message: "Could not submit right now. Please try again shortly.",
    };
  }
}
