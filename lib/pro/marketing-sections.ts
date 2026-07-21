/** In-page jump targets for mobile marketing layouts. */

export type ProMarketingSectionLink = {
  href: string;
  label: string;
};

export const PRO_SUBSCRIBE_PAGE_SECTIONS: ProMarketingSectionLink[] = [
  { href: "#pro-steps", label: "How Pro works" },
  { href: "#pro-subscribe", label: "Request access" },
];

export const PRO_ABOUT_PAGE_SECTIONS: ProMarketingSectionLink[] = [
  { href: "/pro#pro-steps", label: "How Pro works" },
  { href: "#about-features", label: "Features" },
  { href: "#about-compare", label: "Compare" },
  { href: "/pro#pro-subscribe", label: "Pricing" },
];
