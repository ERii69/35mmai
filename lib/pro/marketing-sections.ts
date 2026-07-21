/** In-page jump targets for mobile marketing layouts. */

export type ProMarketingSectionLink = {
  href: string;
  label: string;
};

export const PRO_SUBSCRIBE_PAGE_SECTIONS: ProMarketingSectionLink[] = [
  { href: "#pro-steps", label: "How Pro works" },
  { href: "#pro-workflows", label: "Workflows" },
  { href: "#pro-compare", label: "Compare" },
  { href: "#pro-subscribe", label: "Pricing" },
];

export const PRO_ABOUT_PAGE_SECTIONS: ProMarketingSectionLink[] = [
  { href: "/pro#pro-workflows", label: "Workflows" },
  { href: "#about-features", label: "Features" },
  { href: "#about-compare", label: "Compare" },
  { href: "/pro#pro-subscribe", label: "Pricing" },
];
