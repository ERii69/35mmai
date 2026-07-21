"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRO_MARKETING_HEADLINE, PRO_MARKETING_HERO } from "@/lib/pro/marketing-copy";
import { PRO_SUBSCRIBE_PAGE_SECTIONS } from "@/lib/pro/marketing-sections";
import { BRAND_NAME } from "@/lib/brand/brand-identity";
import {
  ProMarketingLegalMenu,
  marketingNavLink,
} from "@/components/pro/ProMarketingLegalMenu";

export const PRO_SUBSCRIBE_PATH = "/pro";

type Props = {
  variant?: "desktop" | "mobile";
  /** Pre-subscribe only — hide when the user has Pro access. */
  showLegal?: boolean;
  showSubscribe?: boolean;
  showFreeCatalog?: boolean;
  /** In-page jumps on /pro (Workflows · Steps). */
  showInPageSections?: boolean;
  onNavigate?: () => void;
};

const subscribeTitle = `${PRO_MARKETING_HERO} — ${PRO_MARKETING_HEADLINE}`;

/** Shared site links for marketing / auth shells — no Subscribe / Free catalog (logo covers those). */
export function ProMarketingSiteNavLinks({
  variant = "desktop",
  showLegal = true,
  showSubscribe = false,
  showFreeCatalog = false,
  showInPageSections = false,
  onNavigate,
}: Props) {
  const pathname = usePathname();
  const onSubscribePage = pathname === PRO_SUBSCRIBE_PATH;

  if (variant === "mobile") {
    return (
      <>
        {showInPageSections
          ? PRO_SUBSCRIBE_PAGE_SECTIONS.filter((s) => s.href !== "#pro-subscribe").map(
              ({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-pro-text transition hover:bg-white/[0.06]"
                  onClick={onNavigate}
                >
                  {label === "Steps" ? "How it works" : label}
                </a>
              )
            )
          : null}
        {showSubscribe && !onSubscribePage ? (
          <Link
            href={PRO_SUBSCRIBE_PATH}
            title={subscribeTitle}
            className="block rounded-xl px-4 py-3 text-base font-medium text-pro-text transition hover:bg-white/[0.06]"
            onClick={onNavigate}
          >
            Subscribe
          </Link>
        ) : null}
        {showFreeCatalog ? (
          <Link
            href="/"
            className="block rounded-xl px-4 py-3 text-base font-medium text-pro-text transition hover:bg-white/[0.06]"
            onClick={onNavigate}
          >
            Free {BRAND_NAME} catalog
          </Link>
        ) : null}
        {showLegal ? (
          <ProMarketingLegalMenu variant="stack" onNavigate={onNavigate} />
        ) : null}
      </>
    );
  }

  return (
    <>
      {showInPageSections
        ? PRO_SUBSCRIBE_PAGE_SECTIONS.filter((s) => s.href !== "#pro-subscribe").map(
            ({ href, label }) => (
              <a key={href} href={href} className={marketingNavLink}>
                {label === "Steps" ? "How it works" : label}
              </a>
            )
          )
        : null}
      {showSubscribe && !onSubscribePage ? (
        <Link href={PRO_SUBSCRIBE_PATH} title={subscribeTitle} className={marketingNavLink}>
          Subscribe
        </Link>
      ) : null}
      {showFreeCatalog ? (
        <Link href="/" className={marketingNavLink}>
          Free {BRAND_NAME}
        </Link>
      ) : null}
      {showLegal ? <ProMarketingLegalMenu variant="dropdown" /> : null}
    </>
  );
}
