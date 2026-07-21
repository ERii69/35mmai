import Link from "next/link";
import { proBtn, proSurface, proWebShell } from "@/components/pro/ux/pro-surfaces";
import { PRO_STACK_ENV_HINT } from "@/lib/pro-stack-config";

type Props = {
  /** Where the user tried to go (for copy only). */
  context?: "workspace" | "account";
};

export function ProStackUnavailable({ context = "workspace" }: Props) {
  const title =
    context === "account" ? "Account requires backend configuration" : "35mmAiPro is not enabled here";

  return (
    <div className={`${proWebShell.main} flex flex-1 flex-col justify-center py-16`}>
      <div className={`mx-auto max-w-lg space-y-6 ${proSurface.sectionMuted}`}>
          <h1 className={proWebShell.pageTitle}>{title}</h1>
          <p className="text-sm leading-relaxed text-pro-text-secondary">
            This deployment is running the free 35mmAI catalog only. Subscription, cloud projects, and
            exports need Supabase and Stripe environment variables. Without them, Pro routes stay inert and
            the home page at{" "}
            <Link href="/" className="text-pro-primary hover:underline">
              /
            </Link>{" "}
            continues to work.
          </p>
          <p className="text-sm text-pro-text-secondary/80">{PRO_STACK_ENV_HINT}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/" className={`${proBtn.secondary} px-4 py-2`}>
              ← Free catalog
            </Link>
            <Link href="/pro" className={`${proBtn.secondary} px-4 py-2`}>
              Pro marketing
            </Link>
          </div>
      </div>
    </div>
  );
}
