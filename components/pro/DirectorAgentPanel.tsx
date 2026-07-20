"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { commitAgentStaging } from "@/lib/pro/commit-agent-staging";
import { buildPreProductionReportMd } from "@/lib/pro/preproduction-report-md";
import type {
  AgentProgressStep,
  AgentStagingBundle,
  AgentSuggestionStatus,
  ProjectStatePayload,
} from "@/lib/pro/types";
import { ScriptToPrepAgentPanel } from "@/components/pro/ScriptToPrepAgentPanel";
import { ProExportDownloadButton } from "@/components/pro/ProExportDownloadButton";

const STEP_LABELS: Record<AgentProgressStep, string> = {
  script_analyzer: "Analyzing scenes…",
  research: "Researching locations…",
  shot_list: "Generating shot lists…",
  budget: "Estimating budget…",
  visual_bible: "Building visual bible…",
  complete: "Ready for review",
  error: "Error",
};

type Props = {
  projectId: string;
  projectName: string;
  state: ProjectStatePayload;
  claudeAgentsEnabled: boolean;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
};

function ConfidenceBadge({ value }: { value: number }) {
  return (
    <span className="rounded-full bg-pro-muted px-2 py-0.5 text-[10px] text-pro-text-secondary">
      {value}% match
    </span>
  );
}

function ApprovalButtons({
  status,
  onSet,
}: {
  status: AgentSuggestionStatus;
  onSet: (s: AgentSuggestionStatus) => void;
}) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        aria-label="Approve"
        onClick={() => onSet(status === "approved" ? "pending" : "approved")}
        className={`rounded p-1 ${status === "approved" ? "bg-emerald-950 text-emerald-300" : "text-pro-text-secondary hover:text-emerald-300"}`}
      >
        <Check className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Reject"
        onClick={() => onSet(status === "rejected" ? "pending" : "rejected")}
        className={`rounded p-1 ${status === "rejected" ? "bg-red-950 text-red-300" : "text-pro-text-secondary hover:text-red-300"}`}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function DirectorAgentPanel({
  projectId,
  projectName,
  state,
  claudeAgentsEnabled,
  updateState,
}: Props) {
  const dp = state.directorPrep;
  const manualRef = useRef<HTMLDetailsElement>(null);
  const [agentsEnabled, setAgentsEnabled] = useState(claudeAgentsEnabled);
  const [manualOpen, setManualOpen] = useState(!claudeAgentsEnabled);
  const [running, setRunning] = useState(false);
  const [progressStep, setProgressStep] = useState<AgentProgressStep | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refineHint, setRefineHint] = useState("");
  const [staging, setStaging] = useState<AgentStagingBundle | null>(dp.agentStaging);
  const [showPreview, setShowPreview] = useState(false);

  const hasScript = dp.screenplay.rawText.trim().length > 0;

  useEffect(() => {
    setAgentsEnabled(claudeAgentsEnabled);
    if (!claudeAgentsEnabled) setManualOpen(true);
  }, [claudeAgentsEnabled]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/pro/agent/status")
      .then((r) => r.json())
      .then((j: { configured?: boolean }) => {
        if (cancelled || typeof j.configured !== "boolean") return;
        setAgentsEnabled(j.configured);
        if (!j.configured) setManualOpen(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function openManualAgent() {
    setManualOpen(true);
    if (!hasScript) {
      setError("Paste your screenplay in the Script section below first.");
      document.getElementById("playbook-step-script")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setError(null);
    window.setTimeout(() => {
      manualRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  const previewMd = useMemo(() => {
    if (!staging || staging.status !== "review") return "";
    const mockState: ProjectStatePayload = {
      ...state,
      directorPrep: {
        ...state.directorPrep,
        agentMeta: {
          ...state.directorPrep.agentMeta,
          executiveSummary: staging.executiveSummary,
          budgetSummaryText: staging.budget?.summary ?? "",
          visualMood: staging.visual?.mood ?? "",
        },
        scenes: staging.scenes.filter((s) => s.status !== "rejected").map((s) => s.scene),
      },
      shotPlan: {
        sequences: staging.shotSequences
          .filter((s) => s.status !== "rejected")
          .map((s) => ({
            id: s.suggestionId,
            title: s.title,
            notes: s.notes,
            sceneNumber: s.sceneNumber,
            shots: [],
          })),
      },
      worldBible: {
        ...state.worldBible,
        locations: staging.locations.filter((l) => l.status !== "rejected").map((l) => l.name),
      },
    };
    return buildPreProductionReportMd(mockState, projectName, true);
  }, [staging, state, projectName]);

  async function runAgent(refine = false) {
    if (!hasScript) {
      setError("Paste your screenplay in the Script section below first.");
      return;
    }
    setRunning(true);
    setError(null);
    setProgressStep("script_analyzer");
    setProgressMessage("Starting Director's Agent…");

    try {
      const res = await fetch(`/api/pro/agent/${projectId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refineHint: refine ? refineHint.trim() : undefined,
          refine,
        }),
      });

      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Agent failed (${res.status})`);
      }

      if (!res.body) throw new Error("No response stream.");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += dec.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as {
            type: string;
            step?: AgentProgressStep;
            message?: string;
            staging?: AgentStagingBundle;
            memoryPatch?: Partial<ProjectStatePayload["directorPrep"]["agentMemory"]>;
          };
          if (event.type === "progress" && event.step) {
            setProgressStep(event.step);
            setProgressMessage(event.message ?? STEP_LABELS[event.step]);
          }
          if (event.type === "complete" && event.staging) {
            setStaging(event.staging);
            updateState((p) => ({
              ...p,
              directorPrep: {
                ...p.directorPrep,
                agentStaging: event.staging!,
                agentMemory: {
                  ...p.directorPrep.agentMemory,
                  ...(event.memoryPatch ?? {}),
                },
              },
            }));
          }
          if (event.type === "error") {
            throw new Error(event.message ?? "Agent error");
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Agent run failed.");
      setProgressStep("error");
    } finally {
      setRunning(false);
    }
  }

  function patchStaging(fn: (s: AgentStagingBundle) => AgentStagingBundle) {
    if (!staging) return;
    const next = fn(staging);
    setStaging(next);
    updateState((p) => ({
      ...p,
      directorPrep: { ...p.directorPrep, agentStaging: next },
    }));
  }

  function commitApproved() {
    if (!staging) return;
    const approvedCount = staging.scenes.filter((s) => s.status === "approved").length;
    if (approvedCount === 0) {
      setError("Approve at least one scene before commit.");
      return;
    }
    if (!confirm(`Commit ${approvedCount} approved scene(s) and other approved suggestions?`)) return;
    updateState((p) => {
      const next = commitAgentStaging(p, staging);
      setStaging(next.directorPrep.agentStaging);
      return next;
    });
    setError(null);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-pro-primary/35 bg-gradient-to-b from-pro-primary/10 to-pro-muted p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pro-primary/20 text-pro-primary">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-white">Director&apos;s Agent</h2>
            <p className="mt-1 text-sm text-pro-text-secondary">
              One click runs specialized sub-agents (script, research, shots, budget, visual) with
              project memory. Review and approve before anything is committed.
            </p>
          </div>
        </div>

        {!agentsEnabled ? (
          <div className="mt-3 space-y-2 rounded-lg border border-pro-warning/30 bg-pro-warning/15 px-3 py-3 text-sm text-pro-warning">
            <p className="font-medium text-pro-warning">Native agents need an Anthropic API key</p>
            <ol className="list-decimal space-y-1 pl-4 text-xs text-pro-warning">
              <li>
                Get a key at{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pro-warning underline underline-offset-2"
                >
                  console.anthropic.com
                </a>
              </li>
              <li>
                Add to <code className="text-pro-warning">.env.local</code>:{" "}
                <code className="text-pro-warning">ANTHROPIC_API_KEY=sk-ant-…</code>
              </li>
              <li>Restart the dev server (<code className="text-pro-warning">npm run dev</code>)</li>
              <li>Reload this page — one-click run will turn on</li>
            </ol>
            <p className="text-xs text-pro-warning/80">
              Until then, use <strong className="text-pro-warning">Run manual agent</strong> — same
              output via copy/paste in Claude.
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {agentsEnabled ? (
            <Button
              type="button"
              className="bg-pro-primary hover:brightness-110"
              disabled={!hasScript || running}
              onClick={() => void runAgent(false)}
            >
              {running ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Running…
                </>
              ) : (
                "Run Director's Agent"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-pro-primary hover:brightness-110"
              disabled={running}
              onClick={openManualAgent}
            >
              Run manual agent
            </Button>
          )}
          {staging?.status === "review" ? (
            <Button
              type="button"
              variant="outline"
              className="border-white/[0.1] text-pro-text"
              disabled={running}
              onClick={commitApproved}
            >
              Commit approved
            </Button>
          ) : null}
          <ProExportDownloadButton
            projectId={projectId}
            projectName={projectName}
            kind="preproduction-report"
            label="Export package (.md)"
            includeDrafts
            className="inline-flex items-center rounded-lg border border-white/[0.08] bg-pro-elevated px-3 py-2 text-sm text-white hover:border-pro-primary/50 disabled:opacity-50"
            successMessage="Pre-production report downloaded."
          />
        </div>

        {running || progressMessage ? (
          <p className="mt-3 text-sm text-emerald-300/90" role="status">
            {progressMessage ?? STEP_LABELS[progressStep ?? "script_analyzer"]}
          </p>
        ) : null}

        {error ? (
          <p className="mt-2 text-sm text-pro-warning" role="alert">
            {error}
          </p>
        ) : null}

        {staging?.status === "review" ? (
          <div className="mt-4 space-y-4 rounded-xl border border-white/[0.08] bg-pro-surface p-4">
            <p className="text-sm font-medium text-white">Review suggestions</p>
            {staging.executiveSummary ? (
              <p className="text-xs text-pro-text-secondary">{staging.executiveSummary}</p>
            ) : null}

            <ul className="space-y-2">
              {staging.scenes.map((s) => (
                <li
                  key={s.suggestionId}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                    s.status === "approved"
                      ? "border-emerald-500/40 bg-emerald-950/20"
                      : s.status === "rejected"
                        ? "border-red-500/30 bg-red-950/10 opacity-60"
                        : "border-white/[0.08] bg-pro-elevated"
                  }`}
                >
                  <span className="min-w-0 text-pro-text">
                    <span className="font-medium">{s.scene.heading || "Untitled"}</span>
                    <span className="text-pro-text-secondary"> — {s.scene.oneLine}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <ConfidenceBadge value={s.confidence} />
                    <ApprovalButtons
                      status={s.status}
                      onSet={(status) =>
                        patchStaging((st) => ({
                          ...st,
                          scenes: st.scenes.map((x) =>
                            x.suggestionId === s.suggestionId ? { ...x, status } : x
                          ),
                        }))
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>

            {staging.locations.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase text-pro-text-secondary">Locations</p>
                <ul className="space-y-1">
                  {staging.locations.map((loc) => (
                    <li key={loc.suggestionId} className="flex items-center justify-between gap-2 text-sm">
                      <span>{loc.name}</span>
                      <div className="flex items-center gap-2">
                        <ConfidenceBadge value={loc.confidence} />
                        <ApprovalButtons
                          status={loc.status}
                          onSet={(status) =>
                            patchStaging((st) => ({
                              ...st,
                              locations: st.locations.map((x) =>
                                x.suggestionId === loc.suggestionId ? { ...x, status } : x
                              ),
                            }))
                          }
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {staging.shotSequences.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase text-pro-text-secondary">Shot sequences</p>
                <ul className="space-y-1">
                  {staging.shotSequences.map((shot) => (
                    <li
                      key={shot.suggestionId}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-pro-elevated px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 text-pro-text">
                        {shot.title}
                        {shot.notes ? (
                          <span className="text-pro-text-secondary"> — {shot.notes.slice(0, 120)}</span>
                        ) : null}
                      </span>
                      <div className="flex items-center gap-2">
                        <ConfidenceBadge value={shot.confidence} />
                        <ApprovalButtons
                          status={shot.status}
                          onSet={(status) =>
                            patchStaging((st) => ({
                              ...st,
                              shotSequences: st.shotSequences.map((x) =>
                                x.suggestionId === shot.suggestionId ? { ...x, status } : x
                              ),
                            }))
                          }
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {staging.visual ? (
              <div className="rounded-lg border border-white/[0.08] bg-pro-surface p-3 text-sm">
                <p className="text-xs font-medium uppercase text-pro-text-secondary">Visual bible</p>
                <p className="mt-1 text-pro-text">{staging.visual.mood}</p>
                {staging.visual.palette.length > 0 ? (
                  <p className="mt-1 text-xs text-pro-text-secondary">
                    Palette: {staging.visual.palette.join(", ")}
                  </p>
                ) : null}
                <div className="mt-2 flex items-center gap-2">
                  <ConfidenceBadge value={staging.visual.confidence} />
                  <ApprovalButtons
                    status={staging.visual.status}
                    onSet={(status) =>
                      patchStaging((st) => ({
                        ...st,
                        visual: st.visual ? { ...st.visual, status } : null,
                      }))
                    }
                  />
                </div>
              </div>
            ) : null}

            {staging.budget ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-pro-surface p-3 text-sm">
                <span>{staging.budget.summary}</span>
                <div className="flex items-center gap-2">
                  <ConfidenceBadge value={staging.budget.confidence} />
                  <ApprovalButtons
                    status={staging.budget.status}
                    onSet={(status) =>
                      patchStaging((st) => ({
                        ...st,
                        budget: st.budget ? { ...st.budget, status } : null,
                      }))
                    }
                  />
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={refineHint}
                onChange={(e) => setRefineHint(e.target.value)}
                placeholder="Refine: e.g. more cinematic, lower budget…"
                className="min-w-[200px] flex-1 rounded-lg border border-white/[0.08] bg-pro-muted px-3 py-2 text-sm text-white"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-white/[0.1] text-pro-text"
                disabled={!refineHint.trim() || running}
                onClick={() => void runAgent(true)}
              >
                Refine
              </Button>
            </div>

            <details className="group" open={showPreview} onToggle={(e) => setShowPreview(e.currentTarget.open)}>
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-pro-text-secondary marker:content-none [&::-webkit-details-marker]:hidden">
                Live report preview
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-white/[0.08] bg-[#050505] p-3 text-xs text-pro-text-secondary whitespace-pre-wrap">
                {previewMd}
              </pre>
            </details>
          </div>
        ) : null}
      </section>

      <details
        ref={manualRef}
        className="group rounded-xl border border-white/[0.08] bg-pro-surface"
        open={manualOpen}
        onToggle={(e) => setManualOpen(e.currentTarget.open)}
      >
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-pro-text-secondary marker:content-none [&::-webkit-details-marker]:hidden">
          {agentsEnabled
            ? "Manual fallback (copy/paste — API-free tier)"
            : "Manual agent — copy prompt → paste JSON (works now)"}
        </summary>
        <div className="border-t border-white/[0.08] p-4 pt-0">
          <ScriptToPrepAgentPanel projectId={projectId} state={state} updateState={updateState} />
        </div>
      </details>
    </div>
  );
}
