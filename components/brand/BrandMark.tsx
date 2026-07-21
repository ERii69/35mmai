import { cn } from "@/lib/utils";
import { BRAND_I_DOT } from "@/lib/brand/brand-identity";

type Props = {
  className?: string;
  size?: number | string;
  variant?: "default" | "standalone";
  title?: string;
};

/** Favicon — natural “i” + small red tittle */
export function BrandMark({
  className,
  size = "1em",
  variant = "default",
  title,
}: Props) {
  const dotR = variant === "standalone" ? 4.9 : 4.3;
  const dotCy = variant === "standalone" ? 5.35 : 4.95;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <text
        x="12"
        y="18"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={variant === "standalone" ? 15 : 13}
        fontWeight="700"
      >
        i
      </text>
      <circle cx="12" cy={dotCy} r={dotR} fill={BRAND_I_DOT} />
    </svg>
  );
}
