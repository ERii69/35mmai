import Link from "next/link";
import { Logo35mmAI } from "@/components/brand/Logo35mmAI";
import { CATALOG_PATHS } from "@/lib/catalog-routes";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col bg-[#0f0f0f] text-[#f5f5f5]">
      <header className="sticky top-0 z-40 border-b border-[#333] bg-[#0f0f0f]/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2 sm:px-6 md:py-2.5">
          <Logo35mmAI className="text-2xl md:text-3xl" href="/" aria-label="35mmAi home" />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e11d48]">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Page not found</h1>
        <p className="mt-4 text-base leading-relaxed text-[#a3a3a3] md:text-lg">
          That address is not in the 35mmAi catalog. Head home or browse the current tool list.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={CATALOG_PATHS.home}
            className="inline-flex min-h-[44px] items-center rounded-xl bg-[#e11d48] px-5 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Home
          </Link>
          <Link
            href={CATALOG_PATHS.tools}
            className="inline-flex min-h-[44px] items-center rounded-xl border border-[#444] bg-[#111] px-5 py-2 text-sm font-medium text-[#e5e5e5] hover:border-[#e11d48]/70 hover:text-white"
          >
            All Tools
          </Link>
        </div>
      </main>
    </div>
  );
}
