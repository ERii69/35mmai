import {
  PRO_NAV_SEQUENCE_PREFIX,
  PRO_NAV_SEQUENCE_SHORTCUTS,
} from "@/lib/pro/nav-sequence-shortcuts";

const kbdClass =
  "rounded-md bg-pro-muted/70 px-1.5 py-0.5 font-mono text-xs font-medium text-pro-text-secondary ring-1 ring-white/[0.06]";

type Props = {
  className?: string;
};

function SequenceHint({
  secondKey,
  label,
}: {
  secondKey: string;
  label: string;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-0.5">
      <kbd className={kbdClass}>{PRO_NAV_SEQUENCE_PREFIX.toUpperCase()}</kbd>
      <span className="text-pro-text-secondary/55">then</span>
      <kbd className={kbdClass}>{secondKey.toUpperCase()}</kbd>
      <span>{label}</span>
    </span>
  );
}

/** Nav shortcut reference — G then key for Dashboard, Workspace, Finish → Export, Archives. */
export function ProDashboardNavShortcuts({ className = "" }: Props) {
  return (
    <p
      className={`max-w-3xl text-sm leading-relaxed text-pro-text-secondary/75 ${className}`}
    >
      <span className="text-pro-text-secondary/80">Shortcuts: </span>
      {PRO_NAV_SEQUENCE_SHORTCUTS.map((item, i) => (
        <span key={item.id}>
          {i > 0 ? (
            <span className="mx-1.5 text-pro-text-secondary/40" aria-hidden>
              ·
            </span>
          ) : null}
          <SequenceHint secondKey={item.secondKey} label={item.label} />
        </span>
      ))}
    </p>
  );
}
