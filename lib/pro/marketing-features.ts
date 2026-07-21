import type { LucideIcon } from "lucide-react";
import { Cloud, FolderDown, Palette, Sparkles } from "lucide-react";

export type ProMarketingFeature = {
  icon: LucideIcon;
  title: string;
  body: string;
};

export const PRO_MARKETING_FEATURES: ProMarketingFeature[] = [
  {
    icon: Sparkles,
    title: "Script to prompt",
    body:
      "Paste your screenplay, approve scenes, lock your look. Export copy-ready prompts for Midjourney, Kling, LTX, Nano, Higgsfield, and tools in your kit — one visual beat, one prompt.",
  },
  {
    icon: Palette,
    title: "Look bible",
    body:
      "Palette, mood refs, and negative prompts feed every generation line. Consistency without prompt engineering from scratch.",
  },
  {
    icon: Cloud,
    title: "Cloud projects",
    body:
      "Screenplay, look, and prompt packs saved to your account. Multiple projects, private to you, resume on any device.",
  },
  {
    icon: FolderDown,
    title: "Prompt pack export",
    body:
      "Download Markdown or CSV with tool name, catalog link, prompt, and negative per beat — ready to paste into Midjourney, Kling, LTX, and more.",
  },
];

export type ProMarketingFeatureGroup = {
  id: string;
  label: string;
  features: ProMarketingFeature[];
};

/** Mobile About: grouped checklist (Script → Look → Finish). */
export const PRO_MARKETING_FEATURE_GROUPS: ProMarketingFeatureGroup[] = [
  {
    id: "prep",
    label: "Script & look",
    features: PRO_MARKETING_FEATURES.slice(0, 2),
  },
  {
    id: "export",
    label: "Save & export",
    features: PRO_MARKETING_FEATURES.slice(2),
  },
];

/** Features in groups after the first two, used for mobile “show more”. */
export function proMarketingHiddenFeatureCount(): number {
  return PRO_MARKETING_FEATURE_GROUPS.slice(1).reduce((n, g) => n + g.features.length, 0);
}
