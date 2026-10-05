import Link from "next/link";
import { cn } from "@/lib/utils";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { loginHref, signUpHref } from "@/lib/auth/safe-next-path";
import { PRO_MARKETING_CTA_CREATE_TRIAL } from "@/lib/pro/marketing-copy";

type Props = {
  returnPath?: string;
  /** @deprecated Soft launch — create/signup lives on invite accept only. */
  trialHref?: string;
  /** Side-by-side on desktop strips; stacked on narrow sections. */
  layout?: "inline" | "stack";
  className?: string;
  /** Live release: show create-account next to Sign in. */
  showCreateAccount?: boolean;
  /** @deprecated Ignored — Sign in only in chrome. */
  signUpLabel?: string;
  /** Header nav — smaller pills. */
  size?: "default" | "compact";
  /** Called when a CTA is activated (e.g. close mobile menu). */
  onNavigate?: () => void;
};

/** Sign in, plus create-account when public checkout is on. */
export function ProMarketingAuthButtons({
  returnPath = "/pro",
  layout = "stack",
  className,
  showCreateAccount = false,
  size = "default",
  onNavigate,
}: Props) {
  const signInUrl = loginHref(returnPath);
  const signUpUrl = signUpHref("/account");
  const height = size === "compact" ? "h-9" : "h-11";
  const text = size === "compact" ? "text-sm" : "text-[15px]";
  const pad = size === "compact" ? "px-3.5" : "px-5";

  if (layout === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-2.5", className)}>
        {showCreateAccount ? (
          <Link
            href={signUpUrl}
            className={`${proBtn.marketingPrimary} ${height} ${pad} ${text}`}
            onClick={onNavigate}
          >
            {PRO_MARKETING_CTA_CREATE_TRIAL}
          </Link>
        ) : null}
        <Link
          href={signInUrl}
          className={`${proBtn.secondary} ${height} ${pad} ${text}`}
          onClick={onNavigate}
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {showCreateAccount ? (
        <Link
          href={signUpUrl}
          className={`${proBtn.marketingPrimary} ${height} w-full justify-center ${text}`}
          onClick={onNavigate}
        >
          {PRO_MARKETING_CTA_CREATE_TRIAL}
        </Link>
      ) : null}
      <Link
        href={signInUrl}
        className={`${proBtn.secondary} ${height} w-full justify-center ${text}`}
        onClick={onNavigate}
      >
        Sign in
      </Link>
    </div>
  );
}
