"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isSiteNavCurrent, SITE_PRIMARY_NAV } from "@/lib/site-primary-nav";

type Props = {
  className?: string;
};

const linkClass =
  "rounded-lg px-2 py-1.5 text-[#d1d5db] transition hover:text-[#e11d48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48]";

/** Catalog menu — used on Pro, sign-in, and the signed-in workspace so the header stays the same. */
export function SitePrimaryNav({ className }: Props) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Primary"
      className={
        className ??
        "order-last flex w-full flex-wrap items-center justify-center gap-x-1 gap-y-1 text-sm lg:order-none lg:w-auto lg:flex-1 lg:gap-x-3"
      }
    >
      {SITE_PRIMARY_NAV.map((item) => {
        const current = isSiteNavCurrent(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`${linkClass} ${current ? "text-white" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
