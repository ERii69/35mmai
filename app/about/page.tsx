"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AboutPageContent } from "@/components/about/AboutPageContent";
import { Logo35mmAI } from "@/components/brand/Logo35mmAI";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col bg-[#0f0f0f] font-sans text-[#f5f5f5]">
      <header className="sticky top-0 z-40 border-b border-[#333] bg-[#0f0f0f]/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2 sm:px-6 md:py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Logo35mmAI className="text-2xl md:text-3xl" href="/" aria-label="35mmAI home" />
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-[#d1d5db] underline-offset-4 hover:text-[#e11d48] hover:underline"
          >
            Home
          </Link>
        </div>
      </header>
      <AboutPageContent
        variant="standalone"
        onNavigate={(step) => router.push(`/?step=${step}`)}
      />
    </div>
  );
}
