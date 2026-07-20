import { SHOT_STATUS_OPTIONS, SHOT_TYPE_OPTIONS } from "@/lib/pro/shot-plan";
import type {
  PlannedShot,
  ProjectStatePayload,
  SceneRow,
  ShotSequence,
} from "@/lib/pro/types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shotTypeLabel(shotType: PlannedShot["shotType"]): string {
  return SHOT_TYPE_OPTIONS.find((o) => o.value === shotType)?.label ?? shotType;
}

function shotStatusLabel(status: PlannedShot["status"]): string {
  return SHOT_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

function sceneForShot(
  state: ProjectStatePayload,
  shot: PlannedShot,
  seq: ShotSequence
): SceneRow | null {
  if (shot.sceneId) {
    return state.directorPrep.scenes.find((s) => s.id === shot.sceneId) ?? null;
  }
  if (seq.sceneNumber != null) {
    return state.directorPrep.scenes.find((s) => s.number === seq.sceneNumber) ?? null;
  }
  return null;
}

function resolveVisualRef(
  shot: PlannedShot,
  scene: SceneRow | null,
  fallbackRefs: string[]
): string {
  if (shot.visualRefUrl.trim()) return shot.visualRefUrl.trim();
  if (scene?.visualRefs[0]?.trim()) return scene.visualRefs[0].trim();
  return fallbackRefs[0] ?? "";
}

type StoryboardFrame = {
  shotId: string;
  shotNumber: string;
  sequenceTitle: string;
  sceneLabel: string;
  shot: PlannedShot;
  visualRef: string;
};

function collectStoryboardFrames(state: ProjectStatePayload): StoryboardFrame[] {
  const fallbackRefs = state.visualBible.referenceUrls;
  const frames: StoryboardFrame[] = [];

  state.shotPlan.sequences.forEach((seq, seqIndex) => {
    seq.shots.forEach((shot, shotIndex) => {
      const scene = sceneForShot(state, shot, seq);
      const sceneLabel = scene
        ? `Scene ${scene.number}${scene.heading ? ` — ${scene.heading}` : ""}`
        : seq.sceneNumber != null
          ? `Scene ${seq.sceneNumber}`
          : seq.title.trim() || `Sequence ${seqIndex + 1}`;

      frames.push({
        shotId: shot.id,
        shotNumber: `${seqIndex + 1}.${shotIndex + 1}`,
        sequenceTitle: seq.title.trim() || `Sequence ${seqIndex + 1}`,
        sceneLabel,
        shot,
        visualRef: resolveVisualRef(shot, scene, fallbackRefs),
      });
    });
  });

  return frames;
}

function visualRefMarkdown(ref: string, alt: string): string {
  if (!ref) return "_No visual reference linked._";
  if (ref.startsWith("data:image")) {
    return "_Uploaded still in project — use **Storyboard HTML** export to print embedded images._";
  }
  if (/^https?:\/\//i.test(ref)) {
    return `![${alt}](${ref})`;
  }
  return `_${ref}_`;
}

function visualRefHtml(ref: string, alt: string): string {
  if (!ref) {
    return `<div class="frame-placeholder">No reference</div>`;
  }
  if (ref.startsWith("data:image") || /^https?:\/\//i.test(ref)) {
    return `<img src="${escapeHtml(ref)}" alt="${escapeHtml(alt)}" class="frame-image" />`;
  }
  return `<div class="frame-placeholder">${escapeHtml(ref)}</div>`;
}

function frameNotesBlock(shot: PlannedShot): string[] {
  const lines: string[] = [];
  if (shot.label.trim()) lines.push(`**${shot.label.trim()}**`);
  lines.push(
    `Type: ${shotTypeLabel(shot.shotType)} · ${shot.durationSeconds}s · ${shotStatusLabel(shot.status)}`
  );
  if (shot.visualBibleNote.trim()) lines.push(`Look: ${shot.visualBibleNote.trim()}`);
  if (shot.cameraNotes.trim()) lines.push(`Camera: ${shot.cameraNotes.trim()}`);
  if (shot.lightingNotes.trim()) lines.push(`Lighting: ${shot.lightingNotes.trim()}`);
  return lines;
}

/** Markdown storyboard packet — one panel per planned shot. */
export function buildStoryboardMd(state: ProjectStatePayload, projectName: string): string {
  const frames = collectStoryboardFrames(state);
  const date = new Date().toISOString().slice(0, 10);
  const vb = state.visualBible;

  const lines: string[] = [
    `# Storyboard — ${projectName}`,
    "",
    `_Exported ${date} · ${frames.length} frame${frames.length === 1 ? "" : "s"}_`,
    "",
  ];

  if (vb.palette.length) {
    lines.push("## Look palette", "", vb.palette.map((p) => `- ${p}`).join("\n"), "");
  }
  if (vb.lensAndFraming.trim()) {
    lines.push("## Lens & framing", "", vb.lensAndFraming.trim(), "");
  }

  if (frames.length === 0) {
    lines.push(
      "_No shots in the shot plan yet._",
      "",
      "Generate a shot plan in **Production**, then export again."
    );
    return lines.join("\n");
  }

  let lastSequence = "";
  for (const frame of frames) {
    if (frame.sequenceTitle !== lastSequence) {
      lines.push(`## ${frame.sequenceTitle}`, "");
      if (frame.sceneLabel) lines.push(`_${frame.sceneLabel}_`, "");
      lastSequence = frame.sequenceTitle;
    }

    lines.push(
      `### Shot ${frame.shotNumber}`,
      "",
      visualRefMarkdown(frame.visualRef, frame.shot.label || `Shot ${frame.shotNumber}`),
      "",
      ...frameNotesBlock(frame.shot).map((l) => (l.startsWith("**") ? l : `- ${l}`)),
      ""
    );
  }

  lines.push(
    "---",
    "",
    "Tip: For print-ready boards with uploaded stills, download **Storyboard HTML** from Finish → Export."
  );

  return lines.join("\n");
}

const STORYBOARD_HTML_STYLES = `
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; color: #111; background: #f5f5f5; }
  header { margin-bottom: 24px; }
  h1 { margin: 0 0 4px; font-size: 1.5rem; }
  .meta { color: #555; font-size: 0.875rem; }
  .look-block { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 0.875rem; }
  .sequence { margin-bottom: 28px; }
  .sequence h2 { font-size: 1.125rem; margin: 0 0 12px; border-bottom: 2px solid #111; padding-bottom: 4px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
  .frame { background: #fff; border: 1px solid #ccc; border-radius: 6px; overflow: hidden; break-inside: avoid; page-break-inside: avoid; }
  .frame-image { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; background: #eee; }
  .frame-placeholder { aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; padding: 12px; text-align: center; font-size: 0.75rem; color: #666; background: #eee; }
  .frame-body { padding: 10px 12px; font-size: 0.8125rem; line-height: 1.4; }
  .frame-title { font-weight: 600; margin: 0 0 4px; }
  .frame-meta { color: #444; margin: 0 0 6px; }
  .frame-note { margin: 4px 0 0; color: #333; }
  .empty { background: #fff; padding: 24px; border-radius: 8px; border: 1px dashed #ccc; }
  @media print {
    body { background: #fff; padding: 12px; }
    .grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .frame { border-color: #999; }
  }
`;

/** Self-contained HTML storyboard for browser print / PDF. */
export function buildStoryboardHtml(state: ProjectStatePayload, projectName: string): string {
  const frames = collectStoryboardFrames(state);
  const date = new Date().toISOString().slice(0, 10);
  const vb = state.visualBible;

  const lookBits: string[] = [];
  if (vb.palette.length) lookBits.push(`Palette: ${vb.palette.join(" · ")}`);
  if (vb.lensAndFraming.trim()) lookBits.push(`Lens: ${escapeHtml(vb.lensAndFraming.trim())}`);
  if (state.directorPrep.agentMeta.visualMood.trim()) {
    lookBits.push(`Mood: ${escapeHtml(state.directorPrep.agentMeta.visualMood.trim().slice(0, 160))}`);
  }

  let body = "";
  if (frames.length === 0) {
    body = `<p class="empty">No shots in the shot plan yet. Build shots in Production, then export again.</p>`;
  } else {
    const bySequence = new Map<string, StoryboardFrame[]>();
    for (const frame of frames) {
      const key = frame.sequenceTitle;
      if (!bySequence.has(key)) bySequence.set(key, []);
      bySequence.get(key)!.push(frame);
    }

    body = [...bySequence.entries()]
      .map(([title, seqFrames]) => {
        const sceneLine = seqFrames[0]?.sceneLabel
          ? `<p class="meta">${escapeHtml(seqFrames[0].sceneLabel)}</p>`
          : "";
        const cards = seqFrames
          .map((frame) => {
            const shot = frame.shot;
            const notes = [
              shot.visualBibleNote.trim()
                ? `<p class="frame-note"><strong>Look:</strong> ${escapeHtml(shot.visualBibleNote.trim())}</p>`
                : "",
              shot.cameraNotes.trim()
                ? `<p class="frame-note"><strong>Camera:</strong> ${escapeHtml(shot.cameraNotes.trim())}</p>`
                : "",
              shot.lightingNotes.trim()
                ? `<p class="frame-note"><strong>Light:</strong> ${escapeHtml(shot.lightingNotes.trim())}</p>`
                : "",
            ].join("");

            return `<article class="frame">
              ${visualRefHtml(frame.visualRef, frame.shot.label || `Shot ${frame.shotNumber}`)}
              <div class="frame-body">
                <p class="frame-title">Shot ${escapeHtml(frame.shotNumber)}${shot.label.trim() ? ` — ${escapeHtml(shot.label.trim())}` : ""}</p>
                <p class="frame-meta">${escapeHtml(shotTypeLabel(shot.shotType))} · ${shot.durationSeconds}s · ${escapeHtml(shotStatusLabel(shot.status))}</p>
                ${notes}
              </div>
            </article>`;
          })
          .join("");

        return `<section class="sequence">
          <h2>${escapeHtml(title)}</h2>
          ${sceneLine}
          <div class="grid">${cards}</div>
        </section>`;
      })
      .join("");
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Storyboard — ${escapeHtml(projectName)}</title>
  <style>${STORYBOARD_HTML_STYLES}</style>
</head>
<body>
  <header>
    <h1>Storyboard — ${escapeHtml(projectName)}</h1>
    <p class="meta">Exported ${date} · ${frames.length} frame${frames.length === 1 ? "" : "s"} · 35mmAiPro</p>
  </header>
  ${lookBits.length ? `<div class="look-block">${lookBits.join("<br />")}</div>` : ""}
  ${body}
</body>
</html>`;
}
