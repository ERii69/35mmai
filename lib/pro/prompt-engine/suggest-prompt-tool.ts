import type { ShotType } from "@/lib/pro/types";
import type { Phase4PromptToolRank, ToolSuggestion } from "@/lib/pro/prompt-engine/types";

const MJ = 6 as const;
const NANO = 18 as const;
const KLING = 5 as const;
const LTX = 4 as const;
const HIGGS = 21 as const;

function isDetailBeat(shotType: ShotType, label: string): boolean {
  const t = `${shotType} ${label}`.toLowerCase();
  return (
    shotType === "close_up" ||
    shotType === "extreme_close_up" ||
    /close|detail|insert|hands|object|texture|prop|tactile/i.test(t)
  );
}

function isMotionBeat(shotType: ShotType, label: string): boolean {
  const t = `${shotType} ${label}`.toLowerCase();
  return (
    shotType === "dolly" ||
    shotType === "pan" ||
    shotType === "tilt" ||
    shotType === "handheld" ||
    /dolly|track|push|pan|tilt|handheld|motion|approach|walk|run|move/i.test(t)
  );
}

/** Deterministic tool pick per visual beat — no AI. */
export function suggestToolForBeat(
  shotType: ShotType,
  label = "",
  opts?: { diversify?: boolean }
): ToolSuggestion {
  const diversify = opts?.diversify === true;

  if (shotType === "aerial") {
    return {
      rank: KLING,
      reason: "Aerial · motion",
      altRank: HIGGS,
      altReason: "Grade / camera profile",
    };
  }

  if (isMotionBeat(shotType, label)) {
    return {
      rank: KLING,
      reason: "Motion beat · video",
      altRank: LTX,
      altReason: "Scene video block",
    };
  }

  if (isDetailBeat(shotType, label)) {
    if (diversify) {
      return {
        rank: NANO,
        reason: "Composite insert",
        altRank: MJ,
        altReason: "Detail still",
      };
    }
    return {
      rank: MJ,
      reason: "Detail still",
      altRank: NANO,
      altReason: "Composite insert",
    };
  }

  if (shotType === "medium") {
    if (diversify) {
      return {
        rank: LTX,
        reason: "Scene video block",
        altRank: MJ,
        altReason: "Exploration still",
      };
    }
    return {
      rank: MJ,
      reason: "Exploration still",
      altRank: LTX,
      altReason: "Scene video block",
    };
  }

  if (shotType === "wide") {
    if (diversify) {
      return {
        rank: HIGGS,
        reason: "Cinema grade wide",
        altRank: MJ,
        altReason: "Exploration still",
      };
    }
    return { rank: MJ, reason: "Exploration still", altRank: HIGGS, altReason: "Cinema grade" };
  }

  if (shotType === "establishing") {
    return {
      rank: MJ,
      reason: "Exploration still",
      altRank: HIGGS,
      altReason: "Cinema grade",
    };
  }

  return { rank: MJ, reason: "Default still" };
}

export function phase4ToolLabel(rank: Phase4PromptToolRank): string {
  const map: Record<Phase4PromptToolRank, string> = {
    6: "Midjourney",
    18: "Nano Banana 2",
    5: "Kling",
    4: "LTX Studio",
    21: "Higgsfield Cinema Studio",
  };
  return map[rank];
}
