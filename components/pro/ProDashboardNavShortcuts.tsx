import Link from "next/link";
import {
  PRO_NAV_SEQUENCE_PREFIX,
  PRO_NAV_SEQUENCE_SHORTCUTS,
  resolveNavSequenceHref,
} from "@/lib/pro/nav-sequence-shortcuts";

const kbdClass =
  "rounded-md bg-pro-muted/70 px-1.5 py-0.5 font-mono text-xs font-medium text-pro-text-secondary ring-1 ring-white/[0.06]";

type Props = {
  className?: string;
  workspaceHref?: string | null;
  exportsHref?: string | null;
};

function SequenceHint({
  secondKey,
  label,
}: {
  secondKey: string;
  label: string;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5">
      <kbd className={kbdClass}>
        {PRO_NAV_SEQUENCE_PREFIX.toUpperCase()}+{secondKey.toUpperCase()}
      </kbd>
      <span>{label}</span>
    </span>
  );
}

/** Nav shortcut reference — G+key, or click the label. */
export function ProDashboardNavShortcuts({
  className = "",
  workspaceHref = "/pro/app/workspace",
  exportsHref = "/pro/app/workspace",
}: Props) {
  return (
    <p
      className={`max-w-3xl text-sm leading-relaxed text-pro-text-secondary/75 ${className}`}
    >
      <span className="text-pro-text-secondary/80">Shortcuts: </span>
      {PRO_NAV_SEQUENCE_SHORTCUTS.map((item, i) => {
        const href = resolveNavSequenceHref(item.id, {
          workspace: workspaceHref,
          exports: exportsHref,
        });
        return (
          <span key={item.id}>
            {i > 0 ? (
              <span className="mx-1.5 text-pro-text-secondary/40" aria-hidden>
                ·
              </span>
            ) : null}
            {href ? (
              <Link
                href={href}
                className="rounded-sm hover:text-pro-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/40"
              >
                <SequenceHint secondKey={item.secondKey} label={item.label} />
              </Link>
            ) : (
              <SequenceHint secondKey={item.secondKey} label={item.label} />
            )}
          </span>
        );
      })}
    </p>
  );
}
