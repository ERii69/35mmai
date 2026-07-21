/**
 * Original playbook copy for Pro templates (35mmAI — not copied from third-party Notion/PDF packs).
 */

export const CLASSICAL_AI_SHORT_PLAYBOOK = `You are directing a classical short film — story and performance first — using AI only where it extends your vision.

**Order of work (do not skip):**
1. **World bible** — story truth, characters, places, tone. If it is not on the page, it will not stay consistent in generation.
2. **Visual bible** — design sheet, palette, lens language, grain. This is your contract with every frame you make elsewhere.
3. **Shot plan** — sequences and hero frames before you open any generator.
4. **Kit** — pick tools from the 35mmAI catalog by rank; generate outside this app.
5. **Workflow phase** — stay honest about pre-production vs post; do not rush to “finished” clips.
6. **Post checklist** — edit for story, then color and sound; cohesion beats novelty.

**Not the goal:** viral clips, trend formats, or platform bait. The goal is a film you would stand behind in a festival conversation.`;

export const VISUAL_LOOK_BIBLE_PLAYBOOK = `Start with **look** before shots or prompts.

Fill palette, lighting intent, and reference URLs first. Share the visual bible with anyone helping on generation — same refs, same rules. When a frame drifts, fix the bible before generating again.`;

export const VISUAL_CONTACT_SHEET_PLAYBOOK = `Use the nine sequences as a **coverage grid** for one scene or beat.

Each row is a classical shot size (wide → close). Notes should say lens feeling, blocking, and what must match the design sheet — not generic “cinematic” adjectives. Generate or shoot to the grid, not to random prompts.`;

/** Legacy plain-text playbooks — structured steps use `structuredPlaybookForTemplate`. */
export function playbookForTemplate(templateId: string): string | null {
  switch (templateId) {
    case "classical-ai-short":
    case "ai-native-prep":
    case "visual-look-bible":
    case "visual-contact-sheet":
      return null;
    default:
      return null;
  }
}
