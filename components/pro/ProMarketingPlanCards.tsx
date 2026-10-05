import Link from "next/link";
import { Check } from "lucide-react";
import { proBtn } from "@/components/pro/ux/pro-surfaces";
import { loginHref, signUpHref } from "@/lib/auth/safe-next-path";
import { CATALOG_PATHS } from "@/lib/catalog-routes";
import { FREE_VS_PRO_HIGHLIGHTS } from "@/lib/pro/free-vs-pro";
import {
  PRO_MARKETING_CTA_CREATE_TRIAL,
  PRO_MARKETING_CTA_TRIAL,
  PRO_MARKETING_PRICE,
} from "@/lib/pro/marketing-copy";

type Props = {
  signedIn: boolean;
  /** Home compares Free and Pro. The Pro page shows only the studio card. */
  layout?: "both" | "pro";
};

function ProPlanCard({
  signedIn,
  subscribeHref,
  subscribeLabel,
}: {
  signedIn: boolean;
  subscribeHref: string;
  subscribeLabel: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-pro-accent/55 bg-pro-elevated p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)] ring-1 ring-pro-accent/25 sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pro-accent-bright">
        Pro
      </p>
      <p className="mt-3 font-[family-name:var(--font-cinema)] text-5xl font-bold tracking-tight text-pro-text">
        {PRO_MARKETING_PRICE.label}
        <span className="ml-1 text-xl font-semibold text-pro-text-secondary">
          {PRO_MARKETING_PRICE.suffix}
        </span>
      </p>
      <p className="mt-2 text-sm font-medium text-pro-text">{PRO_MARKETING_PRICE.currencyNote}</p>
      <ul className="mt-5 space-y-2.5">
        {FREE_VS_PRO_HIGHLIGHTS.pro.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-pro-text">
            <Check className="mt-0.5 size-4 shrink-0 text-pro-accent" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-6 sm:mt-auto">
        <Link href={subscribeHref} className={`${proBtn.marketingPrimary} h-11 w-full justify-center px-6`}>
          {subscribeLabel}
        </Link>
        {signedIn ? null : (
          <Link
            href={loginHref("/account")}
            className="mt-3 block text-center text-sm text-pro-text-secondary underline-offset-4 hover:text-pro-text hover:underline"
          >
            Sign in
          </Link>
        )}
      </div>
    </article>
  );
}

/** Free catalog and the $15 studio. Home shows both; /pro shows the studio only. */
export function ProMarketingPlanCards({ signedIn, layout = "both" }: Props) {
  const subscribeHref = signedIn ? "/account" : signUpHref("/account");
  const subscribeLabel = signedIn ? PRO_MARKETING_CTA_TRIAL : PRO_MARKETING_CTA_CREATE_TRIAL;

  if (layout === "pro") {
    return (
      <section aria-labelledby="pro-plans-heading" className="mx-auto w-full max-w-5xl">
        <h1 id="pro-plans-heading" className="sr-only">
          Pro {PRO_MARKETING_PRICE.fullLabel}
        </h1>
        <article className="grid items-center gap-8 rounded-2xl border border-pro-accent/55 bg-pro-elevated p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)] ring-1 ring-pro-accent/25 sm:p-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pro-accent-bright">
              Pro
            </p>
            <p className="mt-3 font-[family-name:var(--font-cinema)] text-5xl font-bold tracking-tight text-pro-text sm:text-6xl">
              {PRO_MARKETING_PRICE.label}
              <span className="ml-1 align-baseline text-xl font-semibold text-pro-text-secondary sm:text-2xl">
                {PRO_MARKETING_PRICE.suffix}
              </span>
            </p>
            <p className="mt-2 text-sm text-pro-text-secondary">{PRO_MARKETING_PRICE.currencyNote}</p>
          </div>
          <div>
            <ul className="space-y-3">
              {FREE_VS_PRO_HIGHLIGHTS.pro.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-pro-text">
                  <Check className="mt-0.5 size-4 shrink-0 text-pro-accent" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={subscribeHref} className={`${proBtn.marketingPrimary} mt-6 h-11 w-full justify-center px-6`}>
              {subscribeLabel}
            </Link>
            {signedIn ? null : (
              <Link
                href={loginHref("/account")}
                className="mt-3 block text-center text-sm text-pro-text-secondary underline-offset-4 hover:text-pro-text hover:underline"
              >
                Sign in
              </Link>
            )}
          </div>
        </article>
      </section>
    );
  }

  return (
    <section aria-labelledby="pro-plans-heading" className="mx-auto w-full max-w-5xl">
      <div className="mx-auto mb-6 max-w-2xl text-center">
        <h1
          id="pro-plans-heading"
          className="font-[family-name:var(--font-cinema)] text-2xl font-bold tracking-tight text-pro-text sm:text-3xl"
        >
          The catalog is free. The studio is a subscription.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-pro-text-secondary sm:text-base">
          Browse the catalog free, or subscribe and leave with a prompt for every shot.
        </p>
      </div>

      <div className="grid items-stretch gap-4 md:grid-cols-2">
        <article className="flex flex-col rounded-2xl border border-white/[0.08] bg-pro-elevated/80 p-6 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pro-text-secondary">
            Free
          </p>
          <p className="mt-3 font-[family-name:var(--font-cinema)] text-5xl font-bold tracking-tight text-pro-text">
            $0
          </p>
          <p className="mt-2 text-sm font-medium text-pro-text">New AI tools every week</p>
          <ul className="mt-5 space-y-2.5">
            {FREE_VS_PRO_HIGHLIGHTS.free.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-pro-text-secondary">
                <Check className="mt-0.5 size-4 shrink-0 text-white/30" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href={CATALOG_PATHS.tools}
            className={`${proBtn.secondary} mt-6 h-11 w-full justify-center sm:mt-auto`}
          >
            Open free catalog
          </Link>
        </article>

        <ProPlanCard
          signedIn={signedIn}
          subscribeHref={subscribeHref}
          subscribeLabel={subscribeLabel}
        />
      </div>
    </section>
  );
}
