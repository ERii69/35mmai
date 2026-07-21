"use client";

import Link from "next/link";
import { BRAND_NAME, BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import { PRO_MARKETING_BETA_SLA } from "@/lib/pro/marketing-copy";
import { PRO_PRIVACY_PATH, PRO_TERMS_PATH } from "@/lib/pro/membership-policy";
import { proFooter } from "@/components/pro/ux/pro-surfaces";

type Props = {
  className?: string;
};

/** Pro footer — follows the live 35mmAi footer, with Pro legal links. */
export function ProSiteFooter({ className = "" }: Props) {
  return (
    <footer className={`${proFooter.root} ${className}`}>
      <div className={`mx-auto max-w-5xl px-6 ${proFooter.muted}`}>
        <p className="text-sm text-pro-text-secondary">
          © 2026 {BRAND_NAME} • Built for independent filmmakers
        </p>
        <p className="mt-2 text-xs text-pro-text-secondary/80">
          Free catalog discovers tools · {BRAND_NAME_PRO} turns script + look into prompt packs
        </p>
        <p className="mt-2 text-xs text-pro-text-secondary/70">{PRO_MARKETING_BETA_SLA}</p>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
          <Link href="/about" className={proFooter.link}>
            About
          </Link>
          <span className={proFooter.dot} aria-hidden>
            ·
          </span>
          <Link href="/pro" className={proFooter.link}>
            Pro
          </Link>
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
          <Link href={PRO_PRIVACY_PATH} className={proFooter.link}>
            Privacy &amp; data
          </Link>
          <span className={proFooter.dot} aria-hidden>
            ·
          </span>
          <Link href={PRO_TERMS_PATH} className={proFooter.link}>
            Terms
          </Link>
        </p>
        <p className="mt-6 text-xs text-pro-text-secondary/60">
          Made with ❤️ for the film community
        </p>
      </div>
    </footer>
  );
}
