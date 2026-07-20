import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { proMarketing } from "@/components/pro/pro-marketing-surfaces";
import { PRO_MARKETING_TRUST } from "@/lib/pro/marketing-copy";

type Props = {
  className?: string;
  /** Tighter single-column layout for mobile subscribe card. */
  compact?: boolean;
};

export function ProMarketingTrustStrip({ className, compact = false }: Props) {
  return (
    <ul
      className={cn(
        "grid gap-2",
        compact ? "grid-cols-1" : "sm:grid-cols-3",
        className
      )}
      aria-label="Why directors trust 35mmAiPro"
    >
      {PRO_MARKETING_TRUST.map((line) => (
        <li key={line} className="flex gap-2 text-xs leading-relaxed text-pro-text-secondary sm:text-sm">
          <Check className={`mt-0.5 size-3.5 shrink-0 ${proMarketing.checkPro}`} aria-hidden />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}
