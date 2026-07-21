import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import {
  FREE_CATALOG_PRO_CTA,
  FREE_CATALOG_PRO_TEASER,
  FREE_CATALOG_PRO_TEASER_DETAIL,
} from "@/lib/pro/marketing-copy";

type Props = {
  /** compact = one-line strip; card = stronger mid-page handoff */
  variant?: "compact" | "card";
  className?: string;
};

/** Free catalog → Pro: discover tools here, prepare prompts in Pro. */
export function FreeCatalogProHandoff({ variant = "card", className = "" }: Props) {
  if (variant === "compact") {
    return (
      <p className={`text-sm text-[#a3a3a3] ${className}`}>
        {FREE_CATALOG_PRO_TEASER}{" "}
        <Link
          href="/pro"
          className="font-medium text-[#E30613] underline-offset-2 hover:underline"
        >
          {BRAND_NAME_PRO} →
        </Link>
      </p>
    );
  }

  return (
    <aside
      className={`rounded-2xl border border-[#E30613]/25 bg-gradient-to-br from-[#1a0a0c] to-[#111] px-5 py-5 sm:px-6 sm:py-6 ${className}`}
      aria-label={`${BRAND_NAME_PRO} next step`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-[#E30613]/90">
        Next step · {BRAND_NAME_PRO}
      </p>
      <p className="mt-2 text-base font-semibold text-white sm:text-lg">
        {FREE_CATALOG_PRO_TEASER}
      </p>
      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#a3a3a3]">
        {FREE_CATALOG_PRO_TEASER_DETAIL}
      </p>
      <Link
        href="/pro"
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E30613] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
      >
        {FREE_CATALOG_PRO_CTA}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </aside>
  );
}
