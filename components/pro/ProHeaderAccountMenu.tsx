"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Archive,
  CreditCard,
  ExternalLink,
  LayoutGrid,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { getCustomerPortalUrl } from "@/app/actions/stripe";
import { headerDisplayName } from "@/lib/pro/header-user-display";
import { PRO_PRIVACY_PATH, PRO_TERMS_PATH } from "@/lib/pro/membership-policy";
import { PRO_STUDIO_NAV_LABEL } from "@/lib/pro/pro-nav-labels";
import { useOutsideClick } from "@/lib/pro/use-outside-click";

type Props = {
  email: string;
  userMetadata?: { full_name?: string; name?: string } | null;
  canManageBilling: boolean;
  entitled?: boolean;
  /** Legal links live in the account menu once the user has Pro access. */
  showLegalInMenu?: boolean;
  /** Free catalog in menu — subscribed users only (top nav covers pre-subscribe). */
  showFreeCatalogInMenu?: boolean;
  /** Avoid two hamburger icons when a separate site menu is shown. */
  mobileTrigger?: "menu" | "user";
  /** Archives count for mobile account menu (shell nav is desktop-only). */
  archivedCount?: number;
};

const menuItemClass =
  "flex min-h-11 items-center gap-2.5 px-4 py-2.5 text-sm text-pro-text transition hover:bg-pro-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pro-primary/50";

const sectionLabelClass =
  "px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-pro-text-secondary";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ProHeaderAccountMenu({
  email,
  userMetadata,
  canManageBilling,
  entitled = false,
  showLegalInMenu = entitled,
  showFreeCatalogInMenu = entitled,
  mobileTrigger = "menu",
  archivedCount = 0,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [billingPending, setBillingPending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const desktopPanelRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const desktopTriggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);

  const displayName = headerDisplayName(email, userMetadata);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => setMounted(true), []);

  useOutsideClick(open, [rootRef, desktopPanelRef, mobilePanelRef], close);

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }

    function positionMenu() {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }

    positionMenu();
    window.addEventListener("resize", positionMenu);
    return () => window.removeEventListener("resize", positionMenu);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const panel = isMobile ? mobilePanelRef.current : desktopPanelRef.current;
    const focusFirst = () => {
      const nodes = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
      (nodes?.[0] ?? panel)?.focus?.();
    };
    const raf = window.requestAnimationFrame(focusFirst);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        const isMobileNow = window.matchMedia("(max-width: 767px)").matches;
        (isMobileNow ? mobileTriggerRef : desktopTriggerRef).current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, menuPos]);

  const billingItem = canManageBilling ? (
    <button
      type="button"
      role="menuitem"
      disabled={billingPending}
      className={`${menuItemClass} w-full text-left disabled:opacity-60`}
      onClick={async () => {
        setBillingPending(true);
        const result = await getCustomerPortalUrl();
        setBillingPending(false);
        close();
        if ("url" in result) {
          window.open(result.url, "_blank", "noopener,noreferrer");
          return;
        }
        if (result.error === "unauthenticated") {
          window.location.href = "/login?next=/account";
          return;
        }
        window.location.href = "/account?portal=no_customer";
      }}
    >
      <CreditCard className="size-4 text-pro-text-secondary" aria-hidden />
      {billingPending ? "Opening billing…" : "Billing"}
    </button>
  ) : (
    <Link href="/account" role="menuitem" className={menuItemClass} onClick={close}>
      <CreditCard className="size-4 text-pro-text-secondary" aria-hidden />
      Billing
    </Link>
  );

  const menuLinks = (
    <>
      {entitled ? (
        <>
          <li role="none">
            <Link href="/pro/app" role="menuitem" className={menuItemClass} onClick={close}>
              <LayoutGrid className="size-4 text-pro-text-secondary" aria-hidden />
              {PRO_STUDIO_NAV_LABEL}
            </Link>
          </li>
          <li role="none">
            <Link
              href="/pro/app/archives"
              role="menuitem"
              className={menuItemClass}
              onClick={close}
            >
              <Archive className="size-4 text-pro-text-secondary" aria-hidden />
              Archives
              {archivedCount > 0 ? (
                <span className="ml-auto rounded-md bg-pro-primary/20 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-pro-primary ring-1 ring-pro-primary/30">
                  {archivedCount}
                </span>
              ) : null}
            </Link>
          </li>
        </>
      ) : null}
      {showFreeCatalogInMenu ? (
        <li role="none">
          <Link href="/" role="menuitem" className={`${menuItemClass} font-medium`} onClick={close}>
            <ExternalLink className="size-4 text-pro-text-secondary" aria-hidden />
            Free catalog
          </Link>
        </li>
      ) : null}
      <li role="none">
        <Link href="/account" role="menuitem" className={menuItemClass} onClick={close}>
          <User className="size-4 text-pro-text-secondary" aria-hidden />
          Account
        </Link>
      </li>
      <li role="none">{billingItem}</li>
      {showLegalInMenu ? (
        <>
          <li role="none" className="my-1 border-t border-white/[0.06]" aria-hidden />
          <li role="none">
            <p className={sectionLabelClass}>Legal</p>
          </li>
          <li role="none">
            <Link href={PRO_PRIVACY_PATH} role="menuitem" className={menuItemClass} onClick={close}>
              Privacy &amp; data
            </Link>
          </li>
          <li role="none">
            <Link href={PRO_TERMS_PATH} role="menuitem" className={menuItemClass} onClick={close}>
              Terms of use
            </Link>
          </li>
        </>
      ) : null}
    </>
  );

  const menuPanel = (
    <>
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="truncate text-sm font-semibold text-pro-text">{displayName}</p>
        <p className="mt-0.5 truncate text-xs text-pro-text-secondary">{email}</p>
      </div>
      <ul className="py-1">{menuLinks}</ul>
      <div className="border-t border-white/[0.06] py-1">
        <form action={signOut}>
          <button
            type="submit"
            role="menuitem"
            className={`${menuItemClass} w-full text-left text-pro-text-secondary hover:text-pro-text`}
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </>
  );

  const desktopMenu =
    open && mounted && menuPos
      ? createPortal(
          <div
            ref={desktopPanelRef}
            id={menuId}
            role="menu"
            className="fixed z-[100] hidden w-64 overflow-hidden rounded-xl border border-white/[0.08] bg-pro-elevated shadow-xl shadow-black/40 ring-1 ring-white/[0.06] md:block"
            style={{ top: menuPos.top, right: menuPos.right }}
            data-pro-overlay=""
            onClick={(e) => e.stopPropagation()}
          >
            {menuPanel}
          </div>,
          document.body
        )
      : null;

  const mobileSheet =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Account menu"
            data-pro-overlay=""
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={close}
            />
            <nav
              ref={mobilePanelRef}
              id={menuId}
              tabIndex={-1}
              className="absolute left-4 right-4 top-[calc(var(--pro-app-header-height,3.25rem))] max-h-[min(85vh,28rem)] overflow-auto rounded-2xl border border-white/[0.1] bg-pro-elevated pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-xl focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              {menuPanel}
            </nav>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} className="relative flex items-center">
      <button
        ref={mobileTriggerRef}
        type="button"
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl p-2 text-pro-primary transition hover:bg-pro-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50 md:hidden"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={open ? "Close account menu" : `Account menu for ${displayName}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {open ? (
          <X className="size-6" aria-hidden />
        ) : mobileTrigger === "menu" ? (
          <Menu className="size-6" aria-hidden />
        ) : (
          <User className="size-6" strokeWidth={1.75} aria-hidden />
        )}
      </button>

      <button
        ref={desktopTriggerRef}
        type="button"
        className="hidden min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl p-2 text-pro-primary transition hover:bg-pro-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50 md:inline-flex"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={open ? "Close account menu" : `Account menu for ${displayName}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {open ? (
          <X className="size-6" aria-hidden />
        ) : (
          <User className="size-6" strokeWidth={1.75} aria-hidden />
        )}
      </button>

      {desktopMenu}
      {mobileSheet}
    </div>
  );
}
