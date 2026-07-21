import type { ReactNode } from "react";
import { proWebShell } from "@/components/pro/ux/pro-surfaces";

type Props = {
  children: ReactNode;
};

/** Outer Pro web shell — cinematic background on md+ surfaces. */
export function ProWebShell({ children }: Props) {
  return (
    <div className={proWebShell.root}>
      <div className={proWebShell.inner}>{children}</div>
    </div>
  );
}
