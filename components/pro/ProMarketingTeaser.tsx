import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { proMarketing } from "@/components/pro/pro-marketing-surfaces";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import {
  FREE_CATALOG_PRO_TEASER,
  PRO_MARKETING_CTA_TRIAL,
  PRO_MARKETING_HEADLINE,
  PRO_MARKETING_HERO,
  PRO_MARKETING_PRICE,
  PRO_MARKETING_SUBHEAD,
} from "@/lib/pro/marketing-copy";

/** Compact Pro pitch on the free home app — links to full /pro page. */
export function ProMarketingTeaser() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-pro-base px-4 py-12 text-pro-text sm:px-6 md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08)_0%,transparent_70%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-pro-accent-bright sm:text-3xl">
          <Sparkles className={`size-6 shrink-0 sm:size-7 ${proMarketing.heroIcon}`} aria-hidden />
          {PRO_MARKETING_HERO}
        </h2>
        <p className="mt-4 text-lg font-semibold text-pro-text sm:text-xl">{PRO_MARKETING_HEADLINE}</p>
        <p className="mt-3 text-sm leading-relaxed text-pro-text-secondary sm:text-base">{PRO_MARKETING_SUBHEAD}</p>
        <p className="mt-2 text-sm text-pro-text-secondary">{FREE_CATALOG_PRO_TEASER}</p>
        <p className="mt-2 text-sm text-pro-text-secondary">{PRO_MARKETING_PRICE.trialThenLabel}</p>
        <Link href="/pro" className={`${proBtn.marketingPrimary} mt-8 h-12 w-full max-w-sm text-base`}>
          {PRO_MARKETING_CTA_TRIAL}
          <ArrowRight className="size-5" aria-hidden />
        </Link>
        <Link
          href="/"
          className="mt-4 text-sm text-pro-text-secondary underline-offset-2 hover:text-pro-text hover:underline"
        >
          ← Back to free catalog
        </Link>
      </div>
    </div>
  );
}
