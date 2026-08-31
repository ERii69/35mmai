type Props = {
  className?: string;
  onBrowseDirectory?: () => void;
};

/**
 * Thin catalog chrome for time-sensitive filmmaker news (Sora sunset + Flow/Omni).
 * Remove or rewrite after 24 Sep 2026.
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
        Catalog note · 24 Sep 2026
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-[#d1d5db]">
        Sora API shuts on that date — export remaining clips, then generate in
        Veo, Kling, Seedance, Grok, or Runway, not Sora. Google Flow now
        includes Gemini Omni 1.1 Flash for draft, extend, and first/last-frame
        edits.
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
