"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, X } from "lucide-react";
export type ProToastOptions = {
  message: string;
  variant?: "success" | "error" | "info";
  durationMs?: number;
};

type ProToastContextValue = {
  showToast: (options: ProToastOptions) => void;
};

const ProToastContext = createContext<ProToastContextValue | null>(null);

export function useProToast(): ProToastContextValue {
  const ctx = useContext(ProToastContext);
  if (!ctx) {
    throw new Error("useProToast must be used within ProToastProvider");
  }
  return ctx;
}

/** Optional hook — returns null outside provider (for shared components). */
export function useProToastOptional(): ProToastContextValue | null {
  return useContext(ProToastContext);
}

type ActiveToast = ProToastOptions & { id: number };

export function ProToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null);

  const showToast = useCallback((options: ProToastOptions) => {
    const id = Date.now();
    setToast({ ...options, id });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const ms = toast.durationMs ?? (toast.variant === "error" ? 6000 : 4500);
    const t = window.setTimeout(() => setToast(null), ms);
    return () => window.clearTimeout(t);
  }, [toast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ProToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          className="pointer-events-none fixed bottom-6 left-1/2 z-[100] w-[min(100%,24rem)] -translate-x-1/2 px-4 sm:left-auto sm:right-6 sm:translate-x-0"
          role="status"
          aria-live="polite"
        >
          <div
            className={`pointer-events-auto flex items-start gap-2 rounded-2xl px-4 py-3.5 shadow-2xl ring-1 backdrop-blur-md ${
              toast.variant === "error"
                ? "bg-pro-warning/90 text-pro-warning ring-pro-warning/30"
                : toast.variant === "info"
                  ? "bg-pro-elevated/95 text-pro-text ring-white/10"
                  : "bg-pro-elevated/95 text-pro-text ring-pro-success/30"
            }`}
          >
            {toast.variant !== "error" ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-pro-success" aria-hidden />
            ) : null}
            <p className="min-w-0 flex-1 text-sm leading-snug">{toast.message}</p>
            <button
              type="button"
              className="shrink-0 text-pro-text-secondary hover:text-pro-text"
              onClick={() => setToast(null)}
              aria-label="Dismiss"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </ProToastContext.Provider>
  );
}
