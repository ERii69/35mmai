import { BRAND_NAME } from "@/lib/brand/brand-identity";
import { cn } from "@/lib/utils";
import { Wordmark35mmai } from "@/components/brand/Wordmark35mmai";

type Props = {
  className?: string;
  label?: string;
};

/** Centered wordmark for route loading states */
export function BrandMarkLoader({ className, label = "Loading workspace" }: Props) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <Wordmark35mmai className="text-4xl sm:text-5xl" title={BRAND_NAME} />
      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{label}</p>
    </div>
  );
}
