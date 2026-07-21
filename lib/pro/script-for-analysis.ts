import { compressScriptForContext } from "@/lib/pro/compress-script-for-context";
import type { PrepRunSettings, ScreenplayState } from "@/lib/pro/types";
import { SCREENPLAY_RAW_TEXT_MAX_CHARS } from "@/lib/pro/types";

/** Script text sent to the Script Analyzer (scope + compression). */
export function scriptTextForAnalysis(
  screenplay: ScreenplayState,
  settings: PrepRunSettings
): { text: string; modeLabel: string } {
  const excerpt = settings.analysisExcerpt.trim();
  if (excerpt.length > 0) {
    return {
      text: excerpt.slice(0, SCREENPLAY_RAW_TEXT_MAX_CHARS),
      modeLabel: "Selected excerpt only",
    };
  }

  const raw = screenplay.rawText.slice(0, SCREENPLAY_RAW_TEXT_MAX_CHARS);
  if (settings.longScriptMode) {
    return {
      text: compressScriptForContext(raw, 48_000),
      modeLabel: "Long script mode (compressed head/tail)",
    };
  }

  return {
    text: compressScriptForContext(raw, 24_000),
    modeLabel: raw.length > 24_000 ? "Standard mode (compressed)" : "Full script",
  };
}
