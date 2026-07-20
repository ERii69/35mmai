import Link from "next/link";
import { proAuth, proBtn } from "@/components/pro/ux/pro-surfaces";
import {
  PRO_ABOUT_SIGNED_IN_TRIAL_BODY,
  PRO_ABOUT_SIGNED_IN_TRIAL_TITLE,
} from "@/lib/pro/marketing-about";
import type { ProMarketingInfoCrossLink } from "@/lib/pro/marketing-info-pages";
import { PRO_CONTINUE_STUDIO_LABEL, PRO_OPEN_STUDIO_LABEL } from "@/lib/pro/pro-nav-labels";

type Props = {
  signedIn: boolean;
  entitled: boolean;
  stackReady: boolean;
  returnPath: string;
  crossLinks?: ProMarketingInfoCrossLink[];
};

/** Mobile info pages — auth CTAs below content. */
export function ProMarketingInfoBottomStrip({
  signedIn,
  entitled,
  stackReady,
  returnPath,
  crossLinks = [],
}: Props) {
  if (signedIn && !entitled) {
    return (
      <section className="rounded-xl border border-white/[0.08] bg-pro-elevated/60 p-4 text-center ring-1 ring-white/[0.04] md:hidden">
        <p className="text-sm font-semibold text-pro-text">{PRO_ABOUT_SIGNED_IN_TRIAL_TITLE}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-pro-text-secondary">{PRO_ABOUT_SIGNED_IN_TRIAL_BODY}</p>
        <Link href="/account" className={`${proBtn.marketingPrimary} mt-4 h-10 w-full justify-center text-sm`}>
          Go to Account
        </Link>
      </section>
    );
  }

  if (entitled) {
    return (
      <div className="md:hidden">
        <Link href="/pro/app" className={`${proBtn.marketingPrimary} h-10 w-full justify-center text-sm`}>
          {PRO_CONTINUE_STUDIO_LABEL}
        </Link>
      </div>
    );
  }

  if (!stackReady) {
    return (
      <p className="text-center text-sm md:hidden">
        <Link href="/" className={proAuth.mutedLink}>
          Back to free catalog
        </Link>
      </p>
    );
  }

  return null;
}

/** Desktop info/legal — text CTAs under content. */
export function ProMarketingInfoBottomStripDesktop({
  signedIn,
  entitled,
  stackReady,
  returnPath,
  trialHref,
}: Props & { trialHref: string }) {
  if (signedIn && !entitled) {
    return (
      <section className="hidden rounded-xl border border-white/[0.08] bg-pro-elevated/60 p-5 text-center ring-1 ring-white/[0.04] md:block">
        <p className="text-sm font-semibold text-pro-text">{PRO_ABOUT_SIGNED_IN_TRIAL_TITLE}</p>
        <p className="mt-1.5 text-sm text-pro-text-secondary">{PRO_ABOUT_SIGNED_IN_TRIAL_BODY}</p>
        <Link href="/account" className={`${proBtn.marketingPrimary} mt-4 inline-flex h-10 px-6 text-sm`}>
          Go to Account
        </Link>
      </section>
    );
  }

  if (entitled) {
    return (
      <div className="hidden justify-center md:flex">
        <Link href="/pro/app" className={`${proBtn.marketingPrimary} h-11 px-6 text-[15px]`}>
          {PRO_OPEN_STUDIO_LABEL}
        </Link>
      </div>
    );
  }

  if (!stackReady) return null;

  return null;
}
