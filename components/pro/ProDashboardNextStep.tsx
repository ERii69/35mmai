import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  workspaceHref: string | null;
};

export function ProDashboardNextStep({ workspaceHref }: Props) {
  if (!workspaceHref) return null;

  return (
    <section
      className="hidden flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-pro-elevated/60 px-4 py-3.5 sm:flex sm:px-5"
      aria-label="Suggested next step"
    >
      <p className="text-sm text-pro-text-secondary">
        <span className="font-medium text-pro-text">Next:</span> Run prep → refine look → export from
        Production
      </p>
      <Link
        href={workspaceHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-pro-primary transition hover:underline"
      >
        Open default workspace
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}
