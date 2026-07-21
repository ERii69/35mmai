import Link from "next/link";
import { Logo35mmAI } from "@/components/brand/Logo35mmAI";
import { ProBadge } from "@/components/brand/ProBadge";
import { ProMarketingInfoBottomStrip } from "@/components/pro/ProMarketingInfoBottomStrip";
import { ProMarketingStepsSection } from "@/components/pro/ProMarketingStepsSection";
import { ProMarketingSubscribeCard } from "@/components/pro/ProMarketingSubscribeCard";
import { proBtn, proWebShell } from "@/components/pro/ux/pro-surfaces";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import {
  PRO_INVITE_ONLY_EYEBROW,
  PRO_MARKETING_HEADLINE,
  PRO_MARKETING_SUBHEAD,
} from "@/lib/pro/marketing-copy";
import { loginHref } from "@/lib/auth/safe-next-path";
import { PRO_CONTINUE_STUDIO_LABEL } from "@/lib/pro/pro-nav-labels";

type Props = {
  stackReady: boolean;
  signedIn: boolean;
  entitled: boolean;
  inviteOnly?: boolean;
  inviteUnlocked?: boolean;
  checkoutEnabled?: boolean;
  invalidInvite?: boolean;
};

/** Product visual — screenplay slug → prompt line (not a card grid). */
function ProMarketingHeroProductFrame() {
  return (
    <div
      className="pro-hero-frame mx-auto w-full max-w-xl overflow-hidden rounded-sm border border-white/[0.1] bg-black/40 text-left shadow-[0_24px_80px_-32px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.04]"
      aria-hidden
    >
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.03] px-3 py-2">
        <span className="size-1.5 rounded-full bg-white/25" />
        <span className="size-1.5 rounded-full bg-white/25" />
        <span className="size-1.5 rounded-full bg-white/25" />
        <span className="ml-2 font-[family-name:var(--font-cinema)] text-[10px] uppercase tracking-[0.2em] text-pro-text-secondary/70">
          Scene 3 · INT. NIGHT
        </span>
      </div>
      <div className="space-y-3 px-4 py-4 font-mono text-[11px] leading-relaxed sm:px-5 sm:py-5 sm:text-xs">
        <p className="text-pro-text-secondary/90">
          Rain on the glass. She doesn&apos;t turn when he enters.
        </p>
        <div className="border-t border-dashed border-white/[0.08] pt-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-pro-text-secondary/55">
            Prompt pack · Midjourney
          </p>
          <p className="mt-1.5 text-pro-text/90">
            cinematic still, wet window reflections, cool tungsten practicals, 35mm anamorphic
            shallow depth…
          </p>
        </div>
      </div>
    </div>
  );
}

function ProMarketingHero({
  signedIn,
  inviteUnlocked,
  inviteOnly,
}: {
  signedIn: boolean;
  inviteUnlocked: boolean;
  inviteOnly: boolean;
}) {
  const showRequestCta = inviteOnly && !signedIn;
  const showStudioCta = signedIn && inviteUnlocked;

  return (
    <section
      className="pro-marketing-hero relative isolate overflow-hidden"
      aria-labelledby="pro-marketing-hero-heading"
    >
      <div className="pro-marketing-hero-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="pro-marketing-hero-letterbox pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" aria-hidden />
      <div className="pro-marketing-hero-letterbox pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden />

      <div className={`relative z-10 mx-auto py-8 md:py-10 ${proWebShell.main}`}>
        <div className="mx-auto grid w-full max-w-5xl items-center gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 lg:text-left">
          <div className="mx-auto max-w-xl space-y-4 text-center lg:mx-0 lg:text-left">
            <p className="pro-hero-enter pro-hero-enter-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-pro-text-secondary">
              {inviteOnly ? PRO_INVITE_ONLY_EYEBROW : "Script to prompt"}
            </p>
            <h1
              id="pro-marketing-hero-heading"
              className="pro-hero-enter pro-hero-enter-2 font-[family-name:var(--font-cinema)] text-[2.15rem] font-bold leading-[1.05] tracking-tight text-pro-text sm:text-4xl md:text-[2.85rem]"
            >
              {PRO_MARKETING_HEADLINE}
            </h1>
            <p className="pro-hero-enter pro-hero-enter-3 text-sm leading-relaxed text-pro-text-secondary sm:text-base">
              {PRO_MARKETING_SUBHEAD}
            </p>

            <div className="pro-hero-enter pro-hero-enter-4 flex flex-col items-center gap-2.5 sm:flex-row sm:flex-wrap lg:justify-start">
              {showStudioCta ? (
                <Link
                  href="/pro/app"
                  className={`${proBtn.secondary} h-11 min-w-[12rem] justify-center px-6`}
                >
                  {PRO_CONTINUE_STUDIO_LABEL}
                </Link>
              ) : null}
              {showRequestCta ? (
                <a
                  href="#pro-subscribe"
                  className={`${proBtn.secondary} h-11 min-w-[12rem] justify-center px-6`}
                >
                  Request access
                </a>
              ) : null}
              {!signedIn ? (
                <Link
                  href={loginHref("/pro")}
                  className="text-sm font-medium text-pro-text-secondary underline-offset-4 transition hover:text-pro-text hover:underline"
                >
                  Sign in
                </Link>
              ) : null}
            </div>
          </div>

          <div className="pro-hero-enter pro-hero-enter-3 px-1 sm:px-4 lg:px-0">
            <ProMarketingHeroProductFrame />
            <p className="mt-2 text-center font-[family-name:var(--font-cinema)] text-[11px] uppercase tracking-[0.2em] text-pro-text-secondary/50 lg:text-left">
              Script → Look → Prompt pack
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Entitled subscribers — compact handoff (usually redirected to /pro/app). */
function ProMarketingEntitledLanding() {
  return (
    <div className={`relative z-10 mx-auto py-16 md:py-24 ${proWebShell.main}`}>
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <Logo35mmAI
            href="/pro/app"
            className="pointer-events-none text-[2.5rem] leading-none"
            aria-label={BRAND_NAME_PRO}
          />
          <ProBadge variant="header" className="shrink-0" title="Pro" />
        </div>
        <h1 className={`${proWebShell.heroTitle} text-pro-text`}>{PRO_MARKETING_HEADLINE}</h1>
        <Link
          href="/pro/app"
          className={`${proBtn.secondary} mx-auto h-11 min-w-[14rem] justify-center text-[15px]`}
        >
          {PRO_CONTINUE_STUDIO_LABEL}
        </Link>
      </div>
    </div>
  );
}

function ProMarketingProspectLanding({
  stackReady,
  signedIn,
  entitled,
  inviteOnly = false,
  inviteUnlocked = true,
  checkoutEnabled = true,
  invalidInvite = false,
}: Props) {
  const subscribeProps = {
    stackReady,
    signedIn,
    entitled,
    inviteOnly,
    inviteUnlocked,
    checkoutEnabled,
    invalidInvite,
    hideStackWarning: !stackReady,
    sectionId: "pro-subscribe",
  };

  return (
    <>
      <ProMarketingHero
        signedIn={signedIn}
        inviteUnlocked={inviteUnlocked}
        inviteOnly={inviteOnly}
      />

      <div
        className={`relative z-10 mx-auto space-y-8 pb-8 pt-8 md:pb-14 md:pt-12 ${proWebShell.main}`}
      >
        <div className="mx-auto max-w-5xl">
          <ProMarketingStepsSection />
        </div>

        <div className="mx-auto max-w-3xl">
          <ProMarketingSubscribeCard {...subscribeProps} />
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
