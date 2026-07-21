"use client";

import { getToolByRank } from "@/app/data";
import {
  getCatalogToolReferencePath,
  getToolOutboundUrl,
} from "@/lib/pro/catalog-tool-link";
import {
  examplePromptForRank,
  type StructuredPlaybook,
  type WorkspaceTabId,
} from "@/lib/pro/playbook-steps";

const TAB_LABELS: Record<WorkspaceTabId, string> = {
  director: "Director's Prep",
  world: "World bible",
  visual: "Visuals",
  shots: "Shots",
  prompts: "Prompts",
  kit: "Kit",
  workflow: "Phases",
  budget: "Budget",
  export: "Export",
  post: "Post",
};

type Props = {
  playbook: StructuredPlaybook;
  onGoToTab?: (tab: WorkspaceTabId, stepId?: string) => void;
};

export function PlaybookSteps({ playbook, onGoToTab }: Props) {
  return (
    <div className="mt-3 space-y-4 rounded-lg border border-white/[0.06] bg-pro-surface p-3">
      <p className="text-xs font-medium text-[#d1d5db]">{playbook.name}</p>
      <p className="mt-1 text-xs leading-relaxed text-pro-text-secondary">{playbook.intro.lead}</p>
      <ol className="space-y-4">
        {playbook.steps.map((step, index) => (
          <li key={step.id} className="border-b border-[#222] pb-4 last:border-0 last:pb-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-medium text-white">
                {index + 1}. {step.title}
              </h3>
              {onGoToTab ? (
                <button
                  type="button"
                  onClick={() => onGoToTab(step.workspaceTab, step.id)}
                  className="text-xs text-pro-primary underline-offset-2 hover:underline"
                >
                  Open {TAB_LABELS[step.workspaceTab]} tab →
                </button>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-pro-text-secondary">{step.body}</p>
            {step.tools.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {step.tools.map((ref) => {
                  const tool = getToolByRank(ref.rank);
                  if (!tool) return null;
                  const href = getToolOutboundUrl(tool);
                  const example = examplePromptForRank(ref.rank);
                  return (
                    <li
                      key={`${step.id}-${ref.rank}`}
                      className="rounded-lg border border-white/[0.06] bg-pro-elevated px-2 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[10px] font-medium uppercase text-[#525252]">
                          #{ref.rank}
                        </span>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-pro-primary underline-offset-2 hover:underline"
                        >
                          {tool.name}
                        </a>
                        <a
                          href={getCatalogToolReferencePath(ref.rank)}
                          className="text-[10px] text-pro-text-secondary underline-offset-2 hover:text-pro-text-secondary hover:underline"
                        >
                          In catalog
                        </a>
                      </div>
                      <p className="mt-1 text-xs text-pro-text-secondary">{ref.why}</p>
                      {example ? (
                        <p className="mt-1 text-[11px] italic text-[#525252]">
                          Example: {example}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="text-xs text-[#525252]">{playbook.intro.footer}</p>
    </div>
  );
}
