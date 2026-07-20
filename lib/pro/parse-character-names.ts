import {
  isSceneHeadingLine,
  normalizeScreenplayText,
} from "@/lib/pro/parse-scene-headings";

const TRANSITION_RE =
  /^(FADE IN|FADE OUT|FADE TO BLACK|CUT TO|DISSOLVE TO|SMASH CUT|MONTAGE|TITLE CARD|END OF ACT)/i;

const TIME_WORD =
  /^(DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER|SAME|SUNSET|SUNRISE)$/i;

const SKIP_NAMES = new Set([
  "CONTINUED",
  "CONT'D",
  "CONT",
  "END",
  "THE END",
  "MOMENTS LATER",
  "LATER",
  "SAME",
  "DAY",
  "NIGHT",
  "INT",
  "EXT",
  "INTERIOR",
  "EXTERIOR",
  "SUPER",
  "TITLE",
  "V.O.",
  "VO",
  "O.S.",
  "O.C.",
  "SUBTITLE",
  "CHYRON",
  "CAPTION",
  "NARRATOR",
  "ANNOUNCER",
  "INTERCUT",
  "FLASHBACK",
  "MONTAGE",
  "SERIES OF SHOTS",
  "CAST",
  "CHARACTERS",
  "DRAMATIS PERSONAE",
]);

const LOCATION_CUE_RE =
  /^(?:DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON)\s+[-–—]\s+/i;

const LOCATION_SUFFIX_RE =
  /\s+[-–—]\s+(?:DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER|SAME)$/i;

const CAST_SECTION_RE =
  /^(?:CAST|CHARACTERS|DRAMATIS PERSONAE|CHARACTER LIST)\s*:?\s*$/i;

const INLINE_MODIFIER_RE =
  /\s*\((?:CONT['']?D|V\.?O\.?|O\.?S\.?|O\.?C\.?|PRE-LAP|FILTERED|SUBTITLE|O\.?S\.?\s+V\.?O\.?|\d+)\)\s*/gi;

export type ParsedCharacterFromScript = {
  name: string;
  notes: string;
  dialogueBlocks: number;
};

function stripCharacterExtensions(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function looksLikeLocationCue(line: string): boolean {
  const t = line.trim();
  if (LOCATION_CUE_RE.test(t)) return true;
  if (LOCATION_SUFFIX_RE.test(t) && !/^(INT|EXT|INTERIOR|EXTERIOR)/i.test(t)) return true;
  if (isSceneHeadingLine(t)) return true;
  return false;
}

function isDialogueLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (t.startsWith("(") && t.endsWith(")")) return false;
  if (/[a-z]/.test(t)) return true;
  if (/^[A-Z0-9 '.\-()]+$/.test(t)) return false;
  return true;
}

function formatCharacterName(raw: string): string {
  const base = stripCharacterExtensions(raw.replace(INLINE_MODIFIER_RE, " "));
  if (!base) return raw.trim();

  if (/^[A-Z][A-Z0-9 '.\-]*$/.test(base)) {
    return base
      .split(/\s+/)
      .map((part) => {
        if (part.length <= 2 && part.endsWith(".")) return part;
        return part.charAt(0) + part.slice(1).toLowerCase();
      })
      .join(" ");
  }

  return base;
}

/** Pull a Fountain / screenplay character cue from a line, if any. */
export function extractCharacterCue(line: string): string | null {
  let trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("(")) return null;
  if (looksLikeLocationCue(trimmed)) return null;
  if (TRANSITION_RE.test(trimmed)) return null;

  trimmed = trimmed.replace(INLINE_MODIFIER_RE, " ").trim();
  const base = stripCharacterExtensions(trimmed);
  if (!base || base.length < 2 || base.length > 42) return null;
  if (SKIP_NAMES.has(base.toUpperCase())) return null;
  if (TIME_WORD.test(base.toUpperCase())) return null;
  if (/\b(INT|EXT)\b/.test(base)) return null;
  if (/[.!?]/.test(base)) return null;

  const allCaps = /^[A-Z][A-Z0-9 '.\-]*(?:\s+[A-Z][A-Z0-9 '.\-]*){0,3}$/.test(base);
  const titleCase = /^[A-Z][A-Za-z0-9'.-]*(?:\s+[A-Z][A-Za-z0-9'.-]*){0,4}$/.test(base);
  if (!allCaps && !titleCase) return null;

  return formatCharacterName(base);
}

function hasDialogueWithin(lines: string[], index: number, window = 10): boolean {
  for (let j = index + 1; j < Math.min(index + 1 + window, lines.length); j++) {
    const next = lines[j]?.trim() ?? "";
    if (!next) continue;
    if (isSceneHeadingLine(next) || looksLikeLocationCue(next)) return false;
    if (next.startsWith("(") && next.endsWith(")")) continue;
    if (extractCharacterCue(next)) return false;
    if (isDialogueLine(next)) return true;
    if (/^[A-Z0-9 '.\-()]+$/.test(next) && !/[a-z]/.test(next)) return false;
    return true;
  }
  return false;
}

function parseFountainCharacter(line: string): string | null {
  const m = line.trim().match(/^@([A-Za-z][A-Za-z0-9 _'.-]{1,38})$/);
  return m?.[1]?.trim() ?? null;
}

function parseInterviewSubject(line: string): string | null {
  const trimmed = line.trim();
  const m = trimmed.match(/^INTERVIEW(?: WITH|:)\s+(.+)$/i);
  if (!m?.[1]) return null;
  const subject = m[1].replace(/\s*\([^)]*\)\s*/g, "").trim();
  return subject.length >= 2 ? subject : null;
}

function parseCastListLines(lines: string[], startIndex: number): string[] {
  const names: string[] = [];
  for (let i = startIndex + 1; i < Math.min(startIndex + 40, lines.length); i++) {
    const line = lines[i]?.trim() ?? "";
    if (!line) {
      if (names.length > 0) break;
      continue;
    }
    if (isSceneHeadingLine(line) || CAST_SECTION_RE.test(line)) break;
    if (extractCharacterCue(line)) break;

    const parts = line
      .split(/[,;|•·]/)
      .map((p) => p.replace(/\s*[-–—]\s*.+$/, "").trim())
      .filter(Boolean);
    for (const part of parts) {
      const cue = extractCharacterCue(part.toUpperCase()) ?? formatCharacterName(part);
      if (cue && cue.length >= 2) names.push(cue);
    }
  }
  return names;
}

function characterNotes(dialogueBlocks: number, source: string): string {
  if (dialogueBlocks >= 2) {
    return `${dialogueBlocks} dialogue blocks · ${source}`;
  }
  return source;
}

/** Extract speaking characters, cast lists, and interview subjects from screenplay text. */
export function parseCharactersFromScreenplay(text: string): ParsedCharacterFromScript[] {
  const lines = normalizeScreenplayText(text).split("\n");
  const byKey = new Map<string, ParsedCharacterFromScript>();

  function add(raw: string, source: string, dialogueBlocks = 0) {
    const name = formatCharacterName(raw);
    if (!name || name.length < 2) return;
    const key = name.toLowerCase();
    const existing = byKey.get(key);
    if (existing) {
      existing.dialogueBlocks += dialogueBlocks;
      if (existing.notes.startsWith("Cast list") && dialogueBlocks > 0) {
        existing.notes = characterNotes(existing.dialogueBlocks, "Speaking role from script");
      }
      return;
    }
    byKey.set(key, {
      name,
      notes: characterNotes(dialogueBlocks, source),
      dialogueBlocks,
    });
  }

  const cueFrequency = new Map<string, number>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() ?? "";
    if (!line) continue;

    if (CAST_SECTION_RE.test(line)) {
      for (const name of parseCastListLines(lines, i)) {
        add(name, "Listed in cast section");
      }
      continue;
    }

    const fountain = parseFountainCharacter(line);
    if (fountain) {
      add(fountain, "Fountain character tag", hasDialogueWithin(lines, i) ? 1 : 0);
      continue;
    }

    const interview = parseInterviewSubject(line);
    if (interview) {
      add(interview, "Interview subject");
      continue;
    }

    const cue = extractCharacterCue(line);
    if (!cue) continue;

    cueFrequency.set(cue, (cueFrequency.get(cue) ?? 0) + 1);

    if (hasDialogueWithin(lines, i)) {
      add(cue, "Speaking role from script", 1);
    }
  }

  for (const [name, count] of cueFrequency) {
    if (count >= 2 && !byKey.has(name.toLowerCase())) {
      add(name, `Character cue appears ${count} times`, count);
    }
  }

  return [...byKey.values()].sort((a, b) => {
    if (b.dialogueBlocks !== a.dialogueBlocks) return b.dialogueBlocks - a.dialogueBlocks;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

/** Name-only helper for callers that do not need notes. */
export function parseCharacterNamesFromScreenplay(text: string): string[] {
  return parseCharactersFromScreenplay(text).map((c) => c.name);
}
