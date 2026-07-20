"use client";

import { useRouter } from "next/navigation";
import { proTapHaptic } from "@/lib/pro/haptic";
import { useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function ProDashboardPullRefresh({ children }: Props) {
  const router = useRouter();
  const startY = useRef(0);
  const pulling = useRef(false);
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  function onTouchStart(e: React.TouchEvent) {
    if (window.scrollY > 0 || refreshing) return;
    startY.current = e.touches[0]?.clientY ?? 0;
    pulling.current = true;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!pulling.current || refreshing) return;
    const y = e.touches[0]?.clientY ?? 0;
    const delta = Math.max(0, Math.min(72, y - startY.current));
    setOffset(delta);
  }

  function onTouchEnd() {
    if (!pulling.current) return;
    pulling.current = false;
    if (offset >= 56 && !refreshing) {
      setRefreshing(true);
      setOffset(40);
      proTapHaptic(12);
      router.refresh();
      window.setTimeout(() => {
        setRefreshing(false);
        setOffset(0);
      }, 600);
      return;
    }
    setOffset(0);
  }

  return (
    <div
      className="relative md:touch-auto"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {offset > 0 || refreshing ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-1 text-xs text-pro-text-secondary transition-transform md:hidden"
          style={{ transform: `translateY(${offset}px)` }}
          aria-live="polite"
        >
          {refreshing ? "Refreshing…" : offset >= 56 ? "Release to refresh" : "Pull to refresh"}
        </div>
      ) : null}
      <div
        className="transition-transform duration-200 md:transform-none"
        style={{ transform: offset ? `translateY(${offset}px)` : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
