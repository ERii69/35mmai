import type { PrepPipelineAgentId } from "@/lib/pro/agent-roster";
import type { AgentStagingBundle } from "@/lib/pro/types";

/** Full text shown when an agent result card is expanded. */
export function agentResultDetail(
  id: PrepPipelineAgentId,
  staging: AgentStagingBundle | null
): string | null {
  if (!staging) return null;

  switch (id) {
    case "script_analyzer": {
      if (staging.scenes.length === 0) return null;
      return staging.scenes
        .map((s) => {
          const heading = s.scene.heading || `Scene ${s.scene.number}`;
          const line = s.scene.oneLine?.trim();
          return line ? `${s.scene.number}. ${heading}\n   ${line}` : `${s.scene.number}. ${heading}`;
        })
        .join("\n\n");
    }
    case "research": {
      const parts: string[] = [];
      if (staging.researchNotes.trim()) {
        parts.push(staging.researchNotes.trim());
      }
      const characters = staging.characters ?? [];
      if (characters.length > 0) {
        parts.push(
          `Characters (${characters.length}):\n${characters
            .map((c) => {
              const meta = c.notes?.trim();
              return meta ? `• ${c.name} — ${meta}` : `• ${c.name}`;
            })
            .join("\n")}`
        );
      }
      if (staging.locations.length > 0) {
        parts.push(
          `Locations (${staging.locations.length}):\n${staging.locations
            .map((l) => {
              const meta = l.notes?.trim() || (l.sceneNumbers?.length ? `Scenes ${l.sceneNumbers.join(", ")}` : "");
              return meta ? `• ${l.name} — ${meta}` : `• ${l.name}`;
            })
            .join("\n")}`
        );
      }
      return parts.length > 0 ? parts.join("\n\n") : null;
    }
    case "shot_list": {
      if (staging.shotSequences.length === 0) return null;
      return staging.shotSequences
        .map((s) => {
          const head = s.sceneNumber != null ? `Scene ${s.sceneNumber}: ${s.title}` : s.title;
          return `${head}\n${s.notes}`;
        })
        .join("\n\n—\n\n");
    }
    case "budget": {
      return staging.budget?.summary.trim() || null;
    }
    case "visual_bible": {
      const v = staging.visual;
      if (!v) return null;
      const parts: string[] = [];
      if (v.mood.trim()) parts.push(`Mood: ${v.mood}`);
      if (v.designNotes.trim()) parts.push(`Design: ${v.designNotes}`);
      if (v.palette.length > 0) parts.push(`Palette: ${v.palette.join(", ")}`);
      if (v.lensAndFraming?.trim()) parts.push(`Lens & framing: ${v.lensAndFraming}`);
      if (v.lightingApproach?.trim()) parts.push(`Lighting: ${v.lightingApproach}`);
      if (v.grainAndTexture?.trim()) parts.push(`Texture: ${v.grainAndTexture}`);
      return parts.length > 0 ? parts.join("\n\n") : null;
    }
    default:
      return null;
  }
}

/** One-line preview for collapsed agent cards (no truncation mid-word). */
export function agentResultPreview(
  id: PrepPipelineAgentId,
  staging: AgentStagingBundle | null,
  fallback: string | null
): string {
  if (id === "research" && staging) {
    const characterCount = staging.characters?.length ?? 0;
    const locationCount = staging.locations.length;
    if (characterCount > 0 || locationCount > 0) {
      const parts: string[] = [];
      if (characterCount > 0) {
        parts.push(`${characterCount} character${characterCount === 1 ? "" : "s"}`);
      }
      if (locationCount > 0) {
        parts.push(`${locationCount} location${locationCount === 1 ? "" : "s"}`);
      }
      const names = (staging.characters ?? [])
        .slice(0, 4)
        .map((c) => c.name)
        .join(", ");
      return names ? `${parts.join(" · ")} — ${names}${characterCount > 4 ? "…" : ""}` : parts.join(" · ");
    }
  }

  const full = agentResultDetail(id, staging);
  if (full) {
    const firstLine = full.split("\n").find((l) => l.trim())?.trim() ?? full;
    if (firstLine.length <= 140) return firstLine;
    return `${firstLine.slice(0, 137)}…`;
  }
  return fallback ?? "Complete";
}
