import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** light = white. amber = marketing-only legacy. red/header = cinematic seal. */
  variant?: "light" | "amber" | "red" | "header";
  title?: string;
};

/** PRO mark — same cinematic red as CTAs (seal gradient for depth). */
export function ProBadge({ className, variant = "header", title }: Props) {
  const seal =
    variant === "header" || variant === "red"
      ? [
          "h-7 rounded-lg px-2 text-[13px] tracking-[0.14em] sm:h-8 sm:px-2.5 sm:text-[15px]",
          "bg-gradient-to-b from-pro-cinematic-bright to-pro-primary text-white",
          "ring-1 ring-inset ring-white/20",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
        ]
      : null;

  return (
    <span
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-bold uppercase leading-none",
        seal,
        variant === "light" &&
          "h-7 rounded-lg bg-white px-2.5 text-[13px] tracking-[0.14em] text-black",
        variant === "amber" &&
          "h-7 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 px-2.5 text-[13px] tracking-[0.14em] text-zinc-950",
        className
      )}
    >
      PRO
    </span>
  );
}
