"use client";

import { Check, Info, X } from "lucide-react";

type Props = {
  title: string;
  detail: string;
  variant?: "success" | "info";
  onDismiss: () => void;
};

export function ShotPlanActionBanner({
  title,
  detail,
  variant = "success",
  onDismiss,
}: Props) {
  const isSuccess = variant === "success";
  return (
    <div
      className={`flex gap-3 rounded-xl px-4 py-3 ring-1 ${
        isSuccess
          ? "bg-emerald-950/30 ring-emerald-500/25"
          : "bg-pro-muted/50 ring-white/[0.08]"
      }`}
      role="status"
    >
      {isSuccess ? (
        <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden />
      ) : (
        <Info className="mt-0.5 size-4 shrink-0 text-pro-primary" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${isSuccess ? "text-emerald-100" : "text-pro-text"}`}>
          {title}
        </p>
        <p className={`mt-0.5 text-xs leading-relaxed ${isSuccess ? "text-emerald-100/85" : "text-pro-text-secondary"}`}>
          {detail}
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 rounded p-1 text-pro-text-secondary hover:bg-white/5 hover:text-pro-text"
        aria-label="Dismiss"
        onClick={onDismiss}
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
