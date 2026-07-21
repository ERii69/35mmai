/** Client-safe AI quota copy and error detection. */
export const AI_QUOTA_EXCEEDED_MESSAGE =
  "Daily AI limit reached — use quick prep";

export function isAiQuotaExceededError(message: string | null | undefined): boolean {
  if (!message) return false;
  return (
    message === AI_QUOTA_EXCEEDED_MESSAGE ||
    /Daily AI limit reached/i.test(message) ||
    /AI (daily|monthly) limit/i.test(message)
  );
}
