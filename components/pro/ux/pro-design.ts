/**
 * Color roles (35mmAiPro):
 * - primary = cinematic red (#C8102E) — CTAs, nav active, PRO seal, urgency
 * - cinematic-bright (#E30613) — seal/logo gradient highlight only
 * - accent (amber/gold) — rare highlights only (not primary CTAs)
 * - warning (orange) — caution / secondary destructive hover
 * - success (green) — trust / status only
 */

export const proColors = {
  primary: "#C8102E",
  primaryHover: "#A50E26",
  cinematic: "#C8102E",
  cinematicBright: "#E30613",
  accent: "#FBBF24",
  accentBright: "#FCD34D",
  accentMuted: "#D97706",
  secondary: "#3A3A3C",
  success: "#30D158",
  warning: "#FF9F0A",
  textPrimary: "#F5F5F7",
  textSecondary: "#B4B4BA",
  textMuted: "#8E8E93",
  bgBase: "#0f0f0f",
  bgElevated: "#1a1a1a",
  bgSurface: "#111111",
  bgMuted: "#0d0d0d",
} as const;

/** Control language — one radius per role. */
export const proRadius = {
  /** Buttons, nav pills, fields, FABs */
  control: "rounded-xl",
  /** Sections, modals, large cards */
  surface: "rounded-2xl",
  /** PRO seal / compact badges */
  badge: "rounded-lg",
  /** Tiny count chips only */
  chip: "rounded-md",
} as const;

export const proLayout = {
  maxWidth: "max-w-7xl",
  sectionGap: "space-y-10",
  blockGap: "space-y-7",
  innerGap: "space-y-5",
  sectionPad: "py-6 sm:py-8",
} as const;

export const proType = {
  body: "text-[15px] leading-[1.55] text-pro-text-secondary",
  bodyStrong: "text-[15px] leading-[1.55] font-medium text-pro-text",
  headingLg: "text-2xl font-bold tracking-tight text-pro-text sm:text-[1.75rem]",
  headingMd: "text-lg font-semibold text-pro-text",
  headingSm: "text-sm font-semibold text-pro-text",
  label: "text-[11px] font-semibold uppercase tracking-[0.14em] text-pro-text-secondary",
  caption: "text-xs leading-[1.5] text-pro-text-secondary",
} as const;
