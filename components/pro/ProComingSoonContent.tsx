"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Target,
  BarChart3,
  FolderDown,
  Check,
  Mail,
  Loader2,
} from "lucide-react";
import { SITE_CONTACT_EMAIL } from "@/app/data";
import { submitProWaitlist, type ProWaitlistState } from "@/app/actions/waitlist";

const initialWaitlistState: ProWaitlistState = { status: "idle" };

function buildMailtoHref(email: string, note: string): string {
  const subject = encodeURIComponent("35mmAI Pro — waitlist");
  const body = encodeURIComponent(
    `Please add me to the 35mmAI Pro waitlist.\n\nMy email: ${email}\n` +
      (note ? `\nNote: ${note}\n` : "\n")
  );
  return `mailto:${SITE_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

function ProWaitlistSection({ onReset }: { onReset: () => void }) {
  const [state, formAction, isPending] = useActionState(submitProWaitlist, initialWaitlistState);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const mailtoHref = useMemo(() => {
    if (state.status !== "success" || state.persisted || !email.trim()) return "";
    return buildMailtoHref(email.trim(), note.trim());
  }, [state, email, note]);

  const showSuccess = state.status === "success";

  return (
    <>
      {!showSuccess ? (
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="pro-waitlist-email" className="mb-1.5 block text-sm text-[#a3a3a3]">
              Email <span className="text-[#e11d48]">*</span>
            </label>
            <input
              id="pro-waitlist-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@production.company"
              className="w-full rounded-xl border border-[#333] bg-[#0a0a0a] px-4 py-3 text-base text-white outline-none ring-[#e11d48]/40 placeholder:text-[#555] focus:border-[#e11d48]/60 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="pro-waitlist-note" className="mb-1.5 block text-sm text-[#a3a3a3]">
              Optional — role or use case (helps us prioritize)
            </label>
            <textarea
              id="pro-waitlist-note"
              name="note"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Line producer, $200k feature, need breakdown exports"
              className="w-full resize-y rounded-xl border border-[#333] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none ring-[#e11d48]/40 placeholder:text-[#555] focus:border-[#e11d48]/60 focus:ring-2"
            />
          </div>
          {state.status === "error" ? (
            <p className="text-sm text-amber-300" role="alert">
              {state.message}
            </p>
          ) : null}
          <p className="text-xs text-[#737373]">
            By joining, you agree we may email you about Pro (launch, pricing, early access).
            Unsubscribe anytime from those emails.
          </p>
          <Button
            type="submit"
            disabled={isPending}
            className="h-12 min-h-[48px] w-full bg-[#e11d48] text-base font-medium hover:bg-red-600 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Sending…
              </>
            ) : (
              <>
                <Mail className="size-5" aria-hidden />
                Join the waitlist
              </>
            )}
          </Button>
        </form>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
          {state.persisted ? (
            <>
              <p className="text-lg font-semibold text-white">You&apos;re on the list</p>
              <p className="mt-2 text-sm text-[#b3b3b3]">
                We saved your email. We&apos;ll email you when Pro opens — usually no more than a
                couple of messages before launch.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-white">Almost done</p>
              <p className="mt-2 text-sm text-[#b3b3b3]">
                Automatic signup isn&apos;t connected yet. Tap below to open your email app with a
                pre-filled message — send it and we&apos;ll add you manually.
              </p>
              {mailtoHref ? (
                <Button type="button" asChild className="mt-5 h-12 w-full bg-[#e11d48] hover:bg-red-600">
                  <a href={mailtoHref}>Open email to finish</a>
                </Button>
              ) : null}
            </>
          )}
          <Button
            type="button"
            variant="outline"
            className="mt-4 border-[#444] text-[#e5e5e5] hover:bg-[#1a1a1a] sm:mt-5"
            onClick={onReset}
          >
            Add another email
          </Button>
        </div>
      )}
    </>
  );
}

export type ProComingSoonVariant = "embedded" | "standalone";

export function ProComingSoonContent({
  variant = "embedded",
  onNavigate,
}: {
  variant?: ProComingSoonVariant;
  onNavigate?: (step: number) => void;
}) {
  const router = useRouter();
  const [waitlistKey, setWaitlistKey] = useState(0);

  const go = (step: number) => {
    if (variant === "standalone") {
      router.push(`/?step=${step}`);
    } else {
      onNavigate?.(step);
    }
  };

  return (
    <div className="relative min-h-0 overflow-hidden bg-[#0f0f0f] px-4 py-12 text-[#f5f5f5] sm:px-6 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.03)_0%,transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-6 flex justify-center md:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-6 py-2.5 text-xs font-medium text-amber-400 md:px-8 md:text-sm">
            <Sparkles className="size-4 shrink-0" aria-hidden />
            COMING SOON
          </div>
        </div>

        <div className="mb-8 text-center md:mb-14">
          <h1 className="mb-4 text-4xl font-bold tracking-tighter sm:text-5xl md:mb-6 md:text-7xl">
            35mmAI <span className="text-[#e11d48]">Pro</span>
          </h1>
          <p className="mx-auto max-w-3xl text-base text-[#d1d5db] sm:text-lg md:text-2xl">
            Deeper recommendations, richer budget modeling, and crew-ready exports — built on top of
            the free directory you already use.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#a3a3a3] md:text-base">
            <strong className="font-semibold text-[#e5e5e5]">Launch target: 2026.</strong> Waitlist
            members get first access and launch pricing. No spam — one or two emails until we ship.
          </p>
          <p className="mx-auto mt-4 max-w-2xl rounded-2xl border border-[#2a2a2a] bg-[#111]/70 px-4 py-3 text-left text-xs leading-relaxed text-[#888] md:text-center md:text-sm">
            35mmAI Pro is a separate product from the free tool listings. We are{" "}
            <span className="text-[#d4d4d4]">not</span> paid by vendors for placement; Pro features
            will be clearly labeled when they go live.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-12">
          <div className="space-y-6 md:col-span-5">
            <div className="rounded-3xl border border-[#333] bg-[#111] p-6 md:p-8">
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-[#e11d48]/10 text-[#e11d48]">
                <Target className="size-6" aria-hidden />
              </div>
              <h2 className="mb-3 text-xl font-semibold md:text-2xl">Smart My Kit</h2>
              <p className="leading-relaxed text-[#d1d5db]">
                Recommendations tuned to your role, budget band, and where you are in production — not
                generic AI hype.
              </p>
            </div>

            <div className="rounded-3xl border border-[#333] bg-[#111] p-6 md:p-8">
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <BarChart3 className="size-6" aria-hidden />
              </div>
              <h2 className="mb-3 text-xl font-semibold md:text-2xl">Advanced budget view</h2>
              <p className="leading-relaxed text-[#d1d5db]">
                Roll up tool costs, compare scenarios, and see savings vs traditional line items —
                grounded in the same pricing signals as the free planner.
              </p>
            </div>

            <div className="rounded-3xl border border-[#333] bg-[#111] p-6 md:p-8">
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <FolderDown className="size-6" aria-hidden />
              </div>
              <h2 className="mb-3 text-xl font-semibold md:text-2xl">Exports &amp; templates</h2>
              <p className="leading-relaxed text-[#d1d5db]">
                Print-ready checklists, shot lists, and workflow packs sized for small crews — so the
                app helps on set, not only on the laptop.
              </p>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="flex h-full flex-col rounded-3xl border border-[#e11d48]/60 bg-[#111] p-6 sm:p-8 md:p-10">
              <div className="mb-2 text-xs font-medium uppercase tracking-[2px] text-[#e11d48]">
                Planned premium
              </div>
              <p className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90">
                Illustrative only — <strong className="font-semibold">not billed yet.</strong> Final
                plans and pricing will be confirmed before launch.
              </p>

              <div className="mb-8">
                <div className="text-5xl font-bold leading-none text-white sm:text-6xl md:text-7xl">
                  TBD
                </div>
                <div className="mt-2 text-xl text-[#d1d5db] md:text-2xl">per month (planned)</div>
                <p className="mt-3 text-sm text-[#888]">
                  Example direction: ~$12/mo or annual discount — we will publish firm numbers with
                  the launch email.
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-4 text-[#d1d5db]">
                {[
                  "Everything in the free directory experience",
                  "Smarter kit + budget workflows tied to your role",
                  "Exports and production-ready templates",
                  "Early access to new listings and features",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-emerald-400" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <ProWaitlistSection
                key={waitlistKey}
                onReset={() => setWaitlistKey((k) => k + 1)}
              />

              <div className="mt-8 flex flex-col gap-2 border-t border-[#333] pt-6 text-center text-sm text-[#737373] sm:flex-row sm:justify-center sm:gap-4">
                <button
                  type="button"
                  onClick={() => go(9)}
                  className="text-[#d1d5db] underline-offset-2 hover:text-white hover:underline"
                >
                  Browse free tools
                </button>
                {variant === "standalone" ? (
                  <Link
                    href="/"
                    className="text-[#d1d5db] underline-offset-2 hover:text-white hover:underline"
                  >
                    Home
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => go(0)}
                    className="text-[#d1d5db] underline-offset-2 hover:text-white hover:underline"
                  >
                    Home
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
