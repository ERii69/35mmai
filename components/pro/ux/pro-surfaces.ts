import { proColors } from "@/components/pro/ux/pro-design";

/** Shared Pro web shell — cinematic bg, max-w-pro, page titles (md+). */
export const proWebShell = {
  root: "pro-cinematic-bg relative flex flex-1 flex-col font-sans text-pro-text",
  inner: "relative z-10 flex flex-1 flex-col",
  headerInner: "mx-auto w-full max-w-pro px-4 sm:px-6",
  main: "mx-auto w-full max-w-pro px-4 py-4 sm:px-6 md:py-6 lg:py-10",
  mainNarrow: "mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8 lg:py-10",
  pageTitle: "text-xl font-bold tracking-tight text-pro-text sm:text-2xl lg:text-3xl",
  heroTitle:
    "text-4xl font-bold leading-tight tracking-tight text-pro-text sm:text-5xl md:text-[3.25rem]",
  headerLogo: "h-[28px] text-[28px] md:h-[32px] md:text-[32px]",
  statusBanner:
    "border-b border-pro-warning/30 bg-pro-warning/10 px-4 py-2 text-center text-sm text-pro-warning",
} as const;

export const proFooter = {
  root: "mt-auto shrink-0 border-t border-white/[0.06] py-6 text-center text-sm text-pro-text-secondary md:py-8",
  link: "text-pro-text-secondary underline-offset-2 transition hover:text-pro-text hover:underline",
  muted: "text-xs text-pro-text-secondary/80",
  dot: "text-pro-text-secondary/35",
} as const;

/** Shared Pro workspace surface tokens — cinematic calm, minimal borders. */
export const proSurface = {
  page: "space-y-8",
  section:
    "rounded-2xl bg-pro-elevated/90 p-6 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.65)] sm:p-8",
  sectionActive:
    "rounded-2xl bg-gradient-to-b from-[#1c1c1e] to-pro-muted p-6 shadow-[0_0_0_1px_rgba(200,16,46,0.18),0_12px_40px_-12px_rgba(0,0,0,0.7)] sm:p-8",
  sectionMuted: "rounded-2xl bg-pro-muted/80 p-5 sm:p-6",
  card: "rounded-xl bg-pro-elevated/80 p-4 ring-1 ring-white/[0.06]",
  group: "space-y-6",
  stack: "space-y-5",
  field:
    "w-full rounded-xl bg-pro-muted px-3.5 py-2.5 text-[15px] leading-normal text-pro-text shadow-inner shadow-black/25 outline-none ring-1 ring-white/[0.06] focus-visible:ring-2 focus-visible:ring-pro-primary/50",
  fieldMono: "font-mono text-sm leading-relaxed",
} as const;

/** Auth / marketing pages (login, sign-up, account) */
export const proAuth = {
  page: "flex flex-1 flex-col px-4 py-8 text-pro-text sm:px-6 md:py-10 lg:py-12",
  shell: "mx-auto flex w-full max-w-sm flex-col items-stretch gap-7",
  shellWide: "mx-auto flex w-full max-w-md flex-col items-stretch gap-6 md:max-w-xl",
  card: "space-y-4 rounded-2xl border border-white/[0.06] bg-pro-elevated/90 p-6 shadow-lg ring-1 ring-white/[0.04]",
  cardInner: "rounded-xl border border-white/[0.06] bg-pro-muted/40 p-3",
  label: "mb-1.5 block text-sm text-pro-text-secondary",
  link: "font-medium text-pro-text underline-offset-2 transition hover:text-pro-text/90 hover:underline",
  mutedLink: "text-pro-text-secondary underline-offset-2 transition hover:text-pro-text hover:underline",
} as const;

export const proBtn = {
  /** Quiet primary — elevated fill (PRO seal stays the only bright red). */
  primary: `inline-flex items-center justify-center gap-2 rounded-xl bg-pro-elevated px-5 py-2.5 text-[15px] font-semibold text-pro-text ring-1 ring-white/[0.14] shadow-sm transition hover:bg-pro-muted hover:ring-white/22 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:pointer-events-none disabled:opacity-50`,
  primaryLg: `inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pro-success to-emerald-400 px-6 py-3.5 text-base font-semibold text-[#0a0a0a] shadow-xl shadow-emerald-900/30 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-success/50 sm:w-auto`,
  ctaHero: `inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pro-elevated px-8 py-4 text-base font-semibold text-pro-text ring-1 ring-white/[0.16] shadow-lg transition hover:bg-pro-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 sm:w-auto`,
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-pro-secondary/80 px-4 py-2.5 text-[15px] font-medium text-pro-text ring-1 ring-white/[0.08] transition hover:bg-pro-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
  ghost:
    "text-[15px] text-pro-text-secondary underline-offset-2 transition hover:text-pro-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/40",
  /** Secondary actions in Look / Production toolbars */
  outline:
    "rounded-xl border border-white/[0.12] bg-pro-elevated/70 text-pro-text-secondary shadow-sm transition hover:border-white/22 hover:bg-pro-muted hover:text-pro-text active:scale-[0.98] active:bg-pro-muted/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/40 disabled:pointer-events-none disabled:opacity-50",
  /** Distinct from primary generate actions — apply/sync across shots */
  apply:
    "rounded-xl bg-gradient-to-r from-pro-success to-emerald-400 px-5 font-semibold text-[#0a0a0a] shadow-lg shadow-emerald-900/25 transition hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-success/50 disabled:pointer-events-none disabled:opacity-50",
  /** Toolbar ghost (exports, tertiary) */
  ghostToolbar:
    "rounded-xl text-pro-text-secondary transition hover:bg-pro-muted hover:text-pro-text active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/40",
  /** Full-width auth submit — quiet (not PRO red) */
  primaryFull: `inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pro-elevated px-5 py-3 text-[15px] font-semibold text-pro-text ring-1 ring-white/[0.14] shadow-sm transition hover:bg-pro-muted hover:ring-white/22 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:pointer-events-none disabled:opacity-50`,
  /** Marketing CTAs — quiet elevated (PRO seal owns bright red) */
  marketingPrimary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-pro-elevated px-5 py-2.5 text-[15px] font-semibold text-pro-text ring-1 ring-white/[0.14] shadow-sm transition hover:bg-pro-muted hover:ring-white/22 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:pointer-events-none disabled:opacity-50",
  /** Dashboard — open workspace (subtle primary outline, no red fill) */
  dashboardOpenOutline: `inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.16] bg-transparent px-4 py-2.5 text-sm font-semibold text-pro-text transition hover:bg-white/[0.06] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20`,
  /** Top-corner dismiss (kit / mood board pattern) */
  cardDismiss:
    "absolute right-3 top-3 z-20 rounded-lg bg-black/50 p-1.5 text-pro-text-secondary opacity-0 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-black/70 hover:text-pro-warning focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50 group-hover:opacity-100",
  /** Dashboard project cards — orange = secondary / destructive hover only */
  cardAction:
    "text-xs text-pro-text-secondary transition hover:text-pro-warning disabled:opacity-50",
  cardActionDanger:
    "text-xs text-pro-text-secondary transition hover:text-pro-warning disabled:opacity-50",
  cardActionsRow:
    "opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 max-sm:opacity-100",
} as const;

/** Dashboard layout — fixed card width; count changes only add/remove rows, not column size. */
export const proDashboardGrid =
  "grid w-full grid-cols-[repeat(auto-fill,minmax(min(100%,17.5rem),1fr))] gap-3 sm:gap-4";

/** @deprecated Use proDashboardGrid — kept for imports that expect the old name. */
export const proDashboardGridWide = proDashboardGrid;

/** Quick start / secondary dashboard cards — match project card shell. */
export const proDashboardActionCard =
  "group flex h-full min-h-[11.5rem] flex-col rounded-2xl bg-pro-elevated p-5 ring-1 ring-white/[0.08] transition-all duration-200 hover:bg-pro-elevated/95 hover:ring-pro-primary/25 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/40 sm:p-6";

export const proDashboardActionCardMuted =
  "flex h-full min-h-[11.5rem] flex-col rounded-2xl bg-pro-elevated/60 p-5 opacity-60 ring-1 ring-white/[0.06] sm:p-6";

/** Dashboard project cards — desktop grid (compact). */
export const proProjectCardDesktop = {
  base: "relative flex h-full min-h-[11.5rem] flex-col rounded-xl p-4 ring-1 ring-white/[0.08] transition-[box-shadow,ring-color,background-color] duration-200",
  stat: "flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-pro-muted/90 px-2.5 py-2 ring-1 ring-white/[0.05]",
} as const;

/** Dashboard project cards */
export const proProjectCard = {
  base: "flex h-full flex-col rounded-2xl p-5 ring-1 ring-white/[0.08] transition-all duration-200 sm:p-6",
  default:
    "bg-gradient-to-br from-pro-primary/[0.14] via-pro-elevated to-pro-elevated ring-2 ring-pro-primary/45 shadow-[0_0_0_1px_rgba(227,6,19,0.2),0_8px_24px_-12px_rgba(200,16,46,0.28)]",
  defaultMobile:
    "bg-pro-elevated ring-2 ring-pro-primary/35",
  standard:
    "bg-pro-elevated hover:bg-pro-elevated/95 hover:ring-pro-primary/25 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)]",
  clickable:
    "group relative cursor-pointer transition hover:ring-pro-primary/30 focus-within:ring-2 focus-within:ring-pro-primary/40",
  stat: "flex min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-pro-muted/90 px-3.5 py-3 ring-1 ring-white/[0.05] sm:gap-3",
  statHiddenSm: "hidden sm:flex",
} as const;

export const proEmptyState = {
  card: "flex flex-col rounded-2xl bg-pro-elevated/90 p-6 ring-1 ring-white/[0.08] sm:p-7",
  iconWrap:
    "mb-4 flex size-12 items-center justify-center rounded-xl bg-pro-muted text-pro-text-secondary ring-1 ring-white/[0.06]",
} as const;

/** Compact dashboard strip (subscription, etc.) */
export const proSurfaceCompact = {
  strip:
    "rounded-xl bg-pro-elevated/80 px-4 py-3 ring-1 ring-white/[0.06] sm:px-5 sm:py-3.5",
} as const;

export const proFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-pro-base";

const navFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-pro-base";

/** Compact nav pill for mobile header / dense chrome — 44px min touch target. */
export function proNavPillCompact(active: boolean, muted = false): string {
  const pill = proNavPill(active, muted);
  return `${pill} min-h-11 min-w-[2.75rem] px-2.5 py-2 text-xs`;
}

/** Secondary workspace sub-tabs (mobile) — slightly denser than primary shell pills. */
export function proNavPillDense(active: boolean, muted = false): string {
  const pill = proNavPill(active, muted);
  return `${pill} min-h-9 min-w-[2.5rem] px-2.5 py-1.5 text-xs`;
}

/** Header nav pills (Dashboard, Workspace, auth shortcuts) */
export function proNavPill(active: boolean, muted = false): string {
  if (muted && !active) {
    return `inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/[0.06] bg-pro-muted/40 px-3 py-2 text-sm font-medium text-pro-text-secondary/50 transition hover:border-white/10 hover:bg-pro-muted/60 hover:text-pro-text-secondary/70 ${navFocus}`;
  }
  return active
    ? `inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-pro-primary/40 bg-pro-primary/15 px-3 py-2 text-sm font-medium text-pro-text ring-1 ring-pro-primary/20 transition ${navFocus}`
    : `inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/[0.1] bg-pro-elevated/80 px-3 py-2 text-sm font-medium text-pro-text-secondary transition hover:border-white/20 hover:bg-pro-muted hover:text-pro-text ${navFocus} active:scale-[0.98]`;
}

/** Single-row scrollable app nav on mobile; wraps from md+. */
export const proNavScroll =
  "-mx-4 flex flex-nowrap items-center gap-1 overflow-x-auto overscroll-x-contain px-4 pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex-wrap md:gap-2 md:overflow-visible md:px-0 md:pb-0";

export const proNavTextLink =
  "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-sm text-pro-text-secondary transition hover:bg-pro-muted/80 hover:text-pro-text active:scale-[0.98]";

/** Nav / section count pill (Archives, project totals). */
export const proNavCountBadge =
  "min-w-[1.125rem] rounded-md bg-pro-primary/20 px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums text-pro-primary ring-1 ring-pro-primary/30";

/** Mobile workspace mode segmented control (Script · Look · Finish). */
export function proModeSegmentedItem(active: boolean): string {
  return active
    ? "flex min-h-11 flex-1 items-center justify-center rounded-xl bg-pro-elevated py-2.5 text-center text-xs font-semibold text-pro-text shadow-sm ring-1 ring-white/[0.1]"
    : "flex min-h-11 flex-1 items-center justify-center rounded-xl py-2.5 text-center text-xs font-medium text-pro-text-secondary transition active:scale-[0.98] hover:text-pro-text";
}

export const proModeSegmentedTrack =
  "flex w-full rounded-xl bg-pro-muted/80 p-0.5 ring-1 ring-white/[0.08] md:hidden";

/** Fade hint for horizontal nav scroll (mobile). */
export const proNavScrollFade =
  "pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-pro-base via-pro-base/80 to-transparent md:hidden";

/** Compact dashboard project row (mobile). */
export const proProjectRowMobile = {
  base: "relative flex min-h-[52px] items-center gap-3 rounded-xl px-3.5 py-3 ring-1 ring-white/[0.08] transition active:scale-[0.99] active:bg-pro-muted/30",
  default: "bg-pro-elevated ring-2 ring-pro-primary/35",
  standard: "bg-pro-elevated/90 hover:bg-pro-elevated",
} as const;

