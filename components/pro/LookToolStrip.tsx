"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Package, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import { getToolOutboundUrl } from "@/lib/pro/catalog-tool-link";
import { addToolToKit, isToolInKit, kitEntriesFromState } from "@/lib/pro/kit-display";
import { getLookToolSuggestions } from "@/lib/pro/recommended-look-tools";
import { shouldShowLookToolStrip } from "@/lib/pro/look-tool-sections";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  onGoToKit?: () => void;
};

export function LookToolStrip({ state, updateState, onGoToKit }: Props) {
  const { showToast } = useProToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const suggestions = useMemo(() => getLookToolSuggestions(state), [state]);
  const kitCount = kitEntriesFromState(state.kit).length;
  const visible = shouldShowLookToolStrip(state) && suggestions.length > 0;
  const kitNavLabel = "Finish → Kit";

  if (!visible) return null;

  async function copyPrompt(key: string, prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedKey(key);
      showToast({ message: "Prompt copied — paste into the external tool.", variant: "success" });
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast({ message: "Could not copy — select and copy manually.", variant: "error" });
    }
  }

  function addToKit(rank: number, name: string) {
    if (isToolInKit(state.kit, rank)) {
      onGoToKit?.();
      return;
    }
    updateState((p) => ({ ...p, kit: addToolToKit(p.kit, rank) }));
    showToast({
      message: `Added ${name} — open ${kitNavLabel} to see your full list.`,
      variant: "success",
    });
  }

  return (
    <section className={proSurface.sectionMuted} aria-labelledby="look-tool-strip-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id="look-tool-strip-heading"
            className="flex items-center gap-2 text-sm font-semibold text-pro-text"
          >
            <Sparkles className="size-4 text-pro-warning" aria-hidden />
            Take this look into external tools
          </h3>
          <p className="mt-1 text-xs text-pro-text-secondary">
            Copy a prompt, open the tool, or save it to your project kit (
            {kitCount > 0 ? `${kitCount} tool${kitCount === 1 ? "" : "s"} saved` : "empty"}).
          </p>
        </div>
        {onGoToKit ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0 border-white/10 text-pro-text"
            onClick={onGoToKit}
          >
            <Package className="mr-1.5 size-3.5" aria-hidden />
            Open kit
          </Button>
        ) : null}
      </div>

      <ul className="mt-4 space-y-3">
        {suggestions.map(({ section, sectionLabel, hint, tool, prompt }) => {
          const key = `${section}-${tool.rank}`;
          const inKit = isToolInKit(state.kit, tool.rank);
          const outbound = getToolOutboundUrl(tool);

          return (
            <li
              key={key}
              className="rounded-xl bg-pro-elevated/80 ring-1 ring-white/[0.06] overflow-hidden"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/[0.04] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-pro-primary">
                    {sectionLabel}
                  </p>
                  <p className="text-sm font-medium text-pro-text">
                    #{tool.rank} {tool.name}
                  </p>
                  <p className="text-[11px] text-pro-text-secondary">{hint}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/10 bg-pro-muted/40 text-pro-text"
                    onClick={() => void copyPrompt(key, prompt)}
                  >
                    {copiedKey === key ? (
                      <>
                        <Check className="mr-1 size-3.5 text-pro-success" aria-hidden />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 size-3.5" aria-hidden />
                        Copy prompt
                      </>
                    )}
                  </Button>
                  <a
                    href={outbound}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-pro-muted/40 px-3 text-sm font-medium text-pro-text hover:bg-pro-muted/60"
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                    Open
                  </a>
                  {inKit && onGoToKit ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-pro-text-secondary"
                      onClick={onGoToKit}
                    >
                      <Package className="mr-1 size-3.5" aria-hidden />
                      In kit
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-pro-text-secondary"
                      disabled={inKit}
                      onClick={() => addToKit(tool.rank, tool.name)}
                    >
                      {inKit ? (
                        "In kit"
                      ) : (
                        <>
                          <Plus className="mr-1 size-3.5" aria-hidden />
                          Add to kit
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-words px-3 py-2 font-mono text-[11px] leading-relaxed text-pro-text-secondary">
                {prompt}
              </pre>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[11px] text-pro-text-secondary">
        Kit is per project — open <strong className="font-medium text-pro-text">{kitNavLabel}</strong>{" "}
        to browse the full catalog, see monthly cost, and manage tools. 35mmPro does not run
        generation; these apps live outside your project.
      </p>
    </section>
  );
}
