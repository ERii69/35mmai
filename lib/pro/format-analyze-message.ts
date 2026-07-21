type AnalysisLike = {
  summary?: string;
  palette?: string[];
  mood?: string;
  lensAndFraming?: string;
  grainAndTexture?: string;
  source?: string;
  warning?: string;
};

/** User-facing copy — no Next.js / server internals. */
export function formatAnalyzeSuccessMessage(data: AnalysisLike, stillCount: number): string {
  const swatches = data.palette?.length ?? 0;
  const bits = [`${stillCount} photo${stillCount === 1 ? "" : "s"} analyzed`];
  if (swatches > 0) bits.push(`${swatches} palette swatch${swatches === 1 ? "" : "es"}`);
  if (data.mood?.trim()) bits.push("mood notes ready");
  if (data.lensAndFraming?.trim() || data.grainAndTexture?.trim()) bits.push("lens & grain inferred");
  bits.push("Build mood board below.");
  if (data.warning && !isTechnicalMessage(data.warning)) {
    return `${bits.join(" · ")} ${data.warning}`;
  }
  return bits.join(" · ");
}

export function formatAnalyzeFallbackMessage(stillCount: number, reason?: "timeout" | "offline"): string {
  if (reason === "timeout") {
    return `${stillCount} photo${stillCount === 1 ? "" : "s"} analyzed on your device (AI timed out). Build mood board below.`;
  }
  return `${stillCount} photo${stillCount === 1 ? "" : "s"} analyzed on your device. Build mood board below.`;
}

export function isTechnicalMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("body exceeded") ||
    lower.includes("bodysizelimit") ||
    lower.includes("nextjs.org") ||
    lower.includes("server action") ||
    lower.includes("middleware")
  );
}

export function sanitizeErrorMessage(message: string): string | null {
  if (!message.trim() || isTechnicalMessage(message)) return null;
  return message;
}
