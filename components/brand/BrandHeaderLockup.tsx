import { BrandTagline } from "@/components/brand/BrandTagline";
import { Logo35mmAI } from "@/components/brand/Logo35mmAI";
import { ProBadge } from "@/components/brand/ProBadge";
import { cn } from "@/lib/utils";

type Props = {
  logoClassName?: string;
  showTagline?: boolean;
  className?: string;
  /** Center stack for auth / marketing hero. Default left for app chrome. */
  align?: "left" | "center";
  logoHref?: string;
};

const defaultLogoClass = "text-[32px] sm:text-[34px]";

/** Logo + PRO on one row; tagline below */
export function BrandHeaderLockup({
  logoClassName = defaultLogoClass,
  showTagline = true,
  className,
  align = "left",
  logoHref = "/",
}: Props) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "min-w-0",
        centered && "flex w-full flex-col items-center text-center",
        className
      )}
    >
      <div
        className={cn(
          "inline-flex items-center gap-1.5 sm:gap-2",
          centered && "justify-center"
        )}
      >
        <Logo35mmAI className={logoClassName} href={logoHref} />
        <ProBadge variant="header" className="shrink-0 self-center" title="Pro" />
      </div>
      {showTagline ? (
        <BrandTagline
          className={cn(
            "-mt-0.5 leading-tight",
            centered && "mt-0.5 text-center"
          )}
        />
      ) : null}
    </div>
  );
}
