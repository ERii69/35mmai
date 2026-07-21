"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo35mmAI } from "@/components/brand/Logo35mmAI";
import { ProBadge, PRO_HEADER_PROFILE_SLOT } from "@/components/brand/ProBadge";
import { ProHeaderAccountMenu } from "@/components/pro/ProHeaderAccountMenu";
import { ProMarketingAuthButtons } from "@/components/pro/ProMarketingAuthButtons";
import { PRO_SUBSCRIBE_PATH } from "@/components/pro/ProMarketingSiteNavLinks";
import { proBtn, proWebShell } from "@/components/pro/ux/pro-surfaces";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import { loginHref } from "@/lib/auth/safe-next-path";
import {
  PRO_SUBSCRIBE_REQUIRED_LIVE,
  PRO_SUBSCRIBE_REQUIRED_SOFT,
} from "@/lib/pro/marketing-copy";

type Props = {
  email: string | null;
  entitled: boolean;
  subscribeRequired?: boolean;
  /** When false (soft launch), bounce banner skips “Subscribe”. */
  checkoutEnabled?: boolean;
  userMetadata?: { full_name?: string; name?: string } | null;
  canManageBilling?: boolean;
};

/**
 * Pro chrome — 35mmAi left, quiet actions + PRO seal + profile slot right.
 * No Subscribe / Free catalog / Create account (logo + invite cover those).
 */
export function ProMarketingHeader({
  email,
  entitled,
  subscribeRequired,
  checkoutEnabled = true,
  userMetadata,
  canManageBilling = false,
}: Props) {
  const pathname = usePathname();
  const signedIn = Boolean(email);
  const onMarketingPage = pathname.startsWith("/pro") && !pathname.startsWith("/pro/app");
  const hideProspectAuthInHeader = !signedIn && onMarketingPage;
  const authReturnPath = pathname || PRO_SUBSCRIBE_PATH;
  const proHref = signedIn
    ? entitled
      ? "/pro/app"
      : "/pro"
    : loginHref(authReturnPath);

  const openProjectsCta = entitled ? (
    <Link
      href="/pro/app"
      className={`${proBtn.secondary} h-9 px-3.5 text-sm sm:h-10 sm:px-4`}
    >
      Open projects
    </Link>
  ) : null;

  const accountMenu = signedIn ? (
    <ProHeaderAccountMenu
      email={email!}
      userMetadata={userMetadata}
      canManageBilling={canManageBilling}
      entitled={entitled}
      mobileTrigger="user"
    />
  ) : (
    <span className={PRO_HEADER_PROFILE_SLOT} aria-hidden />
  );

  const authActions = signedIn ? (
    openProjectsCta
  ) : hideProspectAuthInHeader ? null : (
    <ProMarketingAuthButtons
      returnPath={authReturnPath}
      layout="inline"
      size="compact"
    />
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-pro-base/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      {subscribeRequired && signedIn && !entitled ? (
        <div className={proWebShell.statusBanner} role="status">
          {checkoutEnabled ? PRO_SUBSCRIBE_REQUIRED_LIVE : PRO_SUBSCRIBE_REQUIRED_SOFT}{" "}
          <Link href="/account" className="font-medium underline-offset-2 hover:underline">
            {checkoutEnabled ? "Go to billing" : "Open Account"}
          </Link>
        </div>
      ) : null}

      <div className={`${proWebShell.headerInner} flex items-center justify-between gap-3 py-2 md:py-2.5`}>
        <Logo35mmAI
          className={proWebShell.headerLogo}
          href={entitled ? "/pro/app" : PRO_SUBSCRIBE_PATH}
          aria-label={BRAND_NAME_PRO}
        />

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {authActions}
          <ProBadge variant="header" className="shrink-0" title="Pro" href={proHref} />
          {accountMenu}
        </div>
      </div>
    </header>
  );
}
