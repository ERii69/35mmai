import type { ShotType } from "@/lib/pro/types";

export type ShotTypeStyle = {
  accent: string;
  badge: string;
  thumb: string;
  label: string;
};

export const SHOT_TYPE_STYLES: Record<ShotType, ShotTypeStyle> = {
  establishing: {
    accent: "border-l-sky-400",
    badge: "bg-sky-500/15 text-sky-200",
    thumb: "from-sky-950/80 to-[#0a0a0a]",
    label: "EST",
  },
  wide: {
    accent: "border-l-blue-400",
    badge: "bg-blue-500/15 text-blue-200",
    thumb: "from-blue-950/80 to-[#0a0a0a]",
    label: "WIDE",
  },
  medium: {
    accent: "border-l-violet-400",
    badge: "bg-violet-500/15 text-violet-200",
    thumb: "from-violet-950/80 to-[#0a0a0a]",
    label: "MED",
  },
  close_up: {
    accent: "border-l-amber-400",
    badge: "bg-amber-500/15 text-amber-200",
    thumb: "from-amber-950/80 to-[#0a0a0a]",
    label: "CU",
  },
  extreme_close_up: {
    accent: "border-l-orange-400",
    badge: "bg-orange-500/15 text-orange-200",
    thumb: "from-orange-950/80 to-[#0a0a0a]",
    label: "ECU",
  },
  dolly: {
    accent: "border-l-teal-400",
    badge: "bg-teal-500/15 text-teal-200",
    thumb: "from-teal-950/80 to-[#0a0a0a]",
    label: "DOLLY",
  },
  pan: {
    accent: "border-l-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-200",
    thumb: "from-cyan-950/80 to-[#0a0a0a]",
    label: "PAN",
  },
  tilt: {
    accent: "border-l-indigo-400",
    badge: "bg-indigo-500/15 text-indigo-200",
    thumb: "from-indigo-950/80 to-[#0a0a0a]",
    label: "TILT",
  },
  handheld: {
    accent: "border-l-rose-400",
    badge: "bg-rose-500/15 text-rose-200",
    thumb: "from-rose-950/80 to-[#0a0a0a]",
    label: "HH",
  },
  aerial: {
    accent: "border-l-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-200",
    thumb: "from-emerald-950/80 to-[#0a0a0a]",
    label: "AERIAL",
  },
  other: {
    accent: "border-l-zinc-500",
    badge: "bg-zinc-500/15 text-zinc-300",
    thumb: "from-zinc-900/80 to-[#0a0a0a]",
    label: "SHOT",
  },
};

export function shotTypeStyle(type: ShotType): ShotTypeStyle {
  return SHOT_TYPE_STYLES[type] ?? SHOT_TYPE_STYLES.other;
}
