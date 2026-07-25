"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { submitProWaitlist, type ProWaitlistState } from "@/app/actions/waitlist";
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

const initialState: ProWaitlistState = { status: "idle" };

/** Soft-launch gate — one-line request stored privately in Supabase. */
export function ProInviteOnlyPanel({ invalidInvite = false, className, sectionId }: Props) {
  const [state, formAction, isPending] = useActionState(submitProWaitlist, initialState);

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
        We&apos;re opening 35mmAiPro to a small group of filmmakers first. Enter your email to
        request access.
      </p>
      {invalidInvite ? (
        <p
          className="mt-3 rounded-lg border border-pro-warning/30 bg-pro-warning/10 px-3 py-2 text-sm text-pro-warning"
          role="alert"
        >
          {PRO_INVITE_INVALID}
        </p>
      ) : null}

      {state.status === "success" ? (
        <div
          className="mt-5 flex items-center gap-2 rounded-xl bg-pro-success/10 px-4 py-3 text-sm text-pro-text ring-1 ring-pro-success/25"
          role="status"
        >
          <Check className="size-4 text-pro-success" aria-hidden />
          Request received. We&apos;ll contact you when a place opens.
        </div>
      ) : (
        <form action={formAction} className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <label htmlFor="pro-access-request-email" className="sr-only">
            Email address
          </label>
          <input
            id="pro-access-request-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={`${proSurface.field} min-w-0 flex-1`}
          />
          <div className="hidden" aria-hidden>
            <label htmlFor="pro-access-request-website">Website</label>
            <input
              id="pro-access-request-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className={`${proBtn.primaryFull} sm:w-auto sm:min-w-40`}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {isPending ? "Sending…" : "Request access"}
          </button>
          {state.status === "error" ? (
            <p className="text-sm text-pro-warning sm:basis-full" role="alert">
              {state.message}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
