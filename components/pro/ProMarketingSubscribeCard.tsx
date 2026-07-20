import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutGrid } from "lucide-react";
import { ProMarketingAuthButtons } from "@/components/pro/ProMarketingAuthButtons";
import { ProMarketingTrustStrip } from "@/components/pro/ProMarketingTrustStrip";
import { proMarketing } from "@/components/pro/pro-marketing-surfaces";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { BRAND_NAME } from "@/lib/brand/brand-identity";
import { PRO_MARKETING_CTA_TRIAL, PRO_MARKETING_PRICE } from "@/lib/pro/marketing-copy";
import { PRO_CONTINUE_STUDIO_LABEL } from "@/lib/pro/pro-nav-labels";

type Props = {
  stackReady: boolean;
  signedIn: boolean;
  entitled: boolean;
  className?: string;
  /** Show trust bullets under pricing. */
  showTrustStrip?: boolean;
  /** Suppress in-card warning when page-level banner is shown. */
  hideStackWarning?: boolean;
  /** Anchor id for in-page section nav. */
  sectionId?: string;
  /** Post-login return path for Sign in link. */
  loginNext?: string;
};

export function ProMarketingSubscribeCard({
  stackReady,
  signedIn,
  entitled,
  className,
  showTrustStrip = false,
  hideStackWarning = false,
  sectionId,
  loginNext = "/pro",
}: Props) {
  return (
    <section
      id={sectionId}
      className={cn(proMarketing.proPanel, className)}
      aria-labelledby="pro-subscribe-heading"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-pro-accent/90">Built for directors</p>
      <p className="mt-1.5 text-base font-semibold text-pro-text">
        Stop rewriting the same AI prompts for every new scene.
      </p>

      {!stackReady && !hideStackWarning ? (
        <p className="mt-3 rounded-lg border border-pro-warning/30 bg-pro-warning/10 px-3 py-2 text-sm text-pro-warning">
          Sign-up requires server configuration. The free catalog at{" "}
          <Link href="/" className="font-medium text-white underline-offset-2 hover:underline">
            home
          </Link>{" "}
          still works.
        </p>
      ) : null}

      <div className="mt-5">
        <h2 id="pro-subscribe-heading" className="text-3xl font-bold tracking-tight text-pro-text">
          {PRO_MARKETING_PRICE.trialLabel}
        </h2>
        <p className="mt-1 text-sm text-pro-text-secondary">
          Then {PRO_MARKETING_PRICE.fullLabel} · {PRO_MARKETING_PRICE.currencyNote}
        </p>
        <p className="mt-1 text-xs text-pro-text-secondary">{PRO_MARKETING_PRICE.checkoutNote}</p>
      </div>

      {showTrustStrip ? <ProMarketingTrustStrip className="mt-5" /> : null}

      <div className="mt-6">
        {entitled ? (
          <Link
            href="/pro/app"
            className={`${proBtn.marketingPrimary} h-11 w-full justify-center text-[15px]`}
          >
            <LayoutGrid className="size-4" aria-hidden />
            {PRO_CONTINUE_STUDIO_LABEL}
          </Link>
        ) : signedIn ? (
          <Link
            href="/account"
            className={`${proBtn.marketingPrimary} h-11 w-full justify-center text-[15px]`}
          >
            {PRO_MARKETING_CTA_TRIAL}
          </Link>
        ) : stackReady ? (
          <ProMarketingAuthButtons returnPath={loginNext} layout="inline" className="justify-start sm:justify-center" />
        ) : (
          <Link href="/" className={`${proBtn.secondary} h-10 w-full justify-center`}>
            Back to free {BRAND_NAME}
          </Link>
        )}
      </div>
    </section>
  );
}
