import type { ChecklistItem } from "@/lib/pro/types";

export type DeliverablePreset = {
  id: string;
  label: string;
  format: string;
  notes: string;
};

export const DELIVERABLE_PRESETS: DeliverablePreset[] = [
  {
    id: "master-prores",
    label: "Master — ProRes 422 HQ",
    format: "ProRes 422 HQ · 1080p or 4K",
    notes: "Archive master with full color range. Keep separate from screening copies.",
  },
  {
    id: "screening-h264",
    label: "Screening — H.264",
    format: "H.264 · high bitrate · 1080p",
    notes: "Festival submissions and private links. Burn timecode optional for notes.",
  },
  {
    id: "captions",
    label: "Captions / subtitles",
    format: "SRT or burned-in per platform",
    notes: "Check festival and streaming caption requirements before final export.",
  },
  {
    id: "festival-dcp",
    label: "Festival DCP (when required)",
    format: "DCP · 2K flat or scope",
    notes: "Confirm aspect ratio and audio layout with the festival tech sheet.",
  },
  {
    id: "social-crops",
    label: "Social crops",
    format: "9:16 · 1:1 · 16:9 variants",
    notes: "Trailers and announcement clips — safe-title for each platform.",
  },
];

export const PLATFORM_CHECKLIST: ChecklistItem[] = [
  {
    id: "deliver-metadata",
    label: "Metadata and synopsis locked",
    hint: "Logline, synopsis, director statement, and stills match the final cut.",
    done: false,
  },
  {
    id: "deliver-codec",
    label: "Codec sheet reviewed",
    hint: "Each platform or festival has a deliverables PDF — check resolution, codec, and audio layout.",
    done: false,
  },
  {
    id: "deliver-safe",
    label: "Safe areas and captions verified",
    hint: "Watch on phone and TV; confirm subtitles do not clip and titles stay in safe margins.",
    done: false,
  },
  {
    id: "deliver-backup",
    label: "Master + project backup stored",
    hint: "Keep ProRes master, project files, and look references in two locations.",
    done: false,
  },
];
