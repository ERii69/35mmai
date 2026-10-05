"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { CATALOG_PATHS } from "@/lib/catalog-routes";
import { FREE_VS_PRO_HIGHLIGHTS } from "@/lib/pro/free-vs-pro";
import { PRO_MARKETING_PRICE } from "@/lib/pro/marketing-copy";

/** $0 / $15 popup over the catalog home for visitors who are not signed in. */
export function HomeSubscriptionOffer() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setVisible(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/75" aria-hidden />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Choose free catalog or Pro"
        className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-y-auto"
      >
      <div className="mb-3 flex justify-end">
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Close plans"
        className="inline-flex size-9 items-center justify-center rounded-full border border-[#333] bg-[#111] text-[#d1d5db] transition hover:border-[#e11d48] hover:text-white"
      >
        <X className="size-4" aria-hidden />
      </button>
      </div>
      <div className="grid items-stretch gap-4 md:grid-cols-2">
        <Link
          href={CATALOG_PATHS.tools}
          className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#111] p-6 text-inherit no-underline transition hover:border-white/20 sm:p-7"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a3a3a3]">Free</p>
          <p className="mt-3 font-[family-name:var(--font-cinema)] text-5xl font-bold tracking-tight text-white">
            $0
          </p>
          <p className="mt-2 text-sm font-medium text-white">New AI tools every week</p>
          <ul className="mt-5 space-y-2.5">
            {FREE_VS_PRO_HIGHLIGHTS.free.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-[#a3a3a3]">
                <Check className="mt-0.5 size-4 shrink-0 text-white/30" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <span className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-[#444] text-sm font-medium text-[#e5e5e5] sm:mt-auto">
            Open All Tools
          </span>
        </Link>

        <Link
          href="/pro"
          className="flex flex-col rounded-2xl border border-[#eab308]/55 bg-[#111] p-6 text-inherit no-underline shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)] ring-1 ring-[#eab308]/25 transition hover:border-[#eab308] sm:p-7"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f5d76e]">Pro</p>
          <p className="mt-3 font-[family-name:var(--font-cinema)] text-5xl font-bold tracking-tight text-white">
            {PRO_MARKETING_PRICE.label}
            <span className="ml-1 text-xl font-semibold text-[#a3a3a3]">{PRO_MARKETING_PRICE.suffix}</span>
          </p>
          <p className="mt-2 text-sm font-medium text-white">{PRO_MARKETING_PRICE.currencyNote}</p>
          <ul className="mt-5 space-y-2.5">
            {FREE_VS_PRO_HIGHLIGHTS.pro.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-white">
                <Check className="mt-0.5 size-4 shrink-0 text-[#eab308]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <span className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#eab308] text-sm font-semibold text-black sm:mt-auto">
            Open Pro
          </span>
        </Link>
      </div>
      </section>
    </div>
  );
}
