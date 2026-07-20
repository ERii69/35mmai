import type { AgentPartialPatch } from "@/lib/pro/agents/stream-types";
import { agentLabel, PREP_AGENT_ROSTER, type PrepPipelineAgentId } from "@/lib/pro/agent-roster";
import type { AgentStagingBundle, DirectorRulesState } from "@/lib/pro/types";

export type FilmmakerAgentInsight = {
  agentId: PrepPipelineAgentId;
  label: string;
  summary: string;
  rationale: string;
};

function toneHint(rules: DirectorRulesState): string {
  const bits = [rules.styleNotes, rules.toneAndRefs, rules.projectInstructions]
    .map((s) => s.trim())
    .filter(Boolean);
  if (!bits.length) return "your vision";
  const joined = bits.join(" ").toLowerCase();
  if (joined.includes("slow") || joined.includes("natural")) return "your slow-burn tone";
  if (joined.includes("rural") || joined.includes("nomad")) return "your rural / intimate tone";
  if (joined.includes("noir") || joined.includes("neon")) return "your noir / contrast look";
  return "your Director's Bible";
}

function topNames(locs: { name: string }[], n = 3): string {
  return locs
    .slice(0, n)
    .map((l) => l.name)
    .filter(Boolean)
    .join(", ");
}

export function buildFilmmakerAgentInsight(
  agentId: PrepPipelineAgentId,
  patch: AgentPartialPatch,
  rules: DirectorRulesState,
  stagingSoFar: AgentStagingBundle | null
): FilmmakerAgentInsight {
  const label = agentLabel(agentId);
  const tone = toneHint(rules);

  switch (agentId) {
    case "script_analyzer": {
      const count = patch.scenes?.length ?? 0;
      const first = patch.scenes?.[0]?.scene;
      const summary =
        count > 0
          ? `Broke the script into ${count} scene${count === 1 ? "" : "s"}${first?.heading ? ` — opens on ${first.heading}` : ""}.`
          : "Could not extract scenes — check script formatting.";
      const rationale =
        patch.executiveSummary?.trim() ||
        `Scene headings and one-liners were derived from your script and matched to ${tone}.`;
      return { agentId, label, summary, rationale };
    }
    case "research": {
      const locs = patch.locations ?? [];
      const count = locs.length;
      const top = topNames(locs, 3);
      const summary =
        count > 0
          ? `Found ${count} location${count === 1 ? "" : "s"}. Top 3 match ${tone}${top ? `: ${top}` : ""}.`
          : "No distinct locations extracted from scene headings.";
      const rationale =
        patch.researchNotes?.trim().slice(0, 280) ||
        `Locations were inferred from scene headings and cross-checked against ${tone}.`;
      return { agentId, label, summary, rationale };
    }
    case "shot_list": {
      const shots = patch.shotSequences ?? [];
      const count = shots.length;
      const pref = rules.preferredShots.trim();
      const dollyCount = shots.filter((s) => /dolly|slider|track/i.test(s.notes ?? "")).length;
      const moveNote =
        dollyCount > 0
          ? `Suggested ${dollyCount} dolly/track move${dollyCount === 1 ? "" : "s"}`
          : count > 0
            ? `Drafted ${count} shot sequence${count === 1 ? "" : "s"}`
            : "No shot sequences generated yet";
      const summary =
        count > 0 && pref
          ? `${moveNote} based on your preferred shots.`
          : count > 0
            ? `${moveNote} for your scenes.`
            : "No shot sequences generated yet.";
      const rationale = pref
        ? `Coverage favors your preferred shots (${pref.slice(0, 120)}${pref.length > 120 ? "…" : ""}).`
        : `Shot ideas follow standard coverage; add camera preferences in Vision for tighter match.`;
      return { agentId, label, summary, rationale };
    }
    case "budget": {
      const b = patch.budget;
      const summary = b?.summary
        ? `Budget band: ${b.tier} — ${b.summary.slice(0, 100)}${b.summary.length > 100 ? "…" : ""}`
        : "Budget estimate pending.";
      const rationale = `Tier follows your Vision budget level (${rules.budgetTier}) and scene count${
        stagingSoFar?.scenes.length ? ` (${stagingSoFar.scenes.length} scenes)` : ""
      }.`;
      return { agentId, label, summary, rationale };
    }
    case "visual_bible": {
      const v = patch.visual;
      const summary = v?.mood
        ? `Look: ${v.mood.slice(0, 140)}${v.mood.length > 140 ? "…" : ""}`
        : "Visual mood pending.";
      const palette = v?.palette?.length ? v.palette.slice(0, 4).join(", ") : "";
      const rationale = palette
        ? `Palette (${palette}) aligns with ${tone} and reference links in Vision.`
        : `Mood board links and tone notes in Vision guided this pass.`;
      return { agentId, label, summary, rationale };
    }
    default:
      return {
        agentId,
        label,
        summary: "Completed.",
        rationale: "See review below.",
      };
  }
}

/** Filmmaker-facing status while an agent is still running (not raw model logs). */
export function buildAgentThinkingHint(agentId: PrepPipelineAgentId): string {
  return PREP_AGENT_ROSTER.find((a) => a.id === agentId)?.thinkingHint ?? "Working on your prep…";
}

/** Turn raw stream messages into readable thinking-log lines when present. */
export function humanizeThinkingMessage(
  agentId: PrepPipelineAgentId,
  rawMessage: string | undefined
): string {
  const hint = buildAgentThinkingHint(agentId);
  if (!rawMessage?.trim()) return hint;
  const m = rawMessage.trim();
  if (m.length > 160 || /^[{[]/.test(m)) return hint;
  if (/generating|building|analyzing|estimating|synthesizing/i.test(m)) {
    return m.charAt(0).toUpperCase() + m.slice(1);
  }
  return m;
}
