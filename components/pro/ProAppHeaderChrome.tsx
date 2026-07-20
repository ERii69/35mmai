"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { proWebShell } from "@/components/pro/ux/pro-surfaces";

type Props = {
  /** Left cluster (logo) — mobile single-row header. */
  leading: ReactNode;
  /** Center (project switcher) — mobile only; frees a second sticky nav row. */
  mobileCenter?: ReactNode;
  /** Right cluster (badge + account). */
  trailing: ReactNode;
  /** Desktop nav row (md+). */
  nav: ReactNode;
};

/** Sticky header — single row on mobile; measures --pro-app-header-height for workspace stickies. */
export function ProAppHeaderChrome({ leading, mobileCenter, trailing, nav }: Props) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const host =
      (el.closest("[data-pro-app-shell]") as HTMLElement | null) ??
      (el.parentElement as HTMLElement | null) ??
      document.documentElement;
    const node = el;

    function publish() {
      host.style.setProperty("--pro-app-header-height", `${node.offsetHeight}px`);
    }

    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(node);
    return () => {
      ro.disconnect();
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-white/[0.06] bg-pro-base/95 pt-[env(safe-area-inset-top)] backdrop-blur-md"
    >
      <div className={proWebShell.headerInner}>
        <div className="flex items-center gap-2 py-1 md:justify-between md:py-2.5">
          <div className="flex shrink-0 items-center">{leading}</div>
          {mobileCenter ? (
            <div className="min-w-0 flex-1 md:hidden">{mobileCenter}</div>
          ) : null}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4">{trailing}</div>
        </div>
        {nav}
      </div>
    </header>
  );
}
