type Props = {
  className?: string;
};

/** Change this when the catalog note is rewritten. About uses the same date. */
export const CATALOG_AS_OF_LABEL = "November 19, 2026";

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
        Plan the shot on Kling 4.0. One take can run 30 seconds, and the API
        can finish it at 4K, with HDR. Flash stays the 720p draft.
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-[#d1d5db]">
        <span className="font-medium text-[#f5f5f5]">Which clip looks better: </span>
        Seedance 2.5 and Utopai X tie at the top of the November 9 audio board.
        Kling 4.0 still leads fights, dance, and light.
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
          a camera change. This is the one to plan on. As of November 19 the
          API finishes at 4K, and in HDR at 1080p or 4K. HDR adds a per-second
          fee. Flash is the draft: up to 20 seconds, 720p, one start frame, no
          keyframe list. About 16 cents a second at 720p, and about 24 cents at
          1080p. Kling Image 4.0, out November 17, is the still, up to native
          8K. Runway&apos;s copy of the video model stays about 20 percent
          cheaper through November 30. There is no Kling 5.
        </p>
        <p>
          <strong className={lead}>Pika H3 Flex.</strong> On pika.art as of
          November 2. A faster MiniMax H3: up to 12 refs, five audio stems, and
          a finish up to 4K on Pika&apos;s servers. The weights are open. Pika
          2.5 is the older short clip. MiniMax is still in a copyright fight,
          and Flex comes from H3.
        </p>
        <p>
          <strong className={lead}>Omni Flash 1.2.</strong> Google&apos;s
          current video model since November 5. Clips run 3 to 15 seconds, with
          sound, and you can edit them in a follow-up turn. About 7 cents a
          second at 720p. Call gemini-omni-1.2-flash. Omni 1.1 retires
          December 5. Veo Extend already retired on November 5.
        </p>
        <p>
          <strong className={lead}>Veo 3.1.</strong> Lite is the cheap 720p
          baseline in Flow: 4, 6, or 8 seconds. Fast and Quality retire
          December 5. The cheap test connection shut off on October 22. If a
          tool on your show was calling it, point that call at Omni 1.2.
        </p>
        <p>
          <strong className={lead}>Seedance 2.5.</strong> The public cut is
          still in Dreamina, CapCut, or Doubao, about 30 seconds with sound.
          The 4K 10-bit API opened November 17. Cut a cheap draft, then the 4K
          take. On Volcano Engine that 4K render is about RMB 6 a second.
          Flash, the cheaper draft API, opened November 15. Seedance is still
          in a copyright fight. On the November 9 audio board it ties Utopai X
          at the top.
        </p>
        <p>
          <strong className={lead}>Vidu.</strong> Q4 Preview is the current
          performance model: a still or up to 15 references, up to 16 seconds,
          and 2K or 4K. Q3 stays in the listing for a prompt-only shot or a
          first-and-last frame. Image and reference jobs are 30 percent off
          through November 30.
        </p>
        <p>
          <strong className={lead}>FLUX 3 Max.</strong> Fast alts. Takes run up
          to about 20 seconds. The opening rate, about 43 cents for 10 seconds
          at 720p, ended November 7. You now pay the current fal rate. Use Max
          to try the move. Keep the shot on FLUX 3 Video or Kling.
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
        <p>
          <strong className={lead}>OpusClip 4.0.</strong> Live November 2. It
          no longer only pulls clips. Drop in a raw take and get a
          ready-to-post video. Auto Edit runs captions, speech cleanup, B-roll,
          and transitions in one pass. Viral Hook rewrites the first 3 seconds.
          Motion Graphics animates names, numbers, and dates said on camera.
          Recipes save that edit and rerun it in one click. The partner link is
          40% off the first month of Monthly Pro.
        </p>
        <p>
          <strong className={lead}>invideo Editor and Adapts.</strong> Editor
          builds a first cut from the script, then lays effects and sound on a
          timeline you can still change by hand. ChatGPT or Claude can apply
          notes through MCP when the plan includes it. Adapts takes one
          approved master and makes other languages, 30-second, 15-second, and
          6-second cuts, and the frame each platform needs. Check each version
          on its own timeline before delivery. The partner link is 50% off
          eligible annual personal plans. Plan names, prices, and credits
          change by region, so use the offer on that page.
        </p>

        <p className="pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200/85">
          Stills, sound, hubs, rights
        </p>
        <p>
          <strong className={lead}>Stills.</strong> Nano Banana 2.1 is the
          Google still to start on. Nano Banana 2 stays listed. Google has not
          set a date to turn it off. Pro stays the slower hero pass. Seedream
          5.5, out November 9, is the ByteDance still for edits, readable type,
          transparent cutouts, and up to 99 layers. Seedream 5.0 Pro stays when
          the file has to be native 4K. FLUX 3 Image Klein runs on your own
          computer: pictures, up to 10 refs, a 4K frame, and a box to place
          something in the shot. Ideogram 4.5 when the frame has to be read: a
          title, a poster, a street sign, a name on a door. GPT Image 2.6, out
          November 4, is the concept frame inside ChatGPT.
        </p>
        <p>
          <strong className={lead}>Sound of the picture.</strong> Mirelo SFX
          2.0 takes a cut up to 10 minutes, lifts a music bed you did not ask
          for, and lays effects and room tone around the dialogue. ElevenLabs
          can do the same kind of pass and leave the layers separate for the
          mix. VEED can dub a finished video. Send the cut and a language. It
          keeps each speaker&apos;s voice and lip-syncs. About 11 cents a
          second, or 18 cents for the tighter multi-speaker pass.
        </p>
        <p>
          <strong className={lead}>Hubs.</strong> Higgsfield, Firefly, OpenArt,
          and Krea run other companies&apos; models in one room. The Hub badge
          means that. The picture still depends on which model you pick.
        </p>
        <p>
          <strong className={lead}>Runway.</strong> Gen-4.5 is still the
          flagship. No Gen-5 as of November 19. App Studio, on a paid plan, can
          turn a workflow into a small app. Other people run it on their own
          credits.
        </p>
        <p>
          <strong className={lead}>Firefly.</strong> On November 10, Creative
          Agent opened across Firefly. Assemble short video, in beta, is a
          single-track cut you can trim, split, and regenerate. Premiere
          mobile Quick Cut, an editable first cut from a camera roll, is a
          private beta.
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
