import { ProMarketingAuthCard } from "@/components/pro/ProMarketingAuthCard";
import { PRO_TRIAL_SIGNUP_HREF } from "@/lib/pro/marketing-about";
import type { ReactNode } from "react";
import { proWebShell } from "@/components/pro/ux/pro-surfaces";

type Props = {
  title: string;
  children: ReactNode;
  stackReady: boolean;
  signedIn: boolean;
  entitled: boolean;
  returnPath: string;
  page: "privacy" | "terms";
};

export function ProMarketingLegalPageContent({
  title,
  children,
  stackReady,
  signedIn,
  entitled,
  returnPath,
}: Props) {
  return (
    <main className={`${proWebShell.mainNarrow} space-y-8 pb-12 pt-6 md:pb-14 md:pt-8`}>
      <div>
        <h1 className={proWebShell.pageTitle}>{title}</h1>
        <div className="prose prose-invert mt-6 max-w-none prose-p:text-pro-text-secondary prose-headings:text-pro-text prose-li:text-pro-text-secondary prose-strong:text-pro-text md:mt-8">
          {children}
        </div>
      </div>

      {!entitled ? (
        <ProMarketingAuthCard
          stackReady={stackReady}
          signedIn={signedIn}
          entitled={entitled}
          returnPath={returnPath}
          trialHref={PRO_TRIAL_SIGNUP_HREF}
        />
      ) : null}
    </main>
  );
}
