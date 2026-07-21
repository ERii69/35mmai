import Link from "next/link";
import { cn } from "@/lib/utils";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { loginHref } from "@/lib/auth/safe-next-path";

type Props = {
  returnPath?: string;
  /** @deprecated Soft launch — create/signup lives on invite accept only. */
  trialHref?: string;
  /** Side-by-side on desktop strips; stacked on narrow sections. */
  layout?: "inline" | "stack";
  className?: string;
  /** @deprecated Ignored — Sign in only in chrome. */
  signUpLabel?: string;
  /** Header nav — smaller pills. */
  size?: "default" | "compact";
  /** Called when a CTA is activated (e.g. close mobile menu). */
  onNavigate?: () => void;
};

/** Sign in only — Create account / trial CTAs stay off chrome (invite flow owns signup). */
export function ProMarketingAuthButtons({
  returnPath = "/pro",
  layout = "stack",
  className,
  size = "default",
  onNavigate,
}: Props) {
  const signInUrl = loginHref(returnPath);
  const height = size === "compact" ? "h-9" : "h-11";
  const text = size === "compact" ? "text-sm" : "text-[15px]";
  const pad = size === "compact" ? "px-3.5" : "px-5";

  if (layout === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-2.5", className)}>
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
