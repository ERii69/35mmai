import type { PrepRunSettings } from "@/lib/pro/types";

export function createDefaultPrepRunSettings(): PrepRunSettings {
  return {
    longScriptMode: false,
    analysisExcerpt: "",
  };
}

export function normalizePrepRunSettings(raw: unknown): PrepRunSettings {
  const base = createDefaultPrepRunSettings();
  if (typeof raw !== "object" || raw === null) return base;
  const o = raw as Record<string, unknown>;
  return {
    longScriptMode: Boolean(o.longScriptMode),
    analysisExcerpt: typeof o.analysisExcerpt === "string" ? o.analysisExcerpt : "",
  };
}
