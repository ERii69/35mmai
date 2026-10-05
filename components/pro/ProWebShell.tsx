import type { ReactNode } from "react";
import { proWebShell } from "@/components/pro/ux/pro-surfaces";

type Props = {
  children: ReactNode;
  /** Landing pages should end where the content ends, not stretch to the viewport. */
  compact?: boolean;
};

/** Outer Pro web shell — cinematic background on md+ surfaces. */
export function ProWebShell({ children, compact = false }: Props) {
  return (
    <div className={compact ? "pro-cinematic-bg relative font-sans text-pro-text" : proWebShell.root}>
      <div className={compact ? "relative z-10" : proWebShell.inner}>{children}</div>
    </div>
  );
}
