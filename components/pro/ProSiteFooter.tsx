"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import { PRO_PRIVACY_PATH, PRO_TERMS_PATH } from "@/lib/pro/membership-policy";
import { proFooter } from "@/components/pro/ux/pro-surfaces";

type Props = {
  className?: string;
};

/** Pro surfaces footer — Privacy, Terms, catalog link. Hide Subscribe in entitled app. */
export function ProSiteFooter({ className = "" }: Props) {
  const pathname = usePathname() ?? "";
  const inEntitledApp = pathname.startsWith("/pro/app") || pathname === "/account";

  return (
    <footer className={`${proFooter.root} ${className}`}>
      <div className={`mx-auto max-w-pro px-6 ${proFooter.muted}`}>
        <p className="text-sm text-pro-text-secondary">
          © 2026 {BRAND_NAME_PRO} · Built for independent filmmakers
        </p>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
          <Link href={PRO_PRIVACY_PATH} className={proFooter.link}>
            Privacy &amp; data
          </Link>
          <span className={proFooter.dot} aria-hidden>
            ·
          </span>
          <Link href={PRO_TERMS_PATH} className={proFooter.link}>
            Terms
          </Link>
          {!inEntitledApp ? (
            <>
              <span className={proFooter.dot} aria-hidden>
                ·
              </span>
              <Link href="/pro" className={proFooter.link}>
                Subscribe
              </Link>
            </>
          ) : null}
          <span className={proFooter.dot} aria-hidden>
            ·
          </span>
          <Link href="/" className={proFooter.link}>
            Free catalog
          </Link>
        </p>
        <p className="mt-6 text-xs text-pro-text-secondary/60">
          Made for the film community
        </p>
      </div>
    </footer>
  );
}
