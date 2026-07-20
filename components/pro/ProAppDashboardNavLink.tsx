"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { proTapHaptic } from "@/lib/pro/haptic";

type Props = {
  className: string;
  children: ReactNode;
};

/** Mobile Dashboard nav — navigate to /pro/app or scroll to top when already there. */
export function ProAppDashboardNavLink({ className, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const onDashboard = pathname === "/pro/app";

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    proTapHaptic();
    if (onDashboard) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/pro/app");
  }

  return (
    <Link
      href="/pro/app"
      className={className}
      aria-current={onDashboard ? "page" : undefined}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
