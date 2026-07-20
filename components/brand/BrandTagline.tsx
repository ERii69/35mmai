import { cn } from "@/lib/utils";
import { BRAND_TAGLINE } from "@/lib/brand/brand-identity";

type Props = {
  className?: string;
};

export function BrandTagline({ className }: Props) {
  return (
    <p
      className={cn(
        "text-[11px] font-medium uppercase tracking-[0.11em] text-pro-text-secondary sm:text-xs sm:tracking-[0.13em]",
        className
      )}
    >
      {BRAND_TAGLINE}
    </p>
  );
}
