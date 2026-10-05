"use client";

import { usePathname } from "next/navigation";
import { Logo35mmAI } from "@/components/brand/Logo35mmAI";
import { ProBadge, PRO_HEADER_PROFILE_SLOT } from "@/components/brand/ProBadge";
import { ProMarketingAuthButtons } from "@/components/pro/ProMarketingAuthButtons";
import { SitePrimaryNav } from "@/components/site/SitePrimaryNav";
import { proWebShell } from "@/components/pro/ux/pro-surfaces";
import { BRAND_NAME } from "@/lib/brand/brand-identity";
import { loginHref } from "@/lib/auth/safe-next-path";

type Props = {
  next?: string;
  /** Logo + PRO only (invite accept). */
  minimal?: boolean;
};

/** Auth chrome — 35mmAi left, PRO seal + profile slot right. */
export function AuthNavBar({ next, minimal = false }: Props) {
  const pathname = usePathname() ?? "";
  const onLogin = pathname === "/login" || pathname.startsWith("/login?");
  const onInviteAccept = pathname.startsWith("/pro/invite");
  const showSignIn = !minimal && !onLogin && !onInviteAccept;
  const returnPath = next ?? "/account";
  const proHref = onLogin ? undefined : loginHref(returnPath);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-pro-base/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex w-full flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6 md:py-2.5">
        <Logo35mmAI
          className={proWebShell.headerLogo}
          href="/"
          aria-label={`${BRAND_NAME} home`}
        />

        {minimal ? null : <SitePrimaryNav />}

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {showSignIn ? (
            <ProMarketingAuthButtons
              returnPath={returnPath}
              layout="inline"
              size="compact"
            />
          ) : null}
          <ProBadge
            variant="header"
            className="shrink-0"
            title={onLogin ? "Pro" : "Sign in to Pro"}
            href={proHref}
          />
          <span className={PRO_HEADER_PROFILE_SLOT} aria-hidden />
        </div>
      </div>
    </header>
  );
}
