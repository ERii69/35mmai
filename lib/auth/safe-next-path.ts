/** Allow only same-origin relative redirects after auth. */
export function safeNextPath(next: string | null | undefined, fallback = "/account"): string {
  if (!next) return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}

export function loginHref(next: string | null | undefined, fallback = "/account"): string {
  const path = safeNextPath(next, fallback);
  if (path === "/account") return "/login";
  return `/login?${new URLSearchParams({ next: path }).toString()}`;
}
