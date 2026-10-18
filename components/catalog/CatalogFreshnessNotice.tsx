type Props = {
  className?: string;
};

/** Change this when the catalog note is rewritten. About uses the same date. */
export const CATALOG_AS_OF_LABEL = "October 18, 2026";

/**
 * Thin catalog chrome for time-sensitive filmmaker news.
 * Rewrite when a new flagship replaces Kling 4.0 as the public default.
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
        Kling 4.0 is the model to plan a shoot on. One clip can run up to 30
        seconds. You can attach up to 15 reference pictures, and mark up to 10
        moments where the action or camera should change.
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-[#d1d5db]">
        <span className="font-medium text-[#f5f5f5]">People preferred: </span>
        Wan 3.0, then Utopai X, Seedance 2.5, and MiniMax H3. That order comes
        from blind tests of video with sound. Kling 4.0 is too new to be on
        that list yet.
      </p>
      <details className="group mt-2">
        <summary className="cursor-pointer list-none text-sm font-medium text-[#e11d48] underline-offset-2 marker:content-none hover:underline [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Read the briefing</span>
          <span className="hidden group-open:inline">Hide the briefing</span>
        </summary>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#d1d5db]">
          <p>
            <span className="font-medium text-[#f5f5f5]">Kling 4.0.</span>{" "}
            Open to everyone on October 15. You get more control: smoother big
            moves, one clip up to 30 seconds, up to 15 reference pictures, and
            up to 10 marks for where the action or camera should change. Plan
            the shoot on 4.0.
          </p>
          <p>
            <span className="font-medium text-[#f5f5f5]">Higgsfield.</span>{" "}
            Cinema Studio still sets the camera, lens, and color for a shot of
            about 30 seconds. A newer path can make videos longer than 10
            minutes, and they are working toward describing the video out loud.
            Use Cinema Studio for one shot. Use the longer path when the piece
            has to run past a minute.
          </p>
          <p>
            <span className="font-medium text-[#f5f5f5]">
              FLUX 3 Image Klein.
            </span>{" "}
            On October 15, Black Forest Labs released a free stills model you
            can run on your own computer. It makes pictures, not video. You can
            give it up to 10 reference images, it can make a 4K frame, and you
            can draw a box to say where something in the picture should sit. A
            smaller version is meant for an NVIDIA graphics card with 8 GB of
            memory, in ComfyUI or Diffusers. The older Flux stills card and
            FLUX 3 Video are still in the catalog. Use Klein when you want the
            still made on your own machine.
          </p>
          <p>
            <span className="font-medium text-[#f5f5f5]">Ideogram 4.5.</span>{" "}
            Released October 1. Most image tools misspell words inside a
            picture. Use Ideogram when the frame itself has to show readable
            type: a movie title, a poster, a street sign, or a name on a door.
          </p>
          <p>
            <span className="font-medium text-[#f5f5f5]">
              Grok Imagine Video 1.5 Lite.
            </span>{" "}
            A cheaper, faster version of Grok video, available since October 8.
            Clips run 1 to 15 seconds, up to 1080p, with sound included. The
            full 1.5 model still looks better. Use Lite to try ideas. Use full
            1.5 for the shot you keep.
          </p>
          <p>
            <span className="font-medium text-[#f5f5f5]">New cards.</span>{" "}
            Utopai X (inside PAI), OpenArt, FLUX 3 Image Klein, Krea, and Vidu
            Q3. Higgsfield, Firefly, OpenArt, and Krea have a Hub badge. A hub
            is a workspace that runs other companies&apos; models. The badge
            does not mean it looks better.
          </p>
          <p>
            <span className="font-medium text-[#f5f5f5]">Google.</span> The
            cheap test version of the Veo 3.1 API turns off on October 22,
            2026. Veo itself stays in Google Flow. If you connect by API, use
            Gemini Omni Flash.
          </p>
          <p>
            <span className="font-medium text-[#f5f5f5]">Rights.</span> Nothing
            new on what is safe to use. Firefly and Moonvalley Marey were
            trained on material those companies say they have the rights to.
            Seedance, MiniMax, and Wan are still in active copyright disputes.
            For the{" "}
            <strong className="font-bold text-[#f5f5f5]">
              99th Academy Awards
            </strong>
            , acting has to be performed by a human, and the screenplay has to
            be written by a human. Sound, visual effects, and other crafts may
            use AI. Using AI neither helps nor hurts a nomination. The Academy
            can ask how it was used.{" "}
            <a
              href="https://www.oscars.org/sites/oscars/files/2026-05/99th_oscars_complete_rules.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#e11d48] underline-offset-2 hover:underline"
            >
              99th Academy Awards rules (PDF)
            </a>
          </p>
        </div>
      </details>
    </aside>
  );
}
