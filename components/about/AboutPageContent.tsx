"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Mail,
  ArrowRight,
  Clock,
  CircleDollarSign,
  Film,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  allTools,
  DIRECTORY_LAST_UPDATED_DISPLAY,
  SITE_CONTACT_EMAIL,
} from "@/app/data";

const MAILTO = `mailto:${SITE_CONTACT_EMAIL}`;

const MOBILE_SECTION_NAV = [
  ["#about-intro", "Story"],
  ["#about-stats", "Overview"],
  ["#about-pillars", "Impact"],
  ["#about-picking", "Curation"],
  ["#about-directory", "Listings"],
  ["#about-faq", "FAQ"],
  ["#about-quote", "Values"],
  ["#about-contact", "Contact"],
] as const;

const OBSERVE_IDS = MOBILE_SECTION_NAV.map(([href]) => href.slice(1));

const SECTION_LABELS = Object.fromEntries(
  MOBILE_SECTION_NAV.map(([href, label]) => [href.slice(1), label])
) as Record<string, string>;

export type AboutPageVariant = "embedded" | "standalone";

export function AboutPageContent({
  variant = "embedded",
  onNavigate,
}: {
  variant?: AboutPageVariant;
  onNavigate: (step: number) => void;
}) {
  const [activeSectionId, setActiveSectionId] = useState("about-intro");

  const scrollMt =
    variant === "standalone"
      ? "scroll-mt-[calc(4rem+env(safe-area-inset-top))]"
      : "scroll-mt-[calc(4.25rem+env(safe-area-inset-top))] md:scroll-mt-[calc(5.25rem+env(safe-area-inset-top))]";

  const chipTop =
    variant === "standalone"
      ? "top-[calc(3.5rem+env(safe-area-inset-top)+4px)]"
      : "top-[calc(4.25rem+env(safe-area-inset-top)+6px)]";

  const updateActive = useCallback(() => {
    const clip = variant === "standalone" ? 72 : 70;
    let current = OBSERVE_IDS[0];
    for (const id of OBSERVE_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      if (top <= clip) current = id;
    }
    setActiveSectionId(current);
  }, [variant]);

  useEffect(() => {
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [updateActive]);

  const toolCount = allTools.length;
  const chipLabel = SECTION_LABELS[activeSectionId] ?? "About";

  return (
    <article
      className="relative overflow-hidden bg-[#0f0f0f] text-[#f5f5f5]"
      aria-labelledby="about-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(225,29,72,0.06)_0%,transparent_45%),radial-gradient(circle_at_center,rgba(234,179,8,0.04)_0%,transparent_65%)]" />

      <p
        className={`pointer-events-none fixed left-1/2 z-[35] -translate-x-1/2 rounded-full border border-[#333] bg-[#111]/95 px-4 py-1.5 text-xs font-medium text-[#d4d4d4] shadow-lg backdrop-blur-sm md:hidden ${chipTop}`}
        aria-live="polite"
      >
        <span className="text-[#737373]">Section · </span>
        {chipLabel}
      </p>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-14 pt-2 sm:px-6 md:pb-20 md:pt-4">
        <header className="mb-8 text-left md:mb-12 md:text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#e11d48]">
            About
          </p>
          <h1
            id="about-heading"
            className="text-3xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
          >
            Independent film,{" "}
            <span className="text-[#e11d48]">amplified by AI</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#a3a3a3] md:text-lg">
            A practical directory for indie crews, film students, and solo creators — from script
            breakdown to delivery — so you can move faster without sacrificing craft.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#737373]">
            <strong className="font-medium text-[#a3a3a3]">{toolCount} tools</strong>
            {" · "}
            Last updated {DIRECTORY_LAST_UPDATED_DISPLAY}
          </p>
          <div className="mx-auto mt-4 max-w-2xl rounded-2xl border border-[#2a2a2a] bg-[#111]/60 px-4 py-3 text-left text-sm leading-relaxed text-[#a3a3a3] md:text-center">
            35mmAI is <span className="text-[#e5e5e5]">independent</span> and not paid by the
            companies listed here. Outbound links are for reference only — always verify pricing and
            terms on the vendor&apos;s site.
          </div>
          <div className="mt-6 hidden flex-row flex-wrap justify-center gap-3 md:flex">
            <Button
              type="button"
              onClick={() => onNavigate(9)}
              className="h-11 min-h-[44px] bg-[#e11d48] hover:bg-red-600 md:px-6"
            >
              Browse all tools
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate(0)}
              className="h-11 min-h-[44px] border-[#444] text-[#e5e5e5] hover:bg-[#1a1a1a] md:px-6"
            >
              Back to home
            </Button>
          </div>
        </header>

        <nav
          aria-label="On this page"
          className="mb-10 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
        >
          {MOBILE_SECTION_NAV.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="shrink-0 rounded-full border border-[#333] bg-[#111] px-4 py-2.5 text-sm font-medium text-[#d4d4d4] transition-colors hover:border-[#e11d48]/50 hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="min-w-0 space-y-12 md:space-y-16">
          <section
            id="about-intro"
            className={`rounded-2xl border border-[#2a2a2a] bg-[#111]/80 p-5 sm:p-8 ${scrollMt}`}
          >
            <h2 className="text-lg font-semibold text-white md:text-xl">What 35mmAI is</h2>
            <div className="mt-4 max-w-2xl space-y-4 text-left text-base leading-relaxed md:mx-auto md:text-center">
              <p>
                35mmAI is a curated directory — not a generic AI list — built for people who actually
                shoot, edit, and ship films on tight schedules and budgets.
              </p>
              <p>
                In 2026, AI is a practical part of the pipeline: storyboards, breakdowns, sound,
                grade, VFX assists, and more. We help you find tools that fit{" "}
                <span className="font-medium text-[#e5e5e5]">your</span> stage and role, with honest
                context on pricing and workflow.
              </p>
            </div>
          </section>

          <section id="about-stats" className={scrollMt}>
            <h2 className="sr-only">Directory overview</h2>
            <div className="flex flex-col gap-4 rounded-2xl border border-[#333] bg-[#111] p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                  Directory size
                </p>
                <p className="mt-1 text-2xl font-bold text-white">{toolCount} tools</p>
              </div>
              <div className="hidden h-10 w-px bg-[#333] sm:block" aria-hidden />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                  Last updated
                </p>
                <p className="mt-1 text-lg font-semibold text-[#e5e5e5]">
                  {DIRECTORY_LAST_UPDATED_DISPLAY}
                </p>
              </div>
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-[#737373] md:text-base">
              We refresh listings when pricing, products, or workflows change materially. Tool count
              reflects what is live in the catalog today.
            </p>
          </section>

          <section id="about-pillars" className={scrollMt}>
            <h2 className="mb-2 text-lg font-semibold text-white md:text-xl">
              Why filmmakers use it
            </h2>
            <p className="mb-6 max-w-2xl text-sm text-[#888] md:mx-auto md:text-center md:text-base">
              Three outcomes we optimize for when we write listings and organize the site.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <li className="flex flex-col rounded-2xl border border-[#333] bg-[#111] p-5 sm:p-6">
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-[#e11d48]/10 text-[#e11d48]">
                  <Clock className="size-5" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white">Save time</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#a3a3a3]">
                  Shrink repetitive prep — breakdowns, boards, rough cuts — so you spend more time on
                  creative decisions and less on busywork.
                </p>
              </li>
              <li className="flex flex-col rounded-2xl border border-[#333] bg-[#111] p-5 sm:p-6">
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CircleDollarSign className="size-5" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white">Cut costs</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#a3a3a3]">
                  Many teams see meaningful savings by pairing AI assists with a lean crew — without
                  pretending AI replaces human taste and supervision.
                </p>
              </li>
              <li className="flex flex-col rounded-2xl border border-[#333] bg-[#111] p-5 sm:p-6 sm:col-span-2 lg:col-span-1">
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <Film className="size-5" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white">Cinematic results</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#a3a3a3]">
                  Polish picture and sound, fix problem shots, and iterate faster — including when
                  you are shooting on modest gear.
                </p>
              </li>
            </ul>
          </section>

          <section id="about-picking" className={scrollMt}>
            <h2 className="text-lg font-semibold text-white md:text-xl">How we pick and write tools</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#888] md:mx-auto md:text-center md:text-base">
              Every listing has to earn its place. We bias toward clarity and real production use —
              not hype.
            </p>
            <ul className="mx-auto mt-5 max-w-2xl space-y-3">
              {[
                "Indie-first fit — free tiers, realistic pricing, and workflows that work on small crews.",
                "Clarity over buzzwords — what it does, when to use it, and where it sits in the pipeline.",
                "Honest limits — we call out rough edges, learning curves, and when a traditional tool still wins.",
              ].map((line) => (
                <li
                  key={line}
                  className="flex gap-3 text-sm leading-relaxed text-[#d1d5db] sm:text-base"
                >
                  <Check className="mt-0.5 size-5 shrink-0 text-[#e11d48]/90" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="about-directory" className={scrollMt}>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              What you get in each tool page
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#888] md:mx-auto md:text-center md:text-base">
              Every listing is written so you can try something the same day — not after a week of
              tutorials.
            </p>
            <ul className="mx-auto mt-5 max-w-2xl space-y-3 rounded-2xl border border-[#2a2a2a] bg-[#0c0c0c] p-5 sm:p-6">
              {[
                "Clear use case — who it is for and when to reach for it",
                "Steps and example prompts where they help",
                "Pricing signal and budget fit (indie vs aspirational)",
                "Role tags so department heads can scan fast",
              ].map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-[#d1d5db] sm:text-base">
                  <Check
                    className="mt-0.5 size-5 shrink-0 text-emerald-500/90"
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate(4)}
                className="min-h-[44px] border-[#444] text-[#e5e5e5] hover:bg-[#1a1a1a]"
              >
                Try workflow builder
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate(5)}
                className="min-h-[44px] border-[#444] text-[#e5e5e5] hover:bg-[#1a1a1a]"
              >
                Budget templates
              </Button>
            </div>
          </section>

          <section id="about-faq" className={scrollMt}>
            <h2 className="text-lg font-semibold text-white md:text-xl">Common questions</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#888] md:mx-auto md:text-center md:text-base">
              Quick answers — tap a question to expand.
            </p>
            <div className="mx-auto mt-6 max-w-2xl divide-y divide-[#2a2a2a] rounded-2xl border border-[#333] bg-[#111] px-1">
              {(
                [
                  {
                    q: "Is 35mmAI free to use?",
                    a: "Yes. Browsing the directory, filters, and planner flows on this site are free. Individual tools have their own pricing — we summarize what we can, but you should always confirm on the vendor's site.",
                  },
                  {
                    q: "Do you rank, endorse, or get paid by tools?",
                    a: "We curate for usefulness and clarity. We are not paid by listed companies for placement. If that ever changes for a specific piece of content, we will label it conspicuously.",
                  },
                  {
                    q: "How do I suggest a tool or report an error?",
                    a: "Use Contact us below. Send the tool name, link, and what should change (pricing, category, description, or a better workflow note). We read every message.",
                  },
                  {
                    q: "Are you affiliated with the products mentioned?",
                    a: "No. 35mmAI is an independent editorial directory. Names and logos belong to their owners; we use them only to identify products for filmmakers.",
                  },
                  {
                    q: "Does AI replace crew?",
                    a: "No. AI can compress prep and expand options, but creative judgment, on-set leadership, and taste stay human. We write listings with that assumption.",
                  },
                ] as const
              ).map(({ q, a }) => (
                <details
                  key={q}
                  className="group border-0 px-4 py-1 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-left text-sm font-medium text-white sm:text-base">
                    {q}
                    <ChevronDown
                      className="size-5 shrink-0 text-[#737373] transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <div className="pb-4 text-sm leading-relaxed text-[#b3b3b3]">{a}</div>
                </details>
              ))}
            </div>
          </section>

          <section id="about-quote" className={scrollMt}>
            <figure className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#161616] to-[#0f0f0f] p-6 sm:p-10">
              <blockquote className="mx-auto max-w-2xl text-center text-base leading-relaxed text-[#e5e5e5] sm:text-lg md:text-xl">
                <span className="text-[#e11d48]">&ldquo;</span>
                The goal is simple: make high-quality filmmaking more accessible to creators who have
                vision and passion, but limited budgets and crew.
                <span className="text-[#e11d48]">&rdquo;</span>
              </blockquote>
              <figcaption className="mt-6 text-center text-sm font-medium text-[#737373]">
                — The 35mmAI team
              </figcaption>
            </figure>
          </section>

          <section
            id="about-contact"
            className={`border-t border-[#333] pt-10 md:pt-12 ${scrollMt}`}
          >
            <h2 className="text-lg font-semibold text-white md:text-xl">Get in touch</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-[#888] md:text-center md:text-base">
              Feedback on a listing, a partnership idea, or a tool we should cover — we read every
              message.
            </p>
            <div className="mt-6 flex flex-col items-start gap-2 md:items-center">
              <a
                href={MAILTO}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-[#e11d48] bg-[#e11d48] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-red-600 sm:min-h-0"
              >
                <Mail className="size-5 shrink-0" aria-hidden />
                Contact us
              </a>
              <p className="select-all text-xs text-[#737373]">
                <span className="sr-only">Email address (copyable): </span>
                {SITE_CONTACT_EMAIL}
              </p>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
