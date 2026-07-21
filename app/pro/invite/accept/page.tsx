import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { InviteMagicLinkForm } from "@/components/auth/InviteMagicLinkForm";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { hasProInviteAccess, isProInviteOnly } from "@/lib/pro/invite-gate";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";

export const metadata: Metadata = {
  title: `Accept invite — ${BRAND_NAME_PRO}`,
  description: "Open your invite and sign in with a one-click email link.",
};

type Props = {
  searchParams: Promise<{ next?: string }>;
};

/**
 * Post-invite landing: email → Supabase magic link (almost one-click).
 * Requires a valid invite cookie when PRO_INVITE_ONLY=1.
 */
export default async function InviteAcceptPage({ searchParams }: Props) {
  const { next: nextRaw } = await searchParams;
  const next = safeNextPath(nextRaw, "/pro/app");

  if (isProInviteOnly() && !(await hasProInviteAccess())) {
    redirect("/pro?invite=invalid");
  }

  return (
    <AuthPageShell mode="signup" next={next} minimalChrome>
      <InviteMagicLinkForm next={next} />
    </AuthPageShell>
  );
}
