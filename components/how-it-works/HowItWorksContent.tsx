"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, ClipboardCheck, Sparkles } from "lucide-react";

export type HowItWorksVariant = "embedded" | "standalone";

const QUICK_FLOW = [
  {
    title: "Start from your actual shoot reality",
    description:
      "From Home, pick the budget path that matches your production, then choose your role so recommendations feel like a real crew workflow.",
  },
  {
    title: "Move stage by stage, not app by app",
    description:
      "Use Workflow Builder to go pre to post in order. Open details for each tool to see when it helps, how to set it up, and what prompt to start with.",
  },
  {
    title: "Build a lean kit you can actually run",
    description:
      "Save only a small shortlist (3-5 tools). Keep what fits your edit pace, budget, and quality bar; cut the rest.",
  },
  {
    title: "Test in context, then lock your stack",
    description:
      "Compare two options per stage on real footage or scenes. Keep the one that saves time without hurting story, sound, or image quality.",
  },
] as const;

const QA_CHECKLIST = [
  "Role and budget filters surface tools that make sense for the job",
  "Search behaves predictably (for example, typing opus finds OpusClip)",
  "Tool details include clear setup steps and usable prompt starter",
  "Add to Kit and remove from Kit work cleanly without accidental duplicates",
  "Links open correctly from the list, tool modal, and My Kit",
  "Mobile layout stays readable and tappable on smaller screens",
] as const;

export function HowItWorksContent({
  variant = "embedded",
  onNavigate,
}: {
  variant?: HowItWorksVariant;
  onNavigate: (step: number) => void;
}) {
  return (
    <section className="relative overflow-hidden bg-[#0f0f0f] text-[#f5f5f5]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(225,29,72,0.06)_0%,transparent_45%),radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_65%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-14 pt-4 sm:px-6 md:pb-20">
        <header className="mb-10 text-left md:text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#e11d48]">
            How It Works
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            Your first pass through <span className="text-[#e11d48]">35mmAI</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#a3a3a3] md:text-lg">
            This guide helps you go from blank page to working tool stack fast, with a process that
            feels closer to real production than random app hunting.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 md:justify-center">
            <Button
              type="button"
              onClick={() => onNavigate(0)}
              className="min-h-[44px] bg-[#e11d48] hover:bg-red-600"
            >
              Start Planner
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate(9)}
              className="min-h-[44px] border-[#444] text-[#e5e5e5] hover:bg-[#1a1a1a]"
            >
              Browse All Tools
            </Button>
          </div>
          {variant === "standalone" && (
            <p className="mt-3 text-xs text-[#737373]">
              Short on time: finish steps 1-3 now, then run the checklist after your first session.
            </p>
          )}
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {QUICK_FLOW.map((item, index) => (
            <article key={item.title} className="rounded-2xl border border-[#2a2a2a] bg-[#111]/80 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                Step {index + 1}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#b3b3b3]">{item.description}</p>
            </article>
          ))}
        </div>

        <article className="mt-8 rounded-2xl border border-[#2a2a2a] bg-[#111]/85 p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <ClipboardCheck className="size-5 text-[#e11d48]" aria-hidden />
            <h2 className="text-lg font-semibold text-white md:text-xl">Quick QA while you test</h2>
          </div>
          <ul className="space-y-3">
            {QA_CHECKLIST.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-[#d1d5db] sm:text-base">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl border border-[#333] bg-[#0d0d0d] p-4 text-sm text-[#a3a3a3]">
            <p className="flex items-center gap-2 font-medium text-[#e5e5e5]">
              <Sparkles className="size-4 text-amber-300" aria-hidden />
              Field note for better results
            </p>
            <p className="mt-2">
              Run a simple A/B at each stage: two tools, same task, same footage. Keep the faster
              one only if quality still holds up, then refresh your kit each week.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
