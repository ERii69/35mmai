/** Display name for Pro header (profile metadata when available, else email local-part). */
export function headerDisplayName(
  email: string,
  metadata?: { full_name?: string; name?: string } | null
): string {
  const fromMeta = metadata?.full_name?.trim() || metadata?.name?.trim();
  if (fromMeta) return fromMeta;

  const local = email.includes("@") ? email.split("@")[0]! : email;
  return local
    .replace(/[._-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Two-letter avatar initials from display name or email. */
export function headerAvatarInitials(displayName: string, email: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0]!.length >= 2) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  const local = (email.includes("@") ? email.split("@")[0]! : email).replace(/[^a-zA-Z0-9]/g, "");
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return (local[0] ?? email[0] ?? "?").toUpperCase();
}

export function formatSubscriptionPeriodEnd(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function isActiveSubscriptionStatus(status: string | null): boolean {
  return status === "active" || status === "trialing";
}
