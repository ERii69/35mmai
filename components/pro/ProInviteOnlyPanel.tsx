"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitProWaitlist, type ProWaitlistState } from "@/app/actions/waitlist";
import { SITE_CONTACT_EMAIL } from "@/app/data";
import { proMarketing } from "@/components/pro/pro-marketing-surfaces";
import { proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";
import {
  PRO_INVITE_INVALID,
  PRO_INVITE_ONLY_BODY,
  PRO_INVITE_ONLY_EYEBROW,
  PRO_INVITE_ONLY_HEADLINE,
} from "@/lib/pro/marketing-copy";

type Props = {
  invalidInvite?: boolean;
  className?: string;
  sectionId?: string;
};

const initial: ProWaitlistState = { status: "idle" };

/** Soft-launch gate — no public trial CTA; waitlist until invite cookie is set. */
export function ProInviteOnlyPanel({ invalidInvite = false, className, sectionId }: Props) {
  const [state, formAction, isPending] = useActionState(submitProWaitlist, initial);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const mailtoHref = useMemo(() => {
    if (state.status !== "success" || state.persisted || !email.trim()) return "";
    const subject = encodeURIComponent("35mmAiPro — waitlist");
    const body = encodeURIComponent(
      `Please add me to the 35mmAiPro waitlist.\n\nMy email: ${email.trim()}\n` +
        (note.trim() ? `\nNote: ${note.trim()}\n` : "\n")
    );
    return `mailto:${SITE_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }, [state, email, note]);

  return (
    <section
      id={sectionId}
      className={`${proMarketing.proPanel} ${className ?? ""}`}
      aria-labelledby="pro-invite-only-heading"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-pro-primary">
        {PRO_INVITE_ONLY_EYEBROW}
      </p>
      <h2 id="pro-invite-only-heading" className="mt-2 text-2xl font-bold tracking-tight text-pro-text">
        {PRO_INVITE_ONLY_HEADLINE}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-pro-text-secondary">{PRO_INVITE_ONLY_BODY}</p>
      {invalidInvite ? (
        <p
          className="mt-3 rounded-lg border border-pro-warning/30 bg-pro-warning/10 px-3 py-2 text-sm text-pro-warning"
          role="alert"
        >
          {PRO_INVITE_INVALID}
        </p>
      ) : null}

      <div className="mt-6 border-t border-white/[0.06] pt-5">
        <p className="text-sm font-medium text-pro-text">Want an invite?</p>
        <p className="mt-1 text-xs text-pro-text-secondary">
          Join the waitlist — we&apos;re onboarding filmmakers in small batches.
        </p>

        {state.status === "success" ? (
          <div className="mt-4 rounded-xl bg-pro-success/10 px-3 py-3 text-sm text-pro-text ring-1 ring-pro-success/25">
            <p className="font-medium">You&apos;re on the list.</p>
            {!state.persisted && mailtoHref ? (
              <a
                href={mailtoHref}
                className="mt-2 inline-flex items-center gap-1.5 text-pro-primary underline-offset-2 hover:underline"
              >
                <Mail className="size-3.5" aria-hidden />
                Send a quick email to confirm
              </a>
            ) : (
              <p className="mt-1 text-xs text-pro-text-secondary">We&apos;ll reach out when a spot opens.</p>
            )}
          </div>
        ) : (
          <form action={formAction} className="mt-4 space-y-3">
            <div>
              <label htmlFor="pro-invite-waitlist-email" className="mb-1 block text-xs text-pro-text-secondary">
                Email
              </label>
              <input
                id="pro-invite-waitlist-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={proSurface.field}
              />
            </div>
            <div>
              <label htmlFor="pro-invite-waitlist-note" className="mb-1 block text-xs text-pro-text-secondary">
                Optional note
              </label>
              <input
                id="pro-invite-waitlist-note"
                name="note"
                type="text"
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Short film, commercial, indie…"
                className={proSurface.field}
              />
            </div>
            {state.status === "error" ? (
              <p className="text-sm text-pro-warning" role="alert">
                {state.message}
              </p>
            ) : null}
            <Button type="submit" disabled={isPending} className={proBtn.primary}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Submitting…
                </>
              ) : (
                "Join the waitlist"
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
