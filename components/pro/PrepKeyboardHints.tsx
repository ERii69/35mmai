"use client";

import { ShortcutKbd } from "@/components/pro/ux/KeyboardShortcutTooltip";
import { proSurface } from "@/components/pro/ux/pro-surfaces";

type Props = {
  agentsEnabled: boolean;
  className?: string;
};

/** Visible shortcut reference for Prep & Production. */
export function PrepKeyboardHints({ agentsEnabled, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl bg-pro-muted/60 px-3 py-2.5 text-[10px] text-pro-text-secondary ring-1 ring-white/[0.06] ${className}`}
    >
      <span className="font-medium text-pro-text">Shortcuts: </span>
      <ShortcutKbd shortcutId="run_prep" /> Run prep ·{" "}
      <ShortcutKbd shortcutId="cancel_prep" /> Cancel prep
      {agentsEnabled ? (
        <>
          {" "}
          · <ShortcutKbd shortcutId="generate_shot_plan" /> Shot plan
        </>
      ) : (
        <> · Quick prep also available on Finish → Beats</>
      )}
    </div>
  );
}
