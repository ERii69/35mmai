"use client";

import Link from "next/link";
import { ProComingSoonContent } from "@/components/pro/ProComingSoonContent";

export default function ProPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] font-sans text-[#f5f5f5]">
      <header className="sticky top-0 z-40 border-b border-[#333] bg-[#0f0f0f]/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2 sm:px-6 md:py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/"
              className="shrink-0 text-2xl font-extrabold tracking-widest text-white md:text-3xl"
              aria-label="35mmAI home"
            >
              <span className="text-[#e11d48]">35</span>mm<span className="text-[#e11d48]">AI</span>
            </Link>
            <span className="shrink-0 rounded-full border border-amber-400/50 bg-amber-500 px-2 py-0.5 text-[10px] font-bold leading-none tracking-widest text-black md:text-xs">
              BETA
            </span>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-[#d1d5db] underline-offset-4 hover:text-[#e11d48] hover:underline"
          >
            Home
          </Link>
        </div>
      </header>
      <ProComingSoonContent variant="standalone" />
    </div>
  );
}
