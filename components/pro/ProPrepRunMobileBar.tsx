"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { proBtn } from "@/components/pro/ux/pro-surfaces";

type Props = {
  visible: boolean;
  running: boolean;
  disabled: boolean;
  agentsEnabled: boolean;
  localPrepBlocked: boolean;
  onRun: () => void;
};

/** Full-width Run prep dock on mobile — same chrome pattern as shots actions. Hidden md+. */
export function ProPrepRunMobileBar({
  visible,
  running,
  disabled,
  agentsEnabled,
  localPrepBlocked,
  onRun,
}: Props) {
  if (!visible) return null;

  const label = running
    ? "Running prep…"
    : localPrepBlocked
      ? "Add scene lines first"
      : agentsEnabled
        ? "Run AI prep"
        : "Run quick prep";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-pro-base/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="px-4 py-2.5">
        <Button
          type="button"
          size="lg"
          className={`${proBtn.primary} h-12 w-full text-base font-semibold shadow-lg shadow-pro-primary/20`}
          disabled={disabled || running}
          onClick={onRun}
        >
          {running ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              {label}
            </>
          ) : (
            label
          )}
        </Button>
      </div>
    </div>
  );
}
