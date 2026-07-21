"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { submitProWaitlist, type ProWaitlistState } from "@/app/actions/waitlist";
import { SITE_CONTACT_EMAIL } from "@/app/data";
import { proMarketing } from "@/components/pro/pro-marketing-surfaces";
import { proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";
import {
  PRO_INVITE_INVALID,
  PRO_INVITE_ONLY_EYEBROW,
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

  const mailtoHref = useMemo(() => {
    if (state.status !== "success" || state.persisted || !email.trim()) return "";
    const subject = encodeURIComponent("35mmAiPro — waitlist");
    const body = encodeURIComponent(
      `Please add me to the 35mmAiPro waitlist.\n\nMy email: ${email.trim()}\n`
    );
    return `mailto:${SITE_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }, [state, email]);

  return (
    <section
      id={sectionId}
      className={`${proMarketing.proPanel} ${className ?? ""}`}
      aria-labelledby="pro-invite-only-heading"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-pro-text-secondary">
        {PRO_INVITE_ONLY_EYEBROW}
      </p>
      <h2 id="pro-invite-only-heading" className="mt-2 text-xl font-bold tracking-tight text-pro-text sm:text-2xl">
        Request private beta access
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-pro-text-secondary">
        We&apos;re inviting filmmakers in small batches. Leave your email and we&apos;ll contact you
        when a place opens.
      </p>
      {invalidInvite ? (
        <p
          className="mt-3 rounded-lg border border-pro-warning/30 bg-pro-warning/10 px-3 py-2 text-sm text-pro-warning"
          role="alert"
        >
          {PRO_INVITE_INVALID}
        </p>
      ) : null}

      <div className="mt-5">
        {state.status === "success" ? (
          <div className="rounded-xl bg-pro-success/10 px-3 py-3 text-sm text-pro-text ring-1 ring-pro-success/25">
            {!state.persisted && mailtoHref ? (
              <>
                <p className="font-medium">Finish your request in email</p>
                <p className="mt-1 text-xs text-pro-text-secondary">
                  We&apos;ll prepare an email to our soft-launch inbox. Review it, then press Send.
                </p>
                <a href={mailtoHref} className={`${proBtn.primaryFull} mt-3`}>
                  <Mail className="size-4" aria-hidden />
                  Open email request
                </a>
              </>
            ) : (
              <>
                <p className="font-medium">Request received.</p>
                <p className="mt-1 text-xs text-pro-text-secondary">
                  We&apos;ll reach out when a spot opens.
                </p>
              </>
            )}
          </div>
        ) : (
          <form action={formAction} className="space-y-3">
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
            {state.status === "error" ? (
              <p className="text-sm text-pro-warning" role="alert">
                {state.message}
              </p>
            ) : null}
            <button type="submit" disabled={isPending} className={proBtn.primaryFull}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Submitting…
                </>
              ) : (
                "Request access"
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
