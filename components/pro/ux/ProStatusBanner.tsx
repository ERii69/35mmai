"use client";

import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ProStatusVariant = "success" | "error" | "info" | "loading";

type Props = {
  variant: ProStatusVariant;
  message: string;
  onDismiss?: () => void;
  className?: string;
};

const styles: Record<ProStatusVariant, string> = {
  success: "border-emerald-500/35 bg-emerald-950/35 text-emerald-100",
  error: "border-pro-warning/35 bg-pro-warning/10 text-pro-warning",
  info: "border-white/[0.1] bg-pro-elevated text-pro-text",
  loading: "border-pro-primary/30 bg-pro-primary/10 text-pro-text",
};

export function ProStatusBanner({ variant, message, onDismiss, className = "" }: Props) {
  const Icon =
    variant === "success"
      ? CheckCircle2
      : variant === "error"
        ? AlertTriangle
        : Info;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${styles[variant]} ${className}`}
    >
      <Icon
        className={`mt-0.5 size-4 shrink-0 ${
          variant === "success"
            ? "text-emerald-400"
            : variant === "error"
              ? "text-pro-warning"
              : variant === "loading"
                ? "text-pro-primary animate-pulse"
                : "text-pro-text-secondary"
        }`}
        aria-hidden
      />
      <p className="min-w-0 flex-1 leading-snug">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-pro-text-secondary hover:text-white"
          aria-label="Dismiss"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
