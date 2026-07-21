import Link from "next/link";
import { BRAND_NAME, BRAND_NAME_PRO } from "@/lib/brand/brand-identity";

type Props = {
  className?: string;
};

/** Site-wide footer — matches the main 35mmAi catalog homepage. */
export function SiteFooter({ className = "" }: Props) {
  return (
    <footer
      className={`mt-auto shrink-0 border-t border-[#333] py-6 text-center text-sm text-[#666] md:py-8 ${className}`}
    >
      <div className="mx-auto max-w-5xl px-6">
        <p>
          © 2026 {BRAND_NAME} • Built for independent filmmakers
        </p>
        <p className="mt-2 text-xs text-[#888]">
          Free catalog discovers tools · {BRAND_NAME_PRO} turns script + look into prompt packs
        </p>
        <p className="mt-2 text-xs">
          FTC: Some links are affiliate links. We may earn a commission at no extra cost to you. Picks
          stay editorially independent.
        </p>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
          <Link
            href="/about"
            className="text-[#888] underline-offset-2 transition-colors hover:text-[#e11d48] hover:underline"
          >
            About
          </Link>
          <span className="text-[#444]" aria-hidden>
            ·
          </span>
          <Link
            href="/pro"
            className="text-[#888] underline-offset-2 transition-colors hover:text-[#e11d48] hover:underline"
          >
            Pro
          </Link>
        </p>
        <p className="mt-6 text-xs text-[#555]">Made with ❤️ for the film community</p>
      </div>
    </footer>
  );
}
