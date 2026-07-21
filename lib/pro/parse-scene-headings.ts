import { newSceneRow } from "@/lib/pro/director-prep-prompt";
import { formatSceneSlugline } from "@/lib/pro/scene-heading-format";
import type { SceneDayNight, SceneIntExt, SceneRow } from "@/lib/pro/types";
import type { PrepRunSettings } from "@/lib/pro/types";
import { SCREENPLAY_RAW_TEXT_MAX_CHARS } from "@/lib/pro/types";

const UNICODE_SPACES = /[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g;
const ZERO_WIDTH = /[\u200B-\u200D\u2060]/g;

/** Strip markdown fences, HTML line breaks, and other paste artifacts. */
export function stripScreenplayPasteArtifacts(text: string): string {
  let s = text.replace(/^\uFEFF/, "");
  s = s.replace(/^```(?:fountain|screenplay|text|markdown)?\s*\n?/gim, "");
  s = s.replace(/\n?```\s*$/gim, "");
  s = s.replace(/<\/?(?:p|div|tr|td|li|h[1-6]|section|article|Paragraph|Text|Content|SceneHeading)[^>]*>/gi, "\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  return s;
}

/** Normalize pasted/uploaded screenplay text for heading detection. */
export function normalizeScreenplayText(text: string): string {
  return stripScreenplayPasteArtifacts(text)
    .replace(/\r\n?/g, "\n")
    .replace(UNICODE_SPACES, " ")
    .replace(ZERO_WIDTH, "")
    .normalize("NFKC");
}

/** Slugline intro tokens — EST requires a period so action prose ("est and closes…") is not matched. */
const SLUG_INTRO =
  "(?:INT\\/EXT|I\\/E|INTERIOR|EXTERIOR|EST\\.|INT|EXT)";

/** Insert line breaks before inline sluglines (common when pasting from PDF/Word). */
export function splitInlineSceneHeadings(text: string): string {
  let s = text.replace(
    new RegExp(`([^\\n])\\s+(${SLUG_INTRO}(?:[.:\\s\\-–—\\/]|$))`, "gi"),
    "$1\n$2"
  );
  // PDF exports sometimes glue sluglines without spaces: "...DAYINT. KITCHEN..."
  s = s.replace(
    new RegExp(
      `((?:DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|CONTINUOUS|LATER|SAME))(${SLUG_INTRO}(?:[.:\\s\\-–—\\/]|$))`,
      "gi"
    ),
    "$1\n$2"
  );
  return s;
}

/** Strip Fountain/markdown prefixes, HTML tags, and scene numbers before matching. */
export function prepareLineForHeadingCheck(line: string): string {
  let s = normalizeScreenplayText(line).trim();
  if (!s) return "";
  s = s.replace(/<[^>]+>/g, "").trim();
  s = s.replace(/^["'`\u2018\u2019\u201C\u201D]+|["'`\u2018\u2019\u201C\u201D]+$/g, "").trim();
  s = s.replace(/^[-–—•*>\u2022\s]+/, "").trim();
  s = s.replace(/^\*+|\*+$/g, "").replace(/^_+|_+$/g, "").trim();
  s = s.replace(/^[.#]+\s*/, "");
  s = s.replace(/^\(\d+[A-Za-z]?\)\s+/, "");
  s = s.replace(/^(?:SCENE\s+)?\d+[A-Za-z]?[.)]?\s*[-–—]?\s*/i, "");
  s = s.replace(/^\d+[A-Za-z]?[.)]?\s+/, "");
  return s.trim();
}

/** INT/EXT must precede INT in alternation so `INT/EXT.` lines match correctly. */
const SCENE_HEADING_PREFIX = new RegExp(`^${SLUG_INTRO}(?:[.:\\s\\-–—\\/]|$)`, "i");

const SCENE_HEADING_RE = new RegExp(`^${SLUG_INTRO}(?:[.:\\s\\-–—\\/]+|\\s)\\S.*$`, "i");

const ACTION_PROSE_MARKERS =
  /\b(and|or|the|her|his|their|she|he|they|closes|opens|runs|walks|looks|heaving|hands|eyes|fists|doesn't|shouldn't|rests)\b/i;

const SLUGLINE_TIME =
  /\b(DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER|SAME|MOMENTS LATER|SUNSET|SUNRISE)\b/i;

function headingCandidatesFromLine(line: string): string[] {
  const prepared = prepareLineForHeadingCheck(line);
  if (!prepared) return [];
  const candidates = [prepared];
  const embedded = prepared.match(
    new RegExp(`(${SLUG_INTRO}(?:[.:\\s\\-–—\\/]+|\\s)\\S.*)$`, "i")
  );
  if (embedded?.[1] && embedded[1] !== prepared) {
    candidates.push(prepareLineForHeadingCheck(embedded[1]));
  }
  return candidates;
}

/** Reject action prose and other false positives after regex match. */
export function isPlausibleSlugline(prepared: string): boolean {
  const p = prepareLineForHeadingCheck(prepared);
  if (!p || p.length < 8 || p.length > 120) return false;
  if (/^est\s/i.test(p) && !/^EST\./i.test(p)) return false;

  const prefixMatch = SCENE_HEADING_RE.test(p);
  const slugOnly = isSluglineOnlyHeading(p);
  if (!prefixMatch && !slugOnly) return false;

  if (slugOnly) return true;

  const slug = formatSceneSlugline(p);
  const afterPrefix = slug.replace(new RegExp(`^${SLUG_INTRO}[.:\\s\\-–—\\/]+`, "i"), "").trim();
  if (!afterPrefix || afterPrefix.length < 2) return false;

  const alphaWords = afterPrefix.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w));
  const lowercaseWords = alphaWords.filter(
    (w) => /^[a-z]/.test(w) && !SLUGLINE_TIME.test(w)
  );
  if (lowercaseWords.length >= 2) return false;
  if (alphaWords.length >= 4 && ACTION_PROSE_MARKERS.test(afterPrefix)) return false;

  return true;
}

export function isSceneHeadingLine(line: string): boolean {
  for (const prepared of headingCandidatesFromLine(line)) {
    if (!prepared) continue;
    if (isPlausibleSlugline(prepared)) return true;
  }
  return false;
}

function isSluglineOnlyHeading(prepared: string): boolean {
  if (prepared.length > 100 || prepared.length < 5) return false;
  if (SCENE_HEADING_PREFIX.test(prepared)) return false;
  const compact = prepared.replace(/\s+/g, " ");
  if (compact !== compact.toUpperCase()) return false;
  if (!SLUGLINE_TIME.test(compact)) return false;
  if (!/[-–—]/.test(compact)) return false;
  if (/^(FADE|CUT|DISSOLVE|MONTAGE|TITLE|CREDIT)/i.test(compact)) return false;
  return true;
}

function parseHeadingMeta(heading: string): Pick<SceneRow, "intExt" | "dayNight"> {
  const upper = heading.toUpperCase();
  let intExt: SceneIntExt = "";
  if (/^INT\/EXT|^I\/E|^INTERIOR\/EXTERIOR/.test(upper)) intExt = "INT/EXT";
  else if (/^INTERIOR|^INT\b/.test(upper)) intExt = "INT";
  else if (/^EXTERIOR|^EXT\b|^EST\./.test(upper)) intExt = "EXT";

  let dayNight: SceneDayNight = "";
  if (/\bNIGHT\b/.test(upper)) dayNight = "NIGHT";
  else if (/\bDAY\b/.test(upper)) dayNight = "DAY";
  else if (/\bDAWN\b/.test(upper)) dayNight = "DAWN";
  else if (/\bDUSK\b/.test(upper)) dayNight = "DUSK";

  return { intExt, dayNight };
}

function oneLineFromAction(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("(") && l === l.toUpperCase() === false);
  const line = lines.find((l) => l.length > 8) ?? lines[0] ?? "";
  return line.slice(0, 200);
}

function parseScenesLineByLine(lines: string[]): SceneRow[] {
  const scenes: SceneRow[] = [];
  let currentHeading: string | null = null;
  let actionLines: string[] = [];

  function flush() {
    if (!currentHeading || !isPlausibleSlugline(currentHeading)) {
      currentHeading = null;
      actionLines = [];
      return;
    }
    const n = scenes.length + 1;
    const meta = parseHeadingMeta(currentHeading);
    const row = newSceneRow(n);
    scenes.push({
      ...row,
      heading: formatSceneSlugline(currentHeading),
      oneLine: oneLineFromAction(actionLines.join("\n")),
      ...meta,
      status: "draft",
    });
    actionLines = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (isSceneHeadingLine(trimmed)) {
      flush();
      currentHeading =
        headingCandidatesFromLine(trimmed).find((c) => isPlausibleSlugline(c)) ??
        prepareLineForHeadingCheck(trimmed);
      continue;
    }
    if (currentHeading) actionLines.push(trimmed);
  }
  flush();

  return scenes;
}

/** Deterministic scene breakdown from Fountain-style headings (no API). */
export function parseScenesFromScreenplayText(text: string): SceneRow[] {
  const normalized = splitInlineSceneHeadings(
    normalizeScreenplayText(text).slice(0, SCREENPLAY_RAW_TEXT_MAX_CHARS)
  );
  const lines = normalized.split("\n");
  return parseScenesLineByLine(lines);
}

export function screenplayTextForLocalParse(rawText: string): string {
  return normalizeScreenplayText(rawText).slice(0, SCREENPLAY_RAW_TEXT_MAX_CHARS);
}

/** Count lines that look like sluglines (for UI feedback). */
export function countSceneHeadingLines(text: string): number {
  const normalized = splitInlineSceneHeadings(normalizeScreenplayText(text));
  let count = 0;
  for (const line of normalized.split("\n")) {
    if (isSceneHeadingLine(line.trim())) count += 1;
  }
  return count;
}

/** Same scene count logic as local prep (full script, then optional excerpt). */
export function countPrepScenesFromScreenplay(
  rawText: string,
  prepRunSettings?: Pick<PrepRunSettings, "analysisExcerpt">
): number {
  const fullScript = screenplayTextForLocalParse(rawText);
  let scenes = parseScenesFromScreenplayText(fullScript);
  const excerpt = prepRunSettings?.analysisExcerpt?.trim() ?? "";
  if (scenes.length === 0 && excerpt) {
    scenes = parseScenesFromScreenplayText(excerpt);
  }
  return scenes.length;
}

/** First non-matching sample lines to help users fix format (max 3). */
export function sampleUnrecognizedSluglineCandidates(text: string, limit = 3): string[] {
  const normalized = splitInlineSceneHeadings(normalizeScreenplayText(text));
  const candidates: string[] = [];
  for (const line of normalized.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 6 || trimmed.length > 90) continue;
    if (isSceneHeadingLine(trimmed)) continue;
    const upper = trimmed.toUpperCase();
    if (upper === trimmed && SLUGLINE_TIME.test(upper) && /[-–—]/.test(upper)) {
      candidates.push(trimmed.slice(0, 80));
    } else if (/^(INT|EXT|INTERIOR|EXTERIOR|INT\/EXT)/i.test(trimmed)) {
      candidates.push(trimmed.slice(0, 80));
    }
    if (candidates.length >= limit) break;
  }
  return candidates;
}
