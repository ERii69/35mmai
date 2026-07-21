"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type ProSelectOption = {
  value: string;
  label: string;
};

type Props = {
  "aria-label": string;
  value: string;
  options: ProSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

/** Dark-themed custom select — matches Pro workspace surfaces (no native OS menu). */
export function ProSelect({
  "aria-label": ariaLabel,
  value,
  options,
  onChange,
  placeholder = "Choose…",
  disabled,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className="flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-white/10 bg-pro-muted/80 px-3.5 py-2.5 text-left text-sm text-pro-text outline-none transition hover:border-white/20 hover:bg-pro-elevated focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-50"
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span className={`truncate ${selected ? "text-pro-text" : "text-pro-text-secondary"}`}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-pro-text-secondary transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 z-40 mt-1 max-h-64 min-w-full w-max overflow-y-auto rounded-xl border border-white/10 bg-[#141414] py-1 shadow-2xl ring-1 ring-white/[0.08]"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value || "__empty"} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-white/[0.08] text-pro-text"
                      : "text-pro-text-secondary hover:bg-white/[0.04] hover:text-pro-text"
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {active ? (
                    <Check className="size-3.5 shrink-0 text-pro-text-secondary" aria-hidden />
                  ) : (
                    <span className="size-3.5 shrink-0" />
                  )}
                  <span className="whitespace-nowrap">{opt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
