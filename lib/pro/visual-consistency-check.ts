import type { ProjectStatePayload, VisualConsistencySeverity } from "@/lib/pro/types";

export type VisualConsistencyIssue = {
  sceneNumber: number;
  heading: string;
  message: string;
  severity: VisualConsistencySeverity;
  recommendedFix: string;
};

function pushIssue(
  issues: VisualConsistencyIssue[],
  issue: VisualConsistencyIssue
) {
  if (issues.some((i) => i.sceneNumber === issue.sceneNumber && i.message === issue.message)) return;
  issues.push(issue);
}

/** Proactive flags when scenes drift from the visual bible (runs automatically in Look + Production). */
export function checkVisualConsistency(state: ProjectStatePayload): VisualConsistencyIssue[] {
  const vb = state.visualBible;
  const mood = (state.directorPrep.agentMeta.visualMood || vb.designSheetNotes).toLowerCase();
  const lens = vb.lensAndFraming.toLowerCase();
  const grain = vb.grainAndTexture.toLowerCase();
  const palette = vb.palette.map((p) => p.toLowerCase()).filter(Boolean);
  const issues: VisualConsistencyIssue[] = [];

  const prefersSoft =
    mood.includes("soft") ||
    mood.includes("natural") ||
    mood.includes("diffus") ||
    lens.includes("soft");
  const prefersHard =
    mood.includes("hard") ||
    mood.includes("contrast") ||
    mood.includes("noir") ||
    mood.includes("backlit");

  const moodKeywords = ["noir", "neon", "natural", "grain", "warm", "cold", "desaturated", "rural"];
  const locked = moodKeywords.filter((k) => mood.includes(k));
  const paletteClashScenes: number[] = [];

  for (const scene of state.directorPrep.scenes) {
    const refText = scene.visualRefs
      .filter((r) => !r.startsWith("data:image"))
      .join(" ");
    const notes = `${scene.oneLine} ${scene.shotNotes} ${refText}`.toLowerCase();
    if (!notes.trim()) continue;

    if (prefersSoft && /backlight|hard light|harsh|specular|neon/i.test(notes)) {
      pushIssue(issues, {
        sceneNumber: scene.number,
        heading: scene.heading,
        severity: "high",
        message:
          "This scene suggests hard/backlit lighting, but your Visual Bible specifies soft, natural light.",
        recommendedFix:
          "Rewrite shot notes for motivated window or bounce key; remove unmotivated overhead hard sources unless bible is updated.",
      });
    }

    if (prefersHard && /soft light|overcast|flat light|diffus/i.test(notes) && !/noir/i.test(notes)) {
      pushIssue(issues, {
        sceneNumber: scene.number,
        heading: scene.heading,
        severity: "medium",
        message: "Scene reads soft/overcast while your bible pushes contrast and harder light.",
        recommendedFix:
          "Add negative fill or edge light in shot notes, or soften the global bible if this scene should stay flat.",
      });
    }

    if (grain.includes("heavy") && /clean|digital|crisp/i.test(notes)) {
      pushIssue(issues, {
        sceneNumber: scene.number,
        heading: scene.heading,
        severity: "low",
        message: "Scene notes sound very clean — your bible calls for heavier grain/texture.",
        recommendedFix:
          "Note film grain / texture overlay in shot notes or reference stills that match the bible grain spec.",
      });
    }

    for (const kw of locked) {
      const opposite =
        kw === "warm"
          ? "cold"
          : kw === "cold"
            ? "warm"
            : kw === "natural"
              ? "neon"
              : kw === "neon"
                ? "naturalistic"
                : null;
      if (opposite && notes.includes(opposite)) {
        pushIssue(issues, {
          sceneNumber: scene.number,
          heading: scene.heading,
          severity: "medium",
          message: `Scene notes mention “${opposite}” but your look bible leans “${kw}”.`,
          recommendedFix: `Align palette and lighting notes with the locked “${kw}” direction, or revise the bible.`,
        });
        break;
      }
    }

    if (palette.length && scene.visualRefs.length) {
      const allRefsFromLibrary = scene.visualRefs.every((r) =>
        state.visualBible.referenceUrls.some((lib) => lib.toLowerCase() === r.toLowerCase())
      );
      if (allRefsFromLibrary) continue;

      const textRefs = scene.visualRefs.filter((r) => !r.startsWith("data:image"));
      if (textRefs.length === 0) continue;
      const clash = textRefs.some((ref) => {
        const r = ref.toLowerCase();
        return palette.every((p) => !r.includes(p.slice(0, 6)) && p.length > 4);
      });
      if (clash) {
        paletteClashScenes.push(scene.number);
      }
    }
  }

  if (paletteClashScenes.length > 0) {
    pushIssue(issues, {
      sceneNumber: paletteClashScenes[0],
      heading: state.directorPrep.scenes.find((s) => s.number === paletteClashScenes[0])?.heading ?? "",
      severity: "low",
      message:
        paletteClashScenes.length === 1
          ? "Scene refs may not match your palette — double-check before generating."
          : `${paletteClashScenes.length} scenes have refs that may not match your palette.`,
      recommendedFix:
        "Update reference links so they match your palette, or adjust palette swatches in Edit look details.",
    });
  }

  return issues.slice(0, 16);
}

export function severityLabel(severity: VisualConsistencySeverity): string {
  if (severity === "high") return "High";
  if (severity === "medium") return "Medium";
  return "Low";
}
