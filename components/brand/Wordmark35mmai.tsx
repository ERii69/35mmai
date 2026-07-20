import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand/brand-identity";

type Props = {
  className?: string;
  /** “mm” segment — white on dark UI, dark on light */
  mmClassName?: string;
  title?: string;
};

/** Wordmark: 35 + mm + Ai (canonical spelling 35mmAi). */
export function Wordmark35mmai({
  className,
  mmClassName = "text-white",
  title = BRAND_NAME,
}: Props) {
  return (
    <span
      role="img"
      aria-label={title}
      className={cn(
        "inline-flex items-baseline whitespace-nowrap font-sans font-extrabold leading-none tracking-widest antialiased",
        className
      )}
    >
      <span className="text-pro-primary">35</span>
      <span className={mmClassName}>mm</span>
      <span className="text-pro-primary">Ai</span>
    </span>
  );
}

/** Alias matching product spelling */
export const Wordmark35mmAI = Wordmark35mmai;
