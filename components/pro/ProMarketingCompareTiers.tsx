import Link from "next/link";
import { Check } from "lucide-react";
import { proMarketing } from "@/components/pro/pro-marketing-surfaces";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import { FREE_VS_PRO, FREE_VS_PRO_HIGHLIGHTS } from "@/lib/pro/free-vs-pro";
import { PRO_TRIAL_SIGNUP_HREF } from "@/lib/pro/marketing-about";
import { PRO_MARKETING_CTA_WAITLIST, PRO_MARKETING_FEATURES_MOBILE, PRO_MARKETING_PRICE } from "@/lib/pro/marketing-copy";

const tierCol = "flex h-full min-h-0 flex-col p-4 sm:p-5";

type CompareProps = {
  trialHref?: string;
  showProTrialLink?: boolean;
  /** PRO_PUBLIC_CHECKOUT — when false, show invite-only (no trial badge/CTA). */
  checkoutEnabled?: boolean;
};

/** Compact tier comparison — secondary to subscribe card. */
export function ProMarketingCompareTiers({
  trialHref = PRO_TRIAL_SIGNUP_HREF,
  showProTrialLink = false,
  checkoutEnabled = true,
}: CompareProps = {}) {
  return (
    <div className={proMarketing.card}>
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:items-stretch">
        <div className={`${tierCol} border-b border-white/[0.06] sm:border-b-0 sm:border-r`}>
          <p className="text-[10px] font-medium uppercase tracking-wide text-pro-text-secondary">Free tier</p>
          <h3 className="mt-0.5 text-sm font-semibold text-pro-text">{FREE_VS_PRO.freeTitle}</h3>
          <p className="mt-1 flex-1 text-xs leading-relaxed text-pro-text-secondary sm:leading-snug">
            {FREE_VS_PRO.freeBody}
          </p>
          <ul className="mt-2 space-y-1">
            {FREE_VS_PRO_HIGHLIGHTS.free.map((item) => (
              <li key={item} className="flex gap-1.5 text-xs text-pro-text-secondary">
                <Check className="mt-0.5 size-3 shrink-0 text-white/25" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/"
            className="mt-2 inline-flex text-xs font-medium leading-5 text-pro-text underline-offset-2 hover:text-white sm:mt-auto sm:pt-2.5"
          >
            Open free catalog →
          </Link>
        </div>

        <div className={`${tierCol} bg-white/[0.02]`}>
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-pro-text-secondary">Paid tier</p>
            <span className={proMarketing.accentBadge}>
              {checkoutEnabled ? PRO_MARKETING_PRICE.trialLabel : "Invite only"}
            </span>
          </div>
          <h3 className="mt-0.5 text-sm font-semibold text-pro-text">{FREE_VS_PRO.proTitle}</h3>
          <p className="mt-1 flex-1 text-xs leading-relaxed text-pro-text sm:leading-snug">
            {FREE_VS_PRO.proBody}{" "}
            {checkoutEnabled
              ? PRO_MARKETING_PRICE.trialThenLabel
              : `${PRO_MARKETING_PRICE.valueProp} · private beta`}
            .
          </p>
          <ul className="mt-2 space-y-1">
            {FREE_VS_PRO_HIGHLIGHTS.pro.map((item) => (
              <li key={item} className="flex gap-1.5 text-xs text-pro-text">
                <Check className={`mt-0.5 size-3 shrink-0 ${proMarketing.checkPro}`} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] leading-5 text-pro-text-secondary sm:mt-auto sm:pt-2.5">
            {PRO_MARKETING_PRICE.valueProp} · {PRO_MARKETING_PRICE.currencyNote}
          </p>
          {checkoutEnabled && showProTrialLink ? (
            <Link href={trialHref} className={`mt-2 inline-flex text-xs leading-5 ${proMarketing.accentLink} sm:mt-auto`}>
              {PRO_MARKETING_PRICE.trialDays > 0 ? "Start trial →" : "Subscribe →"}
            </Link>
          ) : null}
          {!checkoutEnabled ? (
            <Link href="#pro-waitlist" className={`mt-2 inline-flex text-xs leading-5 ${proMarketing.accentLink} sm:mt-auto`}>
              {PRO_MARKETING_CTA_WAITLIST} →
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ProMarketingFeaturesHeading({ hideMobileSummary = false }: { hideMobileSummary?: boolean }) {
  return (
    <div>
      <h3 id="features-heading" className="text-sm font-semibold text-pro-text">
        What&apos;s included in {BRAND_NAME_PRO}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-pro-text-secondary sm:mt-0.5">
        {!hideMobileSummary ? (
          <span className="sm:hidden">{PRO_MARKETING_FEATURES_MOBILE}</span>
        ) : null}
        <span className={hideMobileSummary ? "inline" : "hidden sm:inline"}>
          Script → Look → Finish in one workspace. Included with an active subscription or trial.
        </span>
      </p>
    </div>
  );
}
