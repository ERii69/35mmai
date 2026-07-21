"use client";

import type { ProMarketingSectionLink } from "@/lib/pro/marketing-sections";
import { PRO_ABOUT_PAGE_SECTIONS } from "@/lib/pro/marketing-sections";

const jumpLink =
  "rounded-full px-3 py-1.5 text-xs font-medium text-pro-text-secondary ring-1 ring-white/[0.08] transition hover:bg-pro-accent/10 hover:text-pro-accent-bright hover:ring-pro-accent/25";

type Props = {
  sections?: ProMarketingSectionLink[];
};

/** Mobile marketing — in-page section jump pills. */
export function ProMarketingSectionNav({ sections = PRO_ABOUT_PAGE_SECTIONS }: Props) {
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label="Page sections"
    >
      {sections.map(({ href, label }) => (
        <a key={href} href={href} className={jumpLink}>
          {label}
        </a>
      ))}
    </nav>
  );
}

/** @deprecated Use ProMarketingSectionNav */
export function ProMarketingAboutSectionNav() {
  return <ProMarketingSectionNav sections={PRO_ABOUT_PAGE_SECTIONS} />;
}
