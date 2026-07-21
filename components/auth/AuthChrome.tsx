import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { BrandHeaderLockup } from "@/components/brand/BrandHeaderLockup";
import { proNavPill } from "@/components/pro/ux/pro-surfaces";

type Props = {
  subtitle?: string;
  layout?: "center" | "bar";
  dashboardHref?: string;
  workspaceHref?: string;
  showTagline?: boolean;
  /** Center layout only — hide when header already shows logo (login/sign-up). */
  showLogo?: boolean;
  logoHref?: string;
};

export function AuthChrome({
  subtitle,
  layout = "center",
  dashboardHref,
  workspaceHref,
  showTagline = true,
  showLogo = true,
  logoHref = "/pro",
}: Props) {
  if (layout === "bar") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BrandHeaderLockup showTagline={showTagline} logoHref={logoHref} />
        <div className="flex flex-wrap items-center gap-2">
          {dashboardHref ? (
            <Link href={dashboardHref} className={proNavPill(false)}>
              Dashboard
            </Link>
          ) : null}
          {workspaceHref ? (
            <Link href={workspaceHref} className={proNavPill(false)}>
              <LayoutGrid className="size-3.5" aria-hidden />
              Workspace
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <header className="flex w-full flex-col items-center gap-2 text-center">
      {showLogo ? (
        <BrandHeaderLockup
          align="center"
          showTagline={showTagline}
          logoHref={logoHref}
          logoClassName="text-[30px] sm:text-[32px]"
        />
      ) : subtitle ? (
        <h1 className="max-w-sm text-xl font-semibold tracking-tight text-pro-text sm:max-w-md sm:text-2xl">
          {subtitle}
        </h1>
      ) : null}
      {showLogo && subtitle ? (
        <p className="max-w-sm text-sm leading-relaxed text-pro-text-secondary sm:max-w-md">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
