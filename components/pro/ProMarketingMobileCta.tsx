"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { BRAND_NAME } from "@/lib/brand/brand-identity";
import {
  PRO_MARKETING_CTA_CREATE_TRIAL,
  PRO_MARKETING_CTA_TRIAL,
} from "@/lib/pro/marketing-copy";
import { PRO_TRIAL_SIGNUP_HREF } from "@/lib/pro/marketing-about";
import { PRO_CONTINUE_STUDIO_LABEL } from "@/lib/pro/pro-nav-labels";

type Props = {
  stackReady: boolean;
  signedIn: boolean;
  entitled: boolean;
  /** Override trial CTA destination (default sign-up → account). */
  trialHref?: string;
};

const stickyBar =
  "fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] bg-pro-base/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden";

/** Sticky mobile CTA — create account when signed out; trial checkout when signed in. */
export function ProMarketingMobileCta({
  stackReady,
  signedIn,
  entitled,
  trialHref = PRO_TRIAL_SIGNUP_HREF,
}: Props) {
  if (entitled) {
    return (
      <div className={stickyBar}>
        <Link href="/pro/app" className={`${proBtn.marketingPrimary} h-11 w-full justify-center text-[15px]`}>
          <LayoutGrid className="size-4" aria-hidden />
          {PRO_CONTINUE_STUDIO_LABEL}
        </Link>
      </div>
    );
  }

  if (signedIn) {
    return (
      <div className={stickyBar}>
        <Link href="/account" className={`${proBtn.marketingPrimary} h-11 w-full justify-center text-[15px]`}>
          {PRO_MARKETING_CTA_TRIAL}
        </Link>
      </div>
    );
  }

  if (!stackReady) {
    return (
      <div className={stickyBar}>
        <Link href="/" className={`${proBtn.secondary} h-10 w-full justify-center`}>
          Back to free {BRAND_NAME}
        </Link>
      </div>
    );
  }

  return (
    <div className={stickyBar}>
      <Link href={trialHref} className={`${proBtn.marketingPrimary} h-11 w-full justify-center text-[15px]`}>
        {PRO_MARKETING_CTA_CREATE_TRIAL}
      </Link>
    </div>
  );
}
