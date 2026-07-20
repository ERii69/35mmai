"use client";

type Props = {
  active: boolean;
  label?: string;
};

/** Indeterminate progress strip for async agent / API work. */
export function ProLoadingBar({ active, label }: Props) {
  if (!active) return null;
  return (
    <div className="space-y-1.5" aria-busy="true" aria-live="polite">
      {label ? <p className="text-xs text-[#737373]">{label}</p> : null}
      <div className="h-1 overflow-hidden rounded-full bg-[#222]">
        <div
          className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-pro-primary to-transparent motion-safe:animate-[pro-shimmer_1.2s_ease-in-out_infinite]"
        />
      </div>
    </div>
  );
}
