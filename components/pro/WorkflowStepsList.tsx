"use client";

import { ExternalLink, Lightbulb } from "lucide-react";
import { getToolByRank } from "@/app/data";
import {
  getCatalogToolReferencePath,
  getToolOutboundUrl,
} from "@/lib/pro/catalog-tool-link";

type WorkflowStep = {
  step: string;
  description: string;
  proTip?: string;
  tools: number[];
};

type Props = {
  steps: WorkflowStep[];
  onGoToKitTab?: () => void;
};

export function WorkflowStepsList({ steps, onGoToKitTab }: Props) {
  return (
    <ul className="space-y-4">
      {steps.map((step) => (
        <li
          key={step.step}
          className="rounded-xl bg-pro-muted/60 px-4 py-4 ring-1 ring-white/[0.06]"
        >
          <p className="text-sm font-semibold text-pro-text">{step.step}</p>
          <p className="mt-1 text-sm leading-relaxed text-pro-text-secondary">
            {step.description}
          </p>
          {step.proTip ? (
            <div className="mt-3 flex gap-2 rounded-lg bg-pro-warning/10 px-3 py-2.5 ring-1 ring-pro-warning/20">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-pro-warning" aria-hidden />
              <p className="text-xs leading-relaxed text-pro-text">
                <span className="font-semibold text-pro-warning">Tip: </span>
                {step.proTip}
              </p>
            </div>
          ) : null}
          {step.tools.length > 0 ? (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-pro-text-secondary">
                Recommended tools
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {step.tools.map((rank) => {
                  const tool = getToolByRank(rank);
                  if (!tool) return null;
                  return (
                    <li key={rank}>
                      <a
                        href={getToolOutboundUrl(tool)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-pro-elevated px-2.5 py-1 text-xs text-pro-primary ring-1 ring-pro-primary/25 hover:bg-pro-primary/10"
                      >
                        {tool.name}
                        <ExternalLink className="size-3 opacity-70" aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ul>
              {onGoToKitTab ? (
                <button
                  type="button"
                  onClick={onGoToKitTab}
                  className="mt-2 text-xs text-pro-text-secondary underline-offset-2 hover:text-pro-primary hover:underline"
                >
                  Open Kit tab to add these →
                </button>
              ) : (
                <p className="mt-2 text-[10px] text-pro-text-secondary">
                  Catalog refs:{" "}
                  {step.tools.map((r) => (
                    <a
                      key={r}
                      href={getCatalogToolReferencePath(r)}
                      className="text-pro-primary hover:underline"
                    >
                      #{r}
                    </a>
                  ))}
                </p>
              )}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
