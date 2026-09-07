import Link from "next/link";
import { PRO_DATA_RETENTION_DAYS } from "@/lib/pro/membership-policy";

export function ProRetentionBanner({ deleteAtIso }: { deleteAtIso: string }) {
  const deleteLabel = new Date(deleteAtIso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div
      className="mb-6 rounded-2xl border border-pro-warning/40 bg-pro-warning/10 px-4 py-3 text-sm text-pro-warning"
      role="status"
    >
      <p className="font-medium text-pro-text">Your subscription has ended.</p>
      <p className="mt-1 leading-relaxed text-pro-text-secondary">
        You can export your projects until <span className="text-pro-text">{deleteLabel}</span> (
        {PRO_DATA_RETENTION_DAYS} days after access ended). After that we delete workspace data.
        Saving and new projects are paused.
      </p>
      <p className="mt-2 flex flex-wrap gap-3">
        <Link href="/account" className="font-medium text-pro-primary underline-offset-2 hover:underline">
          Resubscribe
        </Link>
        <Link href="/account" className="text-pro-text-secondary underline-offset-2 hover:underline">
          Account
        </Link>
      </p>
    </div>
  );
}
