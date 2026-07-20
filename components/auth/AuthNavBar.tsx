"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { Logo35mmAI } from "@/components/brand/Logo35mmAI";
import { ProBadge } from "@/components/brand/ProBadge";
import { ProMarketingAuthButtons } from "@/components/pro/ProMarketingAuthButtons";
import { ProMarketingSiteNavLinks } from "@/components/pro/ProMarketingSiteNavLinks";
import { proWebShell } from "@/components/pro/ux/pro-surfaces";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";

type Props = {
  next?: string;
};

function signUpHrefForNext(next?: string) {
  const path = "/sign-up";
  if (!next || next === "/account") return path;
  return `${path}?${new URLSearchParams({ next }).toString()}`;
}

export function AuthNavBar({ next }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const signUpHref = signUpHrefForNext(next);

  useEffect(() => setMounted(true), []);

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

  const mobileMenu =
    menuOpen && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/80 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            onClick={closeMenu}
          >
            <nav
              className="absolute left-4 right-4 top-[calc(3.25rem+env(safe-area-inset-top))] max-h-[min(85vh,32rem)] overflow-auto rounded-2xl border border-white/[0.1] bg-pro-elevated p-2 shadow-xl"
              aria-label="Mobile menu"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1 px-1 py-1">
                <ProMarketingSiteNavLinks variant="mobile" onNavigate={closeMenu} />

                <div className="my-2 border-t border-white/[0.08]" />

                <div className="px-1 pt-1">
                  <ProMarketingAuthButtons
                    returnPath={next ?? "/account"}
                    trialHref={signUpHref}
                    layout="stack"
                  />
                </div>
              </div>
            </nav>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-pro-base/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className={`${proWebShell.headerInner} flex items-center justify-between gap-3 py-2 md:py-2.5`}>
          <div className="flex min-w-0 items-center gap-2">
            <Logo35mmAI
              className={proWebShell.headerLogo}
              href="/pro"
              aria-label={BRAND_NAME_PRO}
            />
            <ProBadge variant="header" className="shrink-0" title="Pro" />
          </div>

          <nav className="hidden items-center gap-x-4 text-sm font-medium md:flex" aria-label="Site">
            <ProMarketingSiteNavLinks variant="desktop" />
            <ProMarketingAuthButtons
              returnPath={next ?? "/account"}
              trialHref={signUpHref}
              layout="inline"
              size="compact"
            />
          </nav>

          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-pro-primary transition hover:bg-pro-primary/10 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="size-6" aria-hidden />
            ) : (
              <Menu className="size-6" aria-hidden />
            )}
          </button>
        </div>
      </header>
      {mobileMenu}
    </>
  );
}
