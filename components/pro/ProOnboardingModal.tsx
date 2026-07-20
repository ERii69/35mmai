"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "pro-onboarding-v3-dismissed";

const STEPS = [
  {
    title: "Pick a template first",
    body: "Script to prompt is the default — Classical AI short and Blank sit alongside it on the dashboard. Change template anytime from Projects or the workspace header.",
  },
  {
    title: "Script → Look → Finish",
    body: "Paste your screenplay, run prep, lock palette and mood refs, then copy prompts or export a pack from Finish.",
  },
  {
    title: "Switch templates anytime",
    body: "Change template from the Projects menu or Template control in the workspace. Your script and prep stay — nav and prompts adapt.",
  },
] as const;

/**
 * Non-blocking first-run tip — does not cover the studio or intercept New project.
 * Dismiss via Skip, Open dashboard, X, or Escape.
 */
export function ProOnboardingModal() {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
      setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-end p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-4"
      role="region"
      aria-label="Welcome tips"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        className="pointer-events-auto relative w-full max-w-sm rounded-2xl border border-white/10 bg-pro-elevated p-5 shadow-2xl ring-1 ring-white/[0.06]"
      >
        <button
          type="button"
          className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl p-2 text-pro-text-secondary hover:bg-white/5 hover:text-pro-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50"
          onClick={dismiss}
          aria-label="Dismiss welcome tips"
        >
          <X className="size-4" aria-hidden />
        </button>

        <p className="pr-10 text-xs font-semibold uppercase tracking-wider text-pro-primary">
          Welcome · {step + 1} of {STEPS.length}
        </p>
        <h2 id={titleId} className="mt-2 text-lg font-semibold text-pro-text">
          {current.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-pro-text-secondary">{current.body}</p>

        <div className="mt-4 flex gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-pro-primary" : "bg-white/10"}`}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {isLast ? (
            <Button type="button" className="bg-pro-primary hover:brightness-110" onClick={dismiss}>
              Got it
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-pro-primary hover:brightness-110"
              onClick={() => setStep((s) => s + 1)}
            >
              Next
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Button>
          )}
          <Button type="button" variant="ghost" className="text-pro-text-secondary" onClick={dismiss}>
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}
