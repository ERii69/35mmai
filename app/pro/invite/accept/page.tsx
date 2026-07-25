import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { InvitePasswordForm } from "@/components/auth/InvitePasswordForm";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { hasProInviteAccess, isProInviteOnly } from "@/lib/pro/invite-gate";
import { BRAND_NAME_PRO } from "@/lib/brand/brand-identity";

export const metadata: Metadata = {
  title: `Accept invite — ${BRAND_NAME_PRO}`,
  description: "Create your password and open the 35mmAiPro studio.",
};

type Props = {
  searchParams: Promise<{ next?: string }>;
};

/**
 * Post-invite landing: email + password → studio.
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
      <InvitePasswordForm next={next} />
    </AuthPageShell>
  );
}
