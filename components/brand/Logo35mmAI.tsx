import Link from "next/link";
import { Wordmark35mmai } from "@/components/brand/Wordmark35mmai";
import { BRAND_NAME } from "@/lib/brand/brand-identity";

type Props = {
  className?: string;
  mmClassName?: string;
  href?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

/** Wordmark link — 35 + mm + Ai lockup */
export function Logo35mmAI({
  className = "text-[30px] sm:text-[32px]",
  mmClassName,
  href = "/",
  onClick,
  "aria-label": ariaLabel = `${BRAND_NAME} home`,
}: Props) {
  return (
    <Link href={href} className="shrink-0" aria-label={ariaLabel} onClick={onClick}>
      <Wordmark35mmai className={className} mmClassName={mmClassName} title={ariaLabel} />
    </Link>
  );
}
