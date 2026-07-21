import type { ProTemplateId } from "@/lib/pro/templates";
import {
  DEFAULT_DIRECTOR_PREP_TEMPLATE_ID,
  listProTemplateGroups,
  proTemplateDisplayName,
} from "@/lib/pro/templates";
import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";

/** Primary templates shown in the Change template dialog (max 3). */
export const PRIMARY_WORKFLOW_IDS = [
  "director-prep-script-to-prompt",
  "classical-ai-short",
  "director-prep-blank",
] as const satisfies readonly ProTemplateId[];

export type PrimaryWorkflowId = (typeof PRIMARY_WORKFLOW_IDS)[number];

export const PRIMARY_WORKFLOW_CHOICES: {
  id: PrimaryWorkflowId;
  label: string;
  description: string;
  badge?: string;
}[] = [
  {
    id: "director-prep-script-to-prompt",
    label: "Script to prompt",
    description: "Paste script → lock look → copy-ready prompts for Midjourney, Kling, LTX, and more.",
    badge: "Default",
  },
  {
    id: "classical-ai-short",
    label: "Classical AI short",
    description: "Location-pass method with a 14-step playbook — classical short prep alongside Script to prompt.",
    badge: "Advanced",
  },
  {
    id: "director-prep-blank",
    label: "Blank",
    description: "Empty script workspace — choose your own path later.",
  },
];

/** Legacy prep templates — advanced drawer only, not day-one UI. */
export const ADVANCED_PREP_TEMPLATE_IDS: ProTemplateId[] = [
  "director-prep-narrative-short",
  "director-prep-documentary",
  "director-prep-commercial",
  "director-prep-music-video",
  "director-prep-feature",
  "patchwright-classical-short",
  "visual-look-bible",
  "visual-contact-sheet",
  "indie-narrative-short",
  "documentary-interview",
];

export function isPrimaryWorkflowId(id: string): id is PrimaryWorkflowId {
  return (PRIMARY_WORKFLOW_IDS as readonly string[]).includes(id);
}

export function workflowDisplayName(templateId: string | null | undefined): string {
  if (!templateId) return PRIMARY_WORKFLOW_CHOICES[0]!.label;
  if (isPrimaryWorkflowId(templateId)) {
    return PRIMARY_WORKFLOW_CHOICES.find((c) => c.id === templateId)?.label ?? "Script to prompt";
  }
  return proTemplateDisplayName(templateId) ?? "Custom template";
}

export function effectiveWorkflowTemplateId(appliedId: string | null | undefined): ProTemplateId {
  if (appliedId && isPrimaryWorkflowId(appliedId)) return appliedId;
  if (appliedId) return appliedId as ProTemplateId;
  return DEFAULT_DIRECTOR_PREP_TEMPLATE_ID;
}

export function usesClassicalLocationPass(templateId: string | null | undefined): boolean {
  return templateId === "classical-ai-short" || templateId === "patchwright-classical-short";
}

export function isScriptToPromptWorkflow(templateId: string | null | undefined): boolean {
  return isScriptToPromptTemplate(templateId ?? DEFAULT_DIRECTOR_PREP_TEMPLATE_ID);
}

export type WorkflowChoice = {
  id: ProTemplateId;
  label: string;
  description: string;
  badge?: string;
};

/** Director's prep templates beyond the three primary day-one templates. */
export function moreScriptWorkflowChoices(): WorkflowChoice[] {
  const primary = new Set<string>(PRIMARY_WORKFLOW_IDS);
  const group = listProTemplateGroups().find((g) => g.id === "director-prep");
  return (group?.templates ?? [])
    .filter((t) => !primary.has(t.id))
    .map((t) => ({
      id: t.id as ProTemplateId,
      label: t.name,
      description: t.description ?? "",
    }));
}
