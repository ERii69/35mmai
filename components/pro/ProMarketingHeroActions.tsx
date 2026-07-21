"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { loginHref } from "@/lib/auth/safe-next-path";
import { PRO_MARKETING_CTA_TRIAL } from "@/lib/pro/marketing-copy";
import { PRO_TRIAL_SIGNUP_HREF } from "@/lib/pro/marketing-about";

type Props = {
  stackReady: boolean;
  signedIn: boolean;
  entitled: boolean;
  className?: string;
  loginNext?: string;
};

/** Single primary CTA — no secondary links or in-page jumps. */
export function ProMarketingHeroActions({
  stackReady,
  signedIn,
  entitled,
  className = "",
}: Props) {
  if (entitled) return null;

  if (signedIn && stackReady) {
    return (
      <div className={`flex justify-center ${className}`}>
        <Link
          href="/account"
          className={`${proBtn.marketingPrimary} h-11 w-full max-w-xs justify-center text-[15px] sm:w-auto sm:min-w-[14rem]`}
        >
          {PRO_MARKETING_CTA_TRIAL}
        </Link>
      </div>
    );
  }

  if (stackReady) {
    return (
      <div className={`flex justify-center ${className}`}>
        <Link
          href={PRO_TRIAL_SIGNUP_HREF}
          className={`${proBtn.marketingPrimary} h-11 w-full max-w-xs justify-center text-[15px] sm:w-auto sm:min-w-[14rem]`}
        >
          <Sparkles className="size-4" aria-hidden />
          {PRO_MARKETING_CTA_TRIAL}
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <Link href="/" className={`${proBtn.secondary} h-10 w-full max-w-xs justify-center sm:w-auto`}>
        Back to free catalog
      </Link>
    </div>
  );
}

/** Sign-in link for hero when not signed in. */
export function ProMarketingHeroSignInLink({
  loginNext = "/pro",
  className = "",
}: {
  loginNext?: string;
  className?: string;
}) {
  return (
    <p className={`text-xs text-pro-text-secondary ${className}`}>
      Already have an account?{" "}
      <Link href={loginHref(loginNext)} className="font-medium text-pro-text underline-offset-2 hover:underline">
        Sign in
      </Link>
    </p>
  );
}
