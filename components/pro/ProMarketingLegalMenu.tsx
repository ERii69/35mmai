"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { PRO_PRIVACY_PATH, PRO_TERMS_PATH } from "@/lib/pro/membership-policy";
import { useOutsideClick } from "@/lib/pro/use-outside-click";

export const marketingNavLink =
  "text-pro-text-secondary underline-offset-2 transition hover:text-pro-text hover:underline";

const menuItemClass =
  "flex w-full px-4 py-2.5 text-left text-sm text-pro-text transition hover:bg-pro-muted/80";

type Props = {
  /** Desktop dropdown trigger; mobile stacked links with label. */
  variant?: "dropdown" | "stack";
  onNavigate?: () => void;
};

/** Privacy & Terms grouped under one nav item. */
export function ProMarketingLegalMenu({ variant = "dropdown", onNavigate }: Props) {
  const pathname = usePathname();
  const active = pathname === PRO_PRIVACY_PATH || pathname === PRO_TERMS_PATH;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; minWidth: number } | null>(
    null
  );

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => setMounted(true), []);

  useOutsideClick(open, [triggerRef, panelRef], close);

  useEffect(() => {
    if (!open || variant !== "dropdown") {
      setMenuPos(null);
      return;
    }

    function positionMenu() {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        left: Math.max(8, rect.left),
        minWidth: 176,
      });
    }

    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open, variant]);

  function handleNavClick() {
    close();
    onNavigate?.();
  }

  const links = (
    <>
      <Link
        href={PRO_PRIVACY_PATH}
        role="menuitem"
        className={variant === "stack" ? mobileLinkClass(active && pathname === PRO_PRIVACY_PATH) : menuItemClass}
        onClick={handleNavClick}
      >
        Privacy &amp; data
      </Link>
      <Link
        href={PRO_TERMS_PATH}
        role="menuitem"
        className={variant === "stack" ? mobileLinkClass(active && pathname === PRO_TERMS_PATH) : menuItemClass}
        onClick={handleNavClick}
      >
        Terms of use
      </Link>
    </>
  );

  if (variant === "stack") {
    return (
      <div className="space-y-1">
        <p className="px-4 pt-2 text-[11px] font-semibold uppercase tracking-wide text-pro-text-secondary">
          Legal
        </p>
        {links}
      </div>
    );
  }

  const menu =
    open && mounted && menuPos
      ? createPortal(
          <div
            ref={panelRef}
            id={menuId}
            role="menu"
            className="fixed z-[100] overflow-hidden rounded-xl border border-white/[0.08] bg-pro-elevated py-1 shadow-xl shadow-black/40 ring-1 ring-white/[0.06]"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              minWidth: menuPos.minWidth,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {links}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`inline-flex items-center gap-1 ${marketingNavLink} ${active ? "text-pro-text" : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        Legal
        <ChevronDown
          className={`size-3.5 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {menu}
    </>
  );
}

function mobileLinkClass(active: boolean) {
  return `block rounded-xl px-4 py-3 text-base font-medium transition hover:bg-white/[0.06] ${
    active ? "text-pro-text" : "text-pro-text-secondary"
  }`;
}
