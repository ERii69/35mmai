"use client";

import { usePathname } from "next/navigation";
import { ProSiteFooter } from "@/components/pro/ProSiteFooter";
import { SiteFooter } from "@/components/site/SiteFooter";

function isProSurface(pathname: string): boolean {
  return (
    pathname === "/about" ||
    pathname === "/account" ||
    pathname === "/login" ||
    pathname === "/sign-up" ||
    pathname.startsWith("/pro") ||
    pathname.startsWith("/auth")
  );
}

export function SiteFooterSwitch({ liveRelease = false }: { liveRelease?: boolean }) {
  const pathname = usePathname() ?? "";
  if (isProSurface(pathname)) return <ProSiteFooter liveRelease={liveRelease} />;
  return <SiteFooter />;
}
