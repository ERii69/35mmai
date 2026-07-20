import type { ProTemplateId } from "@/lib/pro/templates";

export const PRO_OPEN_PROJECT_SWITCHER_EVENT = "pro:open-project-switcher";
export const PRO_OPEN_WORKFLOW_SWITCHER_EVENT = "pro:open-workflow-switcher";
export const PRO_OPEN_NEW_PROJECT_EVENT = "pro:open-new-project";

export type ProOpenNewProjectDetail = {
  templateId?: ProTemplateId;
};

export function dispatchOpenNewProject(detail?: ProOpenNewProjectDetail) {
  window.dispatchEvent(
    new CustomEvent<ProOpenNewProjectDetail>(PRO_OPEN_NEW_PROJECT_EVENT, { detail })
  );
}
