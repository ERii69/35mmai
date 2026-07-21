"use client";

import {
  PREP_PIPELINE_ORDER,
  prepAgentsByGroup,
  type PrepPipelineAgentId,
} from "@/lib/pro/agent-roster";
type Props = {
  selected: PrepPipelineAgentId[];
  onChange: (agents: PrepPipelineAgentId[]) => void;
  disabled?: boolean;
  estimateLabel?: string;
  costLabel?: string;
};

export function PrepAgentSelector({
  selected,
  onChange,
  disabled,
  estimateLabel,
  costLabel,
}: Props) {
  const groups = prepAgentsByGroup(PREP_PIPELINE_ORDER);

  function toggle(id: PrepPipelineAgentId) {
    if (disabled) return;
    if (selected.includes(id)) {
      if (selected.length <= 1) return;
      onChange(selected.filter((a) => a !== id));
      return;
    }
    onChange(
      [...selected, id].sort(
        (a, b) => PREP_PIPELINE_ORDER.indexOf(a) - PREP_PIPELINE_ORDER.indexOf(b)
      )
    );
  }

  const estimateParts = [estimateLabel, costLabel].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-pro-text">What to generate</p>
          <p className="mt-0.5 text-xs text-pro-text-secondary">
            {selected.length} section{selected.length === 1 ? "" : "s"} selected
            {estimateParts.length ? ` · ${estimateParts.join(" · ")}` : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            className="rounded-lg px-2.5 py-1 text-xs text-pro-text-secondary ring-1 ring-white/10 hover:bg-white/5 hover:text-pro-text disabled:opacity-40"
            onClick={() => onChange([...PREP_PIPELINE_ORDER])}
          >
            All
          </button>
          <button
            type="button"
            disabled={disabled}
            className="rounded-lg px-2.5 py-1 text-xs text-pro-text-secondary ring-1 ring-white/10 hover:bg-white/5 hover:text-pro-text disabled:opacity-40"
            onClick={() => onChange(["script_analyzer", "research", "shot_list"])}
          >
            Core 3
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {groups.map(({ group, agents }) => (
          <section key={group.id}>
            <p className="mb-2 text-xs font-medium text-pro-text-secondary">{group.label}</p>
            <ul className="space-y-2">
              {agents.map((agent) => {
                const checked = selected.includes(agent.id);
                return (
                  <li key={agent.id}>
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3 text-sm ring-1 transition ${
                        checked
                          ? "bg-pro-elevated ring-white/[0.08]"
                          : "bg-pro-elevated/60 ring-white/[0.04] hover:ring-white/[0.08]"
                      } ${disabled ? "cursor-default opacity-60" : ""}`}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 size-4 shrink-0 rounded border-white/[0.12] bg-pro-elevated text-pro-primary focus:ring-pro-primary/40"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggle(agent.id)}
                      />
                      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-[10px] font-bold tabular-nums text-pro-text-secondary">
                        {agent.step}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-pro-text">{agent.label}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-pro-text-secondary">
                          {agent.handles}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

    </div>
  );
}
