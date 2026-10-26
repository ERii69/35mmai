type Props = {
  className?: string;
};

/** Change this when the catalog note is rewritten. About uses the same date. */
export const CATALOG_AS_OF_LABEL = "October 26, 2026";

const lead = "font-bold text-[#f5f5f5]";

/**
 * Thin catalog chrome for time-sensitive filmmaker news.
 * Rewrite when a new flagship replaces Kling 4.0 as the public default.
 * The briefing uses a plain disclosure so the click opens and closes it.
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
        Plan the shot on Kling 4.0. One take can run 30 seconds. Bring up to
        15 refs, and mark up to 10 places where the move or the action has to
        hit.
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-[#d1d5db]">
        <span className="font-medium text-[#f5f5f5]">Which clip looks better: </span>
        people watch two clips from the same prompt and are not told which
        tool made them. They choose Wan 3.0 most often, then Utopai X. MiniMax
        H3, Seedance 2.5, FLUX 3 Max, and HeyGen Video 1 come out about even.
        Kling 4.0 is not in that test yet.
      </p>

      <details className="group mt-3 [&:not([open])>:not(summary)]:hidden">
        <summary className="cursor-pointer list-none text-sm font-medium text-[#e11d48] underline-offset-2 marker:content-none hover:underline [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Read the briefing</span>
          <span className="hidden group-open:inline">Hide the briefing</span>
        </summary>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#d1d5db]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200/85">
          The tools
        </p>
        <p>
          <strong className={lead}>Kling 4.0.</strong> Open since October 15.
          Big moves hold. One take, 30 seconds, 15 refs, 10 marks for a beat or
          a camera change. This is the one to plan on.
        </p>
        <p>
          <strong className={lead}>Veo 3.1.</strong> The cheap test connection
          shut off on October 22. If a tool on your show was calling it, point
          that call at Gemini Omni Flash. Veo is still in Google Flow for a
          hero take.
        </p>
        <p>
          <strong className={lead}>Seedance 2.5.</strong> A few film and post
          houses are testing the 4K take. Cut a cheap 480p version first, then
          the 4K take in 10-bit color. You cannot open this 4K one yourself
          yet. Seedance 2.5 in Dreamina or CapCut is the version you can use
          today.
        </p>
        <p>
          <strong className={lead}>FLUX 3 Max.</strong> Fast alts. A 10-second
          720p clip is about 43 cents and can come back in the time it takes to
          watch it. Takes run up to about 20 seconds. Use Max to try the move.
          Keep the shot on FLUX 3 Video or Kling.
        </p>
        <p>
          <strong className={lead}>Higgsfield.</strong> Cinema Studio sets the
          camera, lens, and color on a shot of about 30 seconds. Use the longer
          path when the piece has to run past a minute.
        </p>
        <p>
          <strong className={lead}>Grok 1.5 Lite.</strong> Cheap and fast, 1 to
          15 seconds, with sound. Use Lite for alts. Use full 1.5 for the take
          you keep.
        </p>

        <p className="pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200/85">
          Stills, sound, hubs, rights
        </p>
        <p>
          <strong className={lead}>Stills.</strong> FLUX 3 Image Klein runs on
          your own computer: pictures, up to 10 refs, a 4K frame, and a box to
          place something in the shot. Ideogram 4.5 when the frame has to be
          read: a title, a poster, a street sign, a name on a door.
        </p>
        <p>
          <strong className={lead}>Sound of the picture.</strong> Mirelo SFX
          2.0 takes a cut up to 10 minutes, lifts a music bed you did not ask
          for, and lays effects and room tone around the dialogue. ElevenLabs
          can do the same kind of pass and leave the layers separate for the
          mix.
        </p>
        <p>
          <strong className={lead}>Hubs.</strong> Higgsfield, Firefly, OpenArt,
          and Krea run other companies&apos; models in one room. The Hub badge
          means that. The picture still depends on which model you pick.
        </p>
        <p>
          <strong className={lead}>Rights.</strong> Firefly and Moonvalley Marey
          were trained on material those companies say they have the rights to.
          Seedance, MiniMax, and Wan are still in copyright fights. For the{" "}
          <strong className={lead}>99th Academy Awards</strong>, the performance
          and the screenplay have to be human. Sound, effects, and the other
          crafts may use AI. Using it does not help or hurt a nomination. The
          Academy can ask how you used it.{" "}
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
