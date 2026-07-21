import { Mail } from "lucide-react";
import { SITE_CONTACT_EMAIL } from "@/app/data";
import { proMarketing } from "@/components/pro/pro-marketing-surfaces";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import {
  PRO_INVITE_INVALID,
  PRO_INVITE_ONLY_EYEBROW,
} from "@/lib/pro/marketing-copy";

type Props = {
  invalidInvite?: boolean;
  className?: string;
  sectionId?: string;
};

const requestAccessHref = `mailto:${SITE_CONTACT_EMAIL}?subject=${encodeURIComponent(
  "35mmAiPro — access request"
)}&body=${encodeURIComponent("Hi, I’d like to request access to the 35mmAiPro private beta.")}`;

/** Soft-launch gate — direct email request while public checkout is off. */
export function ProInviteOnlyPanel({ invalidInvite = false, className, sectionId }: Props) {
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
        We&apos;re opening 35mmAiPro to a small group of filmmakers first. Email{" "}
        <a
          href={`mailto:${SITE_CONTACT_EMAIL}`}
          className="font-medium text-pro-text underline underline-offset-4"
        >
          {SITE_CONTACT_EMAIL}
        </a>{" "}
        to request access. We&apos;ll reply when a place opens.
      </p>
      {invalidInvite ? (
        <p
          className="mt-3 rounded-lg border border-pro-warning/30 bg-pro-warning/10 px-3 py-2 text-sm text-pro-warning"
          role="alert"
        >
          {PRO_INVITE_INVALID}
        </p>
      ) : null}

      <a href={requestAccessHref} className={`${proBtn.primaryFull} mt-5`}>
        <Mail className="size-4" aria-hidden />
        Email to request access
      </a>
    </section>
  );
}
