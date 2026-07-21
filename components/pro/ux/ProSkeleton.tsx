"use client";

type Props = {
  className?: string;
};

export function ProSkeleton({ className = "" }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-pro-elevated/80 ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 -translate-x-full animate-[pro-shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}

export function AgentRunSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading agents">
      <ProSkeleton className="h-2 w-full" />
      <div className="flex justify-between gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ProSkeleton key={i} className="size-10 rounded-full" />
        ))}
      </div>
      <ProSkeleton className="h-24 w-full" />
    </div>
  );
}
