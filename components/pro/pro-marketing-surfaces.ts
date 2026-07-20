/** Shared surfaces for /pro marketing. */
export const proMarketing = {
  heroIcon: "text-pro-accent",
  accentBadge:
    "rounded-full border border-pro-accent/35 bg-pro-accent/10 px-2 py-px text-[10px] font-semibold text-pro-accent-bright",
  accentLink:
    "font-medium text-pro-accent-bright underline-offset-2 transition hover:text-pro-accent hover:underline",
  checkPro: "text-pro-accent/90",
  /** Primary conversion CTA on public marketing pages (cinematic red). */
  ctaPrimary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-pro-primary px-5 py-2.5 text-[15px] font-semibold text-white shadow-lg shadow-pro-primary/30 transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50 disabled:pointer-events-none disabled:opacity-50",
  compareLabel: "text-[10px] font-semibold uppercase tracking-[0.14em] text-pro-text-secondary",
  /** Centered column — compare, subscribe, and feature cards share the same width. */
  cardStack: "mx-auto w-full max-w-3xl space-y-10",
  section: "space-y-3",
  card:
    "w-full overflow-hidden rounded-xl border border-white/[0.08] bg-pro-elevated/90",
  proPanel:
    "flex w-full flex-col rounded-xl border border-white/[0.08] bg-pro-elevated/90 p-6 sm:p-7",
  proTile:
    "flex h-full min-h-0 w-full flex-col rounded-xl border border-white/[0.08] bg-pro-elevated/90 p-4 sm:p-5",
  proIcon:
    "mb-3 inline-flex size-9 items-center justify-center rounded-lg bg-white/[0.06] text-pro-text-secondary",
  featureGrid: "grid w-full auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2",
} as const;
