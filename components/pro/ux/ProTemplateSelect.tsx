"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type ProTemplateSelectOption = {
  value: string;
  label: string;
  group?: string;
};

type Props = {
  "aria-label": string;
  value: string;
  options: ProTemplateSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

export function ProTemplateSelect({
  "aria-label": ariaLabel,
  value,
  options,
  onChange,
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

  const groups = [...new Set(options.map((o) => o.group).filter(Boolean))] as string[];

  function renderOptions() {
    if (groups.length === 0) {
      return options.map((opt) => (
        <OptionRow
          key={opt.value}
          opt={opt}
          active={opt.value === value}
          onPick={() => {
            onChange(opt.value);
            setOpen(false);
          }}
        />
      ));
    }
    return groups.map((group) => (
      <li key={group} role="presentation">
        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
          {group}
        </p>
        <ul>
          {options
            .filter((o) => o.group === group)
            .map((opt) => (
              <OptionRow
                key={opt.value}
                opt={opt}
                active={opt.value === value}
                onPick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              />
            ))}
        </ul>
      </li>
    ));
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-white/10 bg-pro-muted/60 px-3 py-2 text-left text-sm text-pro-text outline-none transition hover:border-white/20 hover:bg-pro-elevated focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-50"
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span className="whitespace-nowrap" title={selected?.label}>
          {selected?.label ?? "Choose template"}
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
          className="absolute left-0 z-30 mt-1 max-h-64 min-w-full w-max overflow-y-auto rounded-xl border border-white/[0.08] bg-pro-elevated py-1 shadow-2xl ring-1 ring-white/[0.08]"
        >
          {renderOptions()}
        </ul>
      ) : null}
    </div>
  );
}

function OptionRow({
  opt,
  active,
  onPick,
}: {
  opt: ProTemplateSelectOption;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
          active ? "bg-white/[0.08] text-pro-text" : "text-pro-text-secondary hover:bg-white/[0.04] hover:text-pro-text"
        }`}
        onClick={onPick}
      >
        {active ? <Check className="size-3.5 shrink-0 text-pro-text-secondary" aria-hidden /> : <span className="size-3.5 shrink-0" />}
        <span className="whitespace-nowrap">{opt.label}</span>
      </button>
    </li>
  );
}
