import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProMarketingAuthButtons } from "@/components/pro/ProMarketingAuthButtons";
import { proMarketing } from "@/components/pro/pro-marketing-surfaces";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { BRAND_NAME } from "@/lib/brand/brand-identity";
import {
  PRO_ABOUT_SIGNED_IN_TRIAL_BODY,
  PRO_ABOUT_SIGNED_IN_TRIAL_TITLE,
  PRO_TRIAL_SIGNUP_HREF,
} from "@/lib/pro/marketing-about";
import { PRO_MARKETING_CTA_TRIAL } from "@/lib/pro/marketing-copy";
import { PRO_CONTINUE_STUDIO_LABEL } from "@/lib/pro/pro-nav-labels";

type Props = {
  stackReady: boolean;
  signedIn: boolean;
  entitled: boolean;
  returnPath: string;
  trialHref?: string;
  className?: string;
};

/** Top-of-page auth card — Create account + Sign in (prospects) or next step when signed in. */
export function ProMarketingAuthCard({
  stackReady,
  signedIn,
  entitled,
  returnPath,
  trialHref = PRO_TRIAL_SIGNUP_HREF,
  className,
}: Props) {
  if (entitled) {
    return (
      <section className={cn(proMarketing.proPanel, className)} aria-label="Studio access">
        <Link
          href="/pro/app"
          className={`${proBtn.marketingPrimary} h-11 w-full justify-center text-[15px] sm:w-auto sm:min-w-[14rem]`}
        >
          <LayoutGrid className="size-4" aria-hidden />
          {PRO_CONTINUE_STUDIO_LABEL}
        </Link>
      </section>
    );
  }

  if (signedIn) {
    return (
      <section className={cn(proMarketing.proPanel, className)} aria-label="Start trial">
        <p className="text-sm font-semibold text-pro-text">{PRO_ABOUT_SIGNED_IN_TRIAL_TITLE}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-pro-text-secondary">
          {PRO_ABOUT_SIGNED_IN_TRIAL_BODY}
        </p>
        <Link
          href="/account"
          className={`${proBtn.marketingPrimary} mt-4 h-11 w-full justify-center text-[15px] sm:w-auto sm:min-w-[12rem]`}
        >
          {PRO_MARKETING_CTA_TRIAL}
        </Link>
      </section>
    );
  }

  if (!stackReady) {
    return (
      <section className={cn(proMarketing.proPanel, className)} aria-label="Catalog">
        <Link href="/" className={`${proBtn.secondary} h-10 w-full justify-center sm:w-auto`}>
          Back to free {BRAND_NAME}
        </Link>
      </section>
    );
  }

  return (
    <section className={cn(proMarketing.proPanel, className)} aria-label="Sign up or sign in">
      <ProMarketingAuthButtons
        returnPath={returnPath}
        trialHref={trialHref}
        layout="inline"
        className="justify-start sm:justify-center"
      />
    </section>
  );
}
