import { isScriptToPromptTemplate } from "@/lib/pro/script-to-prompt-template";
import type { AgentProjectMemory, DirectorRulesState } from "@/lib/pro/types";

function cleanPrefText(text: string): string {
  return text
    .replace(/\s*[—–]\s*/g, ". ")
    .replace(/\.\.+/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function isPromptPackMode(rules: DirectorRulesState, appliedTemplateId?: string | null): boolean {
  if (appliedTemplateId && isScriptToPromptTemplate(appliedTemplateId)) return true;
  return rules.genreTags.some((tag) => tag.toLowerCase() === "prompt pack");
}

function rulesCoverCameraLanguage(rules: DirectorRulesState): boolean {
  const camera = rules.preferredShots.trim().toLowerCase();
  if (!camera) return false;
  return /master|wide|coverage|handheld|insert/.test(camera);
}

/** Distill durable preferences from decisions + vision for agent context. */
export function synthesizeLearnedPreferences(
  memory: AgentProjectMemory,
  rules: DirectorRulesState,
  appliedTemplateId?: string | null
): string[] {
  const prefs = new Set<string>();
  const promptPack = isPromptPackMode(rules, appliedTemplateId);

  if (rules.preferredShots.trim()) {
    prefs.add(cleanPrefText(`Camera: ${rules.preferredShots.trim().slice(0, 120)}`));
  }
  if (rules.styleNotes.trim()) {
    prefs.add(cleanPrefText(`Look: ${rules.styleNotes.trim().slice(0, 100)}`));
  }
  if (promptPack && rules.projectInstructions.trim()) {
    prefs.add(cleanPrefText(`Pack: ${rules.projectInstructions.trim().slice(0, 120)}`));
  }

  if (promptPack) {
    prefs.add("Build copy-ready prompts in Finish → Prompts after the shot plan exists.");
    return [...prefs].slice(0, 6);
  }

  const approved = memory.decisions.filter((d) => d.approved);
  const rejected = memory.decisions.filter((d) => !d.approved);
  const rulesCamera = rules.preferredShots.trim().toLowerCase();

  const shotKeeps = approved.filter((d) => d.agent === "shot_list").length;
  const shotRejects = rejected.filter((d) => d.agent === "shot_list").length;
  if (shotKeeps > shotRejects && shotKeeps > 0) {
    prefs.add("Favors agent shot-list coverage when approved repeatedly.");
  }

  const sceneKeeps = approved.filter((d) => d.summary.toLowerCase().includes("kept scene"));
  if (sceneKeeps.length >= 3) {
    prefs.add(`Often keeps scene breakdowns (${sceneKeeps.length} recent approvals).`);
  }

  for (const d of approved.slice(-6)) {
    if (d.agent === "project" && d.summary.startsWith("Prefers:")) {
      const pref = d.summary.replace(/^Prefers:\s*/i, "").trim();
      if (
        rulesCamera &&
        /master|wide|coverage|handheld|insert/i.test(pref)
      ) {
        continue;
      }
      prefs.add(cleanPrefText(d.summary));
    }
    if (d.summary.toLowerCase().includes("wide") && !rulesCoverCameraLanguage(rules)) {
      prefs.add("Exterior / master wide coverage preferred.");
    }
    if (d.summary.toLowerCase().includes("dolly")) {
      prefs.add("Dolly / track moves approved in shot lists.");
    }
  }

  for (const d of rejected.slice(-4)) {
    if (d.agent === "budget") prefs.add("Rejected higher budget band. Keep lean estimates.");
    if (d.agent === "visual_bible") {
      prefs.add("Rejected visual pass. Tighten palette/mood to script.");
    }
  }

  return [...prefs].map(cleanPrefText).slice(0, 12);
}

export function memoryWithLearnedPreferences(
  memory: AgentProjectMemory,
  rules: DirectorRulesState,
  appliedTemplateId?: string | null
): AgentProjectMemory {
  return {
    ...memory,
    learnedPreferences: synthesizeLearnedPreferences(memory, rules, appliedTemplateId),
  };
}
