"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { proMarketing } from "@/components/pro/pro-marketing-surfaces";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import { FREE_VS_PRO } from "@/lib/pro/free-vs-pro";
import { PRO_TRIAL_SIGNUP_HREF } from "@/lib/pro/marketing-about";
import {
  PRO_MARKETING_FEATURE_GROUPS,
  proMarketingHiddenFeatureCount,
} from "@/lib/pro/marketing-features";
import { PRO_MARKETING_CTA_WAITLIST, PRO_MARKETING_PRICE } from "@/lib/pro/marketing-copy";

type CompareProps = {
  trialHref?: string;
  /** PRO_PUBLIC_CHECKOUT — when false, show invite-only (no trial CTA). */
  checkoutEnabled?: boolean;
};

/** Mobile About — compact Free vs Pro row only. */
export function ProMarketingAboutCompareMobile({
  trialHref = PRO_TRIAL_SIGNUP_HREF,
  checkoutEnabled = true,
}: CompareProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-pro-elevated/50">
      <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
        <div className="flex min-h-[7.5rem] flex-col p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-pro-text-secondary">Free</p>
          <p className="mt-1 text-xs font-semibold leading-snug text-pro-text">{FREE_VS_PRO.freeTitle}</p>
          <p className="mt-1 flex-1 text-[11px] leading-relaxed text-pro-text-secondary">
            Catalog &amp; browser planning
          </p>
          <Link href="/" className="mt-2 text-[11px] font-medium text-pro-text underline-offset-2 hover:underline">
            Free catalog →
          </Link>
        </div>
        <div className="flex min-h-[7.5rem] flex-col bg-white/[0.02] p-3">
          <div className="flex flex-wrap items-center gap-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-pro-text-secondary">Pro</p>
            <span className="rounded-full border border-pro-accent/35 bg-pro-accent/10 px-1.5 py-px text-[9px] font-semibold text-pro-accent-bright">
              {checkoutEnabled ? PRO_MARKETING_PRICE.trialLabel : "Invite only"}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold leading-snug text-pro-text">{FREE_VS_PRO.proTitle}</p>
          <p className="mt-1 flex-1 text-[11px] leading-relaxed text-pro-text-secondary">
            {checkoutEnabled
              ? `Then ${PRO_MARKETING_PRICE.fullLabel}`
              : PRO_MARKETING_PRICE.valueProp}
          </p>
          {checkoutEnabled ? (
            <Link href={trialHref} className={`${proMarketing.accentLink} mt-2 text-[11px]`}>
              {PRO_MARKETING_PRICE.trialDays > 0 ? "Start trial →" : "Subscribe →"}
            </Link>
          ) : (
            <Link href="#pro-waitlist" className={`${proMarketing.accentLink} mt-2 text-[11px]`}>
              {PRO_MARKETING_CTA_WAITLIST} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

type FeaturesProps = {
  showHeading?: boolean;
  sectionId?: string;
  headingId?: string;
};

export function ProMarketingAboutFeaturesMobile({
  showHeading = true,
  sectionId = "about-features",
  headingId = "about-features-heading-mobile",
}: FeaturesProps) {
  const [showMore, setShowMore] = useState(false);
  const hiddenCount = proMarketingHiddenFeatureCount();

  return (
    <section id={sectionId} aria-labelledby={headingId}>
      {showHeading ? (
        <>
          <h2 id={headingId} className="text-sm font-semibold text-pro-text">
            What&apos;s included in {BRAND_NAME_PRO}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-pro-text-secondary">
            Script → Look → Finish in one workspace. Included with an active subscription or trial.
          </p>
        </>
      ) : null}

      <ul className={`space-y-4 ${showHeading ? "mt-3" : ""}`}>
        {PRO_MARKETING_FEATURE_GROUPS.slice(0, 2).map((group) => (
          <li key={group.id}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-pro-text-secondary">
              {group.label}
            </p>
            <ul className="mt-1.5 space-y-2">
              {group.features.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-2.5 rounded-lg bg-pro-elevated/40 px-3 py-2.5 ring-1 ring-white/[0.04]">
                  <div className={proMarketing.proIcon}>
                    <Icon className="size-3.5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-pro-text">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-pro-text-secondary">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}

        {showMore
          ? PRO_MARKETING_FEATURE_GROUPS.slice(2).map((group) => (
              <li key={group.id}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-pro-text-secondary">
                  {group.label}
                </p>
                <ul className="mt-1.5 space-y-2">
                  {group.features.map(({ icon: Icon, title, body }) => (
                    <li
                      key={title}
                      className="flex gap-2.5 rounded-lg bg-pro-elevated/40 px-3 py-2.5 ring-1 ring-white/[0.04]"
                    >
                      <div className={proMarketing.proIcon}>
                        <Icon className="size-3.5" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-pro-text">{title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-pro-text-secondary">{body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))
          : null}
      </ul>

      {!showMore && hiddenCount > 0 ? (
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-1.5 py-1 text-xs font-medium text-pro-text-secondary transition hover:text-pro-text"
          onClick={() => setShowMore(true)}
        >
          + {hiddenCount} more
          <ChevronDown className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </section>
  );
}
