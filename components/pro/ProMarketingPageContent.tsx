import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Logo35mmAI } from "@/components/brand/Logo35mmAI";
import { ProBadge } from "@/components/brand/ProBadge";
import { ProMarketingAboutCompareMobile } from "@/components/pro/ProMarketingAboutMobile";
import { ProMarketingCompareTiers } from "@/components/pro/ProMarketingCompareTiers";
import { ProMarketingInfoBottomStrip } from "@/components/pro/ProMarketingInfoBottomStrip";
import { ProMarketingSubscribeCard } from "@/components/pro/ProMarketingSubscribeCard";
import { ProMarketingWorkflowsSection } from "@/components/pro/ProMarketingWorkflowsSection";
import { proBtn, proWebShell } from "@/components/pro/ux/pro-surfaces";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import { PRO_MARKETING_HEADLINE, PRO_MARKETING_SUBHEAD } from "@/lib/pro/marketing-copy";
import { PRO_CONTINUE_STUDIO_LABEL } from "@/lib/pro/pro-nav-labels";

function ProMarketingHeroBrand({ size = "md" }: { size?: "sm" | "md" }) {
  const wordmark =
    size === "sm"
      ? "pointer-events-none text-[2.25rem] leading-none sm:text-[2.5rem]"
      : "pointer-events-none text-[2.75rem] leading-none sm:text-[3.25rem]";
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
      <Logo35mmAI
        href="/pro"
        className={wordmark}
        aria-label={BRAND_NAME_PRO}
      />
      <ProBadge variant="header" className="shrink-0" title="Pro" />
    </div>
  );
}

type Props = {
  stackReady: boolean;
  signedIn: boolean;
  entitled: boolean;
};

/** Entitled subscribers — logo, one line, one button. No marketing chrome. */
function ProMarketingEntitledLanding() {
  return (
    <>
      <div className={`relative z-10 mx-auto py-16 md:py-24 ${proWebShell.main}`}>
        <div className="mx-auto max-w-lg space-y-6 text-center">
          <ProMarketingHeroBrand />
          <h1 className={`${proWebShell.heroTitle} text-pro-text`}>{PRO_MARKETING_HEADLINE}</h1>
          <p className="text-base leading-relaxed text-pro-text-secondary sm:text-lg">
            {PRO_MARKETING_SUBHEAD}
          </p>
          <Link
            href="/pro/app"
            className={`${proBtn.primary} mx-auto h-11 min-w-[14rem] justify-center text-[15px]`}
          >
            <LayoutGrid className="size-4" aria-hidden />
            {PRO_CONTINUE_STUDIO_LABEL}
          </Link>
        </div>
      </div>
    </>
  );
}

/** Prospects — brand + headline first, then subscribe, workflows, compare. */
function ProMarketingProspectLanding({ stackReady, signedIn, entitled }: Props) {
  const subscribeProps = {
    stackReady,
    signedIn,
    entitled,
    hideStackWarning: !stackReady,
    sectionId: "pro-subscribe",
  };

  return (
    <>
      <div className={`relative z-10 mx-auto space-y-10 pb-12 pt-6 md:hidden ${proWebShell.main}`}>
        <header className="space-y-4 text-center">
          <ProMarketingHeroBrand size="sm" />
          <h1 className="text-xl font-bold leading-snug text-pro-text">{PRO_MARKETING_HEADLINE}</h1>
          <p className="text-sm leading-relaxed text-pro-text-secondary">{PRO_MARKETING_SUBHEAD}</p>
        </header>

        <ProMarketingSubscribeCard {...subscribeProps} showTrustStrip />

        <ProMarketingWorkflowsSection headingId="pro-workflows-heading-mobile" />

        <section id="pro-compare" aria-labelledby="pro-compare-heading-mobile" className="space-y-3">
          <h2
            id="pro-compare-heading-mobile"
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pro-text-secondary"
          >
            Compare tiers
          </h2>
          <ProMarketingAboutCompareMobile />
        </section>
      </div>

      <div className={`relative z-10 mx-auto hidden md:block ${proWebShell.main} md:py-10 lg:py-12`}>
        <div className="mx-auto max-w-3xl space-y-10">
          <header className="mx-auto max-w-2xl space-y-4 text-center">
            <ProMarketingHeroBrand />
            <h1 className={`${proWebShell.heroTitle} text-pro-text`}>{PRO_MARKETING_HEADLINE}</h1>
            <p className="text-base leading-relaxed text-pro-text-secondary sm:text-lg">
              {PRO_MARKETING_SUBHEAD}
            </p>
          </header>

          <ProMarketingSubscribeCard {...subscribeProps} showTrustStrip />

          <ProMarketingWorkflowsSection />

          <section aria-labelledby="compare-tiers-heading" className="space-y-3">
            <h2
              id="compare-tiers-heading"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pro-text-secondary"
            >
              Compare tiers
            </h2>
            <div id="pro-compare">
              <ProMarketingCompareTiers />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export function ProMarketingPageContent(props: Props) {
  if (props.entitled) {
    return <ProMarketingEntitledLanding />;
  }

  return (
    <>
      <ProMarketingProspectLanding {...props} />
      {props.signedIn ? (
        <div className={`${proWebShell.main} pb-8 md:pb-12`}>
          <ProMarketingInfoBottomStrip
            signedIn={props.signedIn}
            entitled={props.entitled}
            stackReady={props.stackReady}
            returnPath="/pro"
          />
        </div>
      ) : null}
    </>
  );
}
