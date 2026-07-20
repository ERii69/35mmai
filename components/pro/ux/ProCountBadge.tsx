import { proNavCountBadge } from "@/components/pro/ux/pro-surfaces";

type Props = {
  count: number;
  /** Accessible label when the badge is number-only (e.g. "5 projects"). */
  label?: string;
  className?: string;
};

/** Pill count badge — matches Archives nav styling. */
export function ProCountBadge({ count, label, className = "" }: Props) {
  if (count <= 0) return null;

  return (
    <span
      className={`${proNavCountBadge} ${className}`}
      aria-label={label}
      title={label}
    >
      {count}
    </span>
  );
}
