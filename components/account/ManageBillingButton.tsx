"use client";

import { useState, useTransition } from "react";
import { getCustomerPortalUrl } from "@/app/actions/stripe";
import { Button } from "@/components/ui/button";
import { proBtn } from "@/components/pro/ux/pro-surfaces";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function ManageBillingButton({
  className = proBtn.outline,
  children = "Manage billing",
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function openPortal() {
    setError(null);
    startTransition(async () => {
      const result = await getCustomerPortalUrl();
      if ("url" in result) {
        window.open(result.url, "_blank", "noopener,noreferrer");
        return;
      }
      if (result.error === "unauthenticated") {
        window.location.href = "/login?next=/account";
        return;
      }
      setError("Could not open billing portal. Try again from Account.");
    });
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className={className}
        disabled={pending}
        onClick={openPortal}
      >
        {pending ? "Opening…" : children}
      </Button>
      {error ? <p className="mt-2 text-xs text-pro-warning">{error}</p> : null}
    </div>
  );
}
