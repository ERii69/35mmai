"use client";

import { useState, useTransition } from "react";
import { updateDisplayName } from "@/app/actions/account";
import { proAuth, proBtn } from "@/components/pro/ux/pro-surfaces";

type Props = {
  initialName: string;
};

export function AccountDisplayNameForm({ initialName }: Props) {
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await updateDisplayName(name);
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      setMessage("Saved.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <label htmlFor="display-name" className={proAuth.label}>
        Display name
      </label>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          id="display-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          autoComplete="name"
          className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-pro-muted px-3.5 py-2.5 text-sm text-pro-text outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50"
        />
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className={`${proBtn.primary} shrink-0 px-4 py-2.5 sm:w-auto`}
        >
          {pending ? "Saving…" : "Save name"}
        </button>
      </div>
      {message ? (
        <p
          className={`mt-2 text-xs ${message === "Saved." ? "text-pro-success" : "text-pro-warning"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
