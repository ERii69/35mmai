import { SHOT_TYPE_OPTIONS } from "@/lib/pro/shot-plan";
import type { PlannedShot, ProjectStatePayload, SceneRow, ShotSequence } from "@/lib/pro/types";

const SCENE_HEADING_RE =
  /^(?:(?:INT|EXT|INT\/EXT|I\/E|EST)\.?)\s+.+/i;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shotTypeLabel(shotType: PlannedShot["shotType"]): string {
  return SHOT_TYPE_OPTIONS.find((o) => o.value === shotType)?.label ?? shotType;
}

function paragraph(type: string, text: string, attrs = ""): string {
  const body = escapeXml(text);
  return `    <Paragraph Type="${type}"${attrs}>\n      <Text>${body}</Text>\n    </Paragraph>`;
}

function sceneHeadingParagraph(heading: string, sceneNumber?: number): string {
  const numAttr = sceneNumber != null ? ` Number="${sceneNumber}"` : "";
  const body = escapeXml(heading);
  return `    <Paragraph Type="Scene Heading"${numAttr}>
      <SceneProperties Length="1/8" Page="1" Title=""/>
      <Text>${body}</Text>
    </Paragraph>`;
}

function shotsForScene(
  state: ProjectStatePayload,
  scene: SceneRow
): ShotSequence | undefined {
  return (
    state.shotPlan.sequences.find((s) => s.sceneNumber === scene.number) ??
    (scene.linkedSequenceId
      ? state.shotPlan.sequences.find((s) => s.id === scene.linkedSequenceId)
      : undefined)
  );
}

function shotListParagraphs(state: ProjectStatePayload, seq: ShotSequence): string[] {
  const lines: string[] = [];
  lines.push(paragraph("Action", `[35mmAiPro — Shot list: ${seq.title}]`));
  if (seq.notes.trim()) {
    lines.push(paragraph("Action", seq.notes.trim()));
  }
  seq.shots.forEach((shot, i) => {
    const parts = [
      `${i + 1}. ${shot.label.trim() || shotTypeLabel(shot.shotType)}`,
      `${shot.durationSeconds}s`,
      shot.status,
    ];
    if (shot.cameraNotes.trim()) parts.push(shot.cameraNotes.trim());
    if (shot.lightingNotes.trim()) parts.push(`Light: ${shot.lightingNotes.trim()}`);
    lines.push(paragraph("Action", parts.join(" · ")));
  });
  return lines;
}

function paragraphsFromScenes(state: ProjectStatePayload): string[] {
  const scenes =
    state.directorPrep.scenes.length > 0
      ? state.directorPrep.scenes
      : [];
  const out: string[] = [];

  if (scenes.length === 0) return out;

  for (const scene of scenes) {
    const heading = scene.heading.trim() || `SCENE ${scene.number}`;
    out.push(sceneHeadingParagraph(heading, scene.number));
    if (scene.oneLine.trim()) {
      out.push(paragraph("Action", scene.oneLine.trim()));
    }
    if (scene.shotNotes.trim()) {
      out.push(paragraph("Action", `[Prep notes] ${scene.shotNotes.trim()}`));
    }
    const seq = shotsForScene(state, scene);
    if (seq && seq.shots.length > 0) {
      out.push(...shotListParagraphs(state, seq));
    }
  }
  return out;
}

function classifyRawLine(line: string): "scene" | "character" | "parenthetical" | "action" {
  const t = line.trim();
  if (!t) return "action";
  if (SCENE_HEADING_RE.test(t)) return "scene";
  if (/^\(.+\)$/.test(t)) return "parenthetical";
  if (t === t.toUpperCase() && t.length < 40 && !t.includes(".") && /^[A-Z0-9 ']+$/.test(t)) {
    return "character";
  }
  return "action";
}

function paragraphsFromRawText(raw: string): string[] {
  const out: string[] = [];
  let sceneNum = 0;
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    const kind = classifyRawLine(t);
    if (kind === "scene") {
      sceneNum += 1;
      out.push(sceneHeadingParagraph(t, sceneNum));
    } else if (kind === "character") {
      out.push(paragraph("Character", t));
    } else if (kind === "parenthetical") {
      out.push(paragraph("Parenthetical", t));
    } else {
      out.push(paragraph("Action", t));
    }
  }
  return out;
}

function orphanShotPlanParagraphs(state: ProjectStatePayload): string[] {
  const linked = new Set(state.directorPrep.scenes.map((s) => s.linkedSequenceId).filter(Boolean));
  const out: string[] = [];
  for (const seq of state.shotPlan.sequences) {
    if (linked.has(seq.id) && seq.sceneNumber != null) continue;
    if (seq.shots.length === 0) continue;
    out.push(paragraph("Action", "—"));
    out.push(...shotListParagraphs(state, seq));
  }
  return out;
}

/** Final Draft `.fdx` XML — screenplay + inline shot lists for import. */
export function buildFdxExport(state: ProjectStatePayload, projectName: string): string {
  const dp = state.directorPrep;
  const title = escapeXml(dp.screenplay.title.trim() || projectName);
  const draft = dp.screenplay.draftLabel.trim();
  const body: string[] = [];

  body.push(paragraph("Action", "Exported from 35mmAiPro — Director's Agent workspace."));
  if (dp.agentMeta.executiveSummary.trim()) {
    body.push(paragraph("Action", `[Summary] ${dp.agentMeta.executiveSummary.trim().slice(0, 500)}`));
  }

  const raw = dp.screenplay.rawText.trim();
  if (dp.scenes.length > 0) {
    body.push(...paragraphsFromScenes(state));
  } else if (raw.length > 0) {
    body.push(...paragraphsFromRawText(raw));
  } else {
    body.push(
      sceneHeadingParagraph("INT. LOCATION - DAY", 1),
      paragraph("Action", "Paste your script in Prep, then re-export to Final Draft.")
    );
  }

  body.push(...orphanShotPlanParagraphs(state));

  const titlePage = `  <TitlePage>
    <Content>
      <Paragraph Type="Title">
        <Text>${title}</Text>
      </Paragraph>
      ${draft ? `<Paragraph Type="Draft Date"><Text>${escapeXml(draft)}</Text></Paragraph>` : ""}
      <Paragraph Type="Credit">
        <Text>35mmAiPro export</Text>
      </Paragraph>
    </Content>
  </TitlePage>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<FinalDraft DocumentType="Script" Template="No" Version="1">
${titlePage}
  <Content>
${body.join("\n")}
  </Content>
</FinalDraft>
`;
}
