import Link from "next/link";
import { redirect } from "next/navigation";
import { ProMarketingInfoPageShell } from "@/components/pro/ProMarketingInfoPageShell";
import { ProMarketingPageContent } from "@/components/pro/ProMarketingPageContent";
import { getProMarketingSession } from "@/lib/pro/marketing-session";
import { PRO_STACK_ENV_HINT } from "@/lib/pro-stack-config";
import { CATALOG_PATHS } from "@/lib/catalog-routes";

type Search = { subscribe?: string; invite?: string };

/** Home compares Free and Pro. /pro is the studio card plus How Pro works. */
export async function ProPublicLanding({
  searchParams,
  surface = "pro",
}: {
  searchParams: Promise<Search>;
  surface?: "home" | "pro";
}) {
  const { subscribe, invite } = await searchParams;
  const subscribeRequired = subscribe === "required";
  const invalidInvite = invite === "invalid";

  const {
    userEmail,
    userMetadata,
    entitled,
    canManageBilling,
    stackReady,
    signedIn,
    inviteOnly,
    inviteUnlocked,
    checkoutEnabled,
  } = await getProMarketingSession();

  if (entitled) {
    redirect("/pro/app");
  }

  return (
    <ProMarketingInfoPageShell
      userEmail={userEmail}
      userMetadata={userMetadata}
      entitled={entitled}
      canManageBilling={canManageBilling}
      subscribeRequired={subscribeRequired}
      checkoutEnabled={checkoutEnabled}
    >
      {!stackReady ? (
        <div className="border-b border-pro-warning/30 bg-pro-warning/10 px-4 py-3 text-center text-sm text-pro-warning">
          {PRO_STACK_ENV_HINT} The free catalog at{" "}
          <Link href={CATALOG_PATHS.home} className="font-medium text-white underline-offset-2 hover:underline">
            Tools
          </Link>{" "}
          works without backend keys.
        </div>
      ) : null}
      <ProMarketingPageContent
        stackReady={stackReady}
        signedIn={signedIn}
        entitled={entitled}
        inviteOnly={inviteOnly}
        inviteUnlocked={inviteUnlocked}
        checkoutEnabled={checkoutEnabled}
        invalidInvite={invalidInvite}
        surface={surface}
      />
    </ProMarketingInfoPageShell>
  );
}
