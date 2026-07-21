/**
 * Curated outbound links for templates (link-only — we do not rehost third-party PDFs/Notion).
 * Owner should verify URLs periodically; replace if a source moves or terms change.
 */

export type TemplateResource = {
  id: string;
  title: string;
  url: string;
  /** One line: why this link is useful; original wording. */
  description: string;
};

export type TemplateResourceGroup = {
  heading: string;
  resources: TemplateResource[];
};

/** Resources shown for classical / AI-native filmmaking templates. */
export const CLASSICAL_AI_RESOURCES: TemplateResourceGroup[] = [
  {
    heading: "Workflow & storytelling",
    resources: [
      {
        id: "longform-ai-short-thread",
        title: "Long-form AI short — production notes (external)",
        url: "https://x.com/PJaccetturo/status/2054567105924899147",
        description:
          "Third-party thread on a months-long short — useful context; we do not reproduce their wording or assets.",
      },
      {
        id: "script-storyboard-film",
        title: "Script → storyboard → picture (overview)",
        url: "https://mstudio.ai/blog/ai-filmmaking/script-to-storyboard-to-film-ai-workflow",
        description:
          "High-level phases for script-led visual planning before generation in outside apps.",
      },
    ],
  },
  {
    heading: "Classical production craft",
    resources: [
      {
        id: "look-bible-guide",
        title: "What is a look bible?",
        url: "https://beverlyboy.com/filmmaking/what-is-a-look-bible/",
        description: "Explains look bibles for live-action crews — same discipline applies to AI reference packs.",
      },
      {
        id: "production-bible-guide",
        title: "Production bible overview",
        url: "https://filmustage.com/blog/a-guide-to-the-production-bible/",
        description: "How a single production hub keeps departments aligned — maps to your Pro project.",
      },
      {
        id: "studiobinder-shot-list",
        title: "Film shot list templates (external)",
        url: "https://www.studiobinder.com/blog/shot-list-template-free-download/",
        description:
          "Industry shot-list examples — use alongside the Shots tab; download from their site, not ours.",
      },
    ],
  },
  {
    heading: "Visual planning",
    resources: [
      {
        id: "film-moodboards",
        title: "Film moodboards (tool)",
        url: "https://stencil.one/film-moodboards/",
        description: "Optional external moodboard workflow — link only, same as catalog tools.",
      },
    ],
  },
];

export function resourcesForTemplate(templateId: string): TemplateResourceGroup[] {
  if (
    templateId === "classical-ai-short" ||
    templateId === "visual-look-bible" ||
    templateId === "visual-contact-sheet" ||
    templateId === "ai-native-prep"
  ) {
    return CLASSICAL_AI_RESOURCES;
  }
  return [];
}
