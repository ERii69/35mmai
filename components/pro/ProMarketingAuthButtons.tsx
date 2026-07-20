import Link from "next/link";
import { cn } from "@/lib/utils";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { loginHref } from "@/lib/auth/safe-next-path";
import { PRO_MARKETING_CTA_CREATE_TRIAL } from "@/lib/pro/marketing-copy";
import { PRO_TRIAL_SIGNUP_HREF } from "@/lib/pro/marketing-about";

type Props = {
  returnPath?: string;
  trialHref?: string;
  /** Side-by-side on desktop strips; stacked on narrow sections. */
  layout?: "inline" | "stack";
  className?: string;
  signUpLabel?: string;
  /** Header nav — smaller pills. */
  size?: "default" | "compact";
  /** Called when a CTA is activated (e.g. close mobile menu). */
  onNavigate?: () => void;
};

/** Consistent Create account + Sign in CTAs across /pro marketing surfaces. */
export function ProMarketingAuthButtons({
  returnPath = "/pro",
  trialHref = PRO_TRIAL_SIGNUP_HREF,
  layout = "stack",
  className,
  signUpLabel = PRO_MARKETING_CTA_CREATE_TRIAL,
  size = "default",
  onNavigate,
}: Props) {
  const signInUrl = loginHref(returnPath);
  const height = size === "compact" ? "h-9" : "h-11";
  const primaryText = size === "compact" ? "text-sm" : "text-[15px]";
  const secondaryText = size === "compact" ? "text-xs" : "text-sm";
  const primaryPad = size === "compact" ? "px-3.5" : "px-5";
  const secondaryPad = size === "compact" ? "px-3" : "px-5";

  if (layout === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-2.5", className)}>
        <Link
          href={trialHref}
          className={`${proBtn.marketingPrimary} ${height} ${primaryPad} ${primaryText}`}
          onClick={onNavigate}
        >
          {signUpLabel}
        </Link>
        <Link
          href={signInUrl}
          className={`${proBtn.secondary} ${height} ${secondaryPad} ${secondaryText}`}
          onClick={onNavigate}
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <Link
        href={trialHref}
        className={`${proBtn.marketingPrimary} ${height} w-full justify-center ${primaryText}`}
        onClick={onNavigate}
      >
        {signUpLabel}
      </Link>
      <Link
        href={signInUrl}
        className={`${proBtn.secondary} ${height} w-full justify-center ${secondaryText}`}
        onClick={onNavigate}
      >
        Sign in
      </Link>
    </div>
  );
}
