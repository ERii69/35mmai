"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { Logo35mmAI } from "@/components/brand/Logo35mmAI";
import { ProBadge } from "@/components/brand/ProBadge";
import { ProHeaderAccountMenu } from "@/components/pro/ProHeaderAccountMenu";
import { ProMarketingAuthButtons } from "@/components/pro/ProMarketingAuthButtons";
import {
  PRO_SUBSCRIBE_PATH,
  ProMarketingSiteNavLinks,
} from "@/components/pro/ProMarketingSiteNavLinks";
import { proWebShell } from "@/components/pro/ux/pro-surfaces";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";

type Props = {
  email: string | null;
  entitled: boolean;
  subscribeRequired?: boolean;
  userMetadata?: { full_name?: string; name?: string } | null;
  canManageBilling?: boolean;
};

export function ProMarketingHeader({
  email,
  entitled,
  subscribeRequired,
  userMetadata,
  canManageBilling = false,
}: Props) {
  const pathname = usePathname();
  const signedIn = Boolean(email);
  const onMarketingPage = pathname.startsWith("/pro") && !pathname.startsWith("/pro/app");
  const hideProspectAuthInHeader = !signedIn && onMarketingPage;
  const showSubscribeLinks = !entitled;
  const showMobileNavMenu = showSubscribeLinks;
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(72);

  const authReturnPath = pathname || PRO_SUBSCRIBE_PATH;

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const node = el;
    function publish() {
      setHeaderHeight(node.offsetHeight);
    }
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(node);
    return () => ro.disconnect();
  }, [subscribeRequired, signedIn, entitled]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, closeMenu]);

  const menuBtnClass =
    "inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-pro-primary transition hover:bg-pro-primary/10";

  const authActions = signedIn ? (
    <ProHeaderAccountMenu
      email={email!}
      userMetadata={userMetadata}
      canManageBilling={canManageBilling}
      entitled={entitled}
      mobileTrigger="user"
    />
  ) : hideProspectAuthInHeader ? null : (
    <ProMarketingAuthButtons
      returnPath={authReturnPath}
      layout="inline"
      size="compact"
    />
  );

  const mobileMenu =
    menuOpen && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/80 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-pro-overlay=""
            onClick={closeMenu}
          >
            <nav
              className="absolute left-4 right-4 max-h-[min(85vh,32rem)] overflow-auto rounded-2xl border border-white/[0.1] bg-pro-elevated p-2 shadow-xl"
              style={{ top: headerHeight + 8 }}
              aria-label="Mobile menu"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1 px-1 py-1">
                {!signedIn ? (
                  <div className="px-1 pb-2 pt-1">
                    <ProMarketingAuthButtons
                      returnPath={authReturnPath}
                      layout="stack"
                      onNavigate={closeMenu}
                    />
                    <div className="my-3 border-t border-white/[0.08]" />
                  </div>
                ) : null}

                <ProMarketingSiteNavLinks
                  variant="mobile"
                  showLegal={showSubscribeLinks}
                  showSubscribe={showSubscribeLinks}
                  showFreeCatalog={showSubscribeLinks}
                  onNavigate={closeMenu}
                />
              </div>
            </nav>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-40 border-b border-white/[0.06] bg-pro-base/95 pt-[env(safe-area-inset-top)] backdrop-blur-md"
      >
        {subscribeRequired && signedIn && !entitled ? (
          <div className={proWebShell.statusBanner} role="status">
            Subscribe to open the workspace.{" "}
            <Link href="/account" className="font-medium underline-offset-2 hover:underline">
              Go to billing
            </Link>
          </div>
        ) : null}

        <div className={`${proWebShell.headerInner} flex items-center justify-between gap-3 py-2 md:py-2.5`}>
          <div className="flex min-w-0 items-center gap-2">
            <Logo35mmAI
              className={proWebShell.headerLogo}
              href={PRO_SUBSCRIBE_PATH}
              aria-label={BRAND_NAME_PRO}
            />
            <ProBadge variant="header" className="shrink-0" title="Pro" />
          </div>

          <nav className="hidden items-center gap-x-4 text-sm font-medium md:flex" aria-label="Site">
            {showSubscribeLinks ? (
              <ProMarketingSiteNavLinks
                variant="desktop"
                showLegal={showSubscribeLinks}
                showSubscribe={showSubscribeLinks}
                showFreeCatalog={showSubscribeLinks}
              />
            ) : null}
            {authActions}
          </nav>

          <div className="flex shrink-0 items-center gap-1 md:hidden">
            {signedIn ? (
              <ProHeaderAccountMenu
                email={email!}
                userMetadata={userMetadata}
                canManageBilling={canManageBilling}
                entitled={entitled}
                mobileTrigger="user"
              />
            ) : null}
            {showMobileNavMenu ? (
              <button
                type="button"
                className={menuBtnClass}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
              </button>
            ) : null}
          </div>
        </div>
      </header>
      {mobileMenu}
    </>
  );
}
