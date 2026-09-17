type Props = {
  className?: string;
  onBrowseDirectory?: () => void;
};

/**
 * Thin catalog chrome for time-sensitive filmmaker news (Runway NLE + Sora sunset + Omni).
 * Rewrite after 24 Sep 2026 (Sora API) and 30 Sep 2026 (Omni Flash preview id).
 */
export function CatalogFreshnessNotice({
  className = "",
  onBrowseDirectory,
}: Props) {
  return (
    <aside
      role="status"
      className={`rounded-2xl border border-amber-800/45 bg-amber-950/25 px-4 py-3 text-left ${className}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200/85">
        Catalog note · 17 Sep 2026
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-[#d1d5db]">
        Runway Gen-4.5 and Aleph 2.0 now run on the web or inside Premiere Pro
        and After Effects — same credits; in Premiere, results land at the
        playhead. Sora API ends 24 Sep: export leftover clips this week, then
        generate in Veo, Kling, Seedance, Grok, or Runway. In Google Flow, use
        Omni 1.1 Flash; the preview endpoint dies 30 Sep.
      </p>
      {onBrowseDirectory ? (
        <button
          type="button"
          onClick={onBrowseDirectory}
          className="mt-2 text-sm font-medium text-[#e11d48] underline-offset-2 hover:underline"
        >
          Browse the updated directory
        </button>
      ) : null}
    </aside>
  );
}
