type Props = {
  className?: string;
};

/** Change this when the catalog note is rewritten. About uses the same date. */
export const CATALOG_AS_OF_LABEL = "October 10, 2026";

/**
 * Thin catalog chrome for time-sensitive filmmaker news.
 * Rewrite when Kling 4.0 or a new flagship becomes the public default.
 */
export function CatalogFreshnessNotice({ className = "" }: Props) {
  return (
    <aside
      className={`rounded-2xl border border-amber-800/45 bg-amber-950/25 px-4 py-3 text-left ${className}`}
    >
      <p className="text-[11px] font-semibold tracking-[0.14em] text-amber-200/85">
        <span className="uppercase">Catalog note</span>
        <span> · {CATALOG_AS_OF_LABEL}</span>
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-[#d1d5db]">
        Argil joins the catalog: a brief becomes a storyboard, then a short
        film. Kling 4.0 is announced, not the default.
      </p>
      <details className="group mt-2">
        <summary className="cursor-pointer list-none text-sm font-medium text-[#e11d48] underline-offset-2 marker:content-none hover:underline [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Read the briefing</span>
          <span className="hidden group-open:inline">Hide the briefing</span>
        </summary>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#d1d5db]">
          <p>
            <span className="font-medium text-[#f5f5f5]">Argil is in.</span>{" "}
            Open argil.ai with a sentence or a script. It builds a storyboard
            you can change, then renders the short. Characters and places can
            be reused. It does not replace a Midjourney still or a Kling move.
          </p>
          <p>
            <span className="font-medium text-[#f5f5f5]">
              Kling 4.0 is not the shoot model yet.
            </span>{" "}
            Announced September 28, 2026: up to 30 seconds, stereo audio, as many as 15
            references, with 4K 10-bit HDR still marked coming soon. Only Flash
            is open, at 720p, for Ultra yearly subscribers. Kling 3.0 stays the
            public default.
          </p>
          <p>
            <span className="font-medium text-[#f5f5f5]">
              The quality board moved.
            </span>{" "}
            On Artificial Analysis’s text-to-video-with-audio board, Wan 3.0
            leads, then Utopai X, Seedance 2.5, and MiniMax H3. Gemini Omni
            Flash 1.1 sits eighth. Runway’s finishing path opened August 10,
            2026: Edit Studio exports Gen-4.5 and Aleph 2 as ProRes 4444 or a
            PNG sequence.
          </p>
          <p>
            <span className="font-medium text-[#f5f5f5]">
              Google is narrowing the cheap path.
            </span>{" "}
            Veo 3.1 preview API endpoints shut on October 22, 2026. Veo stays in Flow. New
            API work should call gemini-omni-1.1-flash. From October 9, 2026, unpaid
            Gemini users keep Flash-Lite only.
          </p>
          <p>
            <span className="font-medium text-[#f5f5f5]">
              Clearance has not moved.
            </span>{" "}
            Adobe Firefly and Moonvalley Marey are the licensed-training
            options. Seedance, MiniMax, and Wan still carry active rights
            fights. For the 99th Oscars, acting has to be performed by a person,
            and the screenplay has to be written by a person.
          </p>
        </div>
      </details>
    </aside>
  );
}
