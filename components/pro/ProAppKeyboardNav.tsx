"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PRO_NAV_SEQUENCE_PREFIX,
  PRO_NAV_SEQUENCE_SHORTCUTS,
  resolveNavSequenceHref,
} from "@/lib/pro/nav-sequence-shortcuts";
import { isProOverlayBlockingKeyboard } from "@/lib/pro/is-pro-overlay-blocking-keyboard";

const SEQUENCE_MS = 2000;

type Props = {
  defaultWorkspaceHref: string | null;
  defaultExportsHref: string | null;
};

/** G+key → Dashboard, Workspace, Finish → Export, or Archives. */
export function ProAppKeyboardNav({ defaultWorkspaceHref, defaultExportsHref }: Props) {
  const router = useRouter();
  const [listening, setListening] = useState(false);

  useEffect(() => {
    let awaitingSecond = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function clearSequence() {
      awaitingSecond = false;
      setListening(false);
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function armSequence() {
      awaitingSecond = true;
      setListening(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(clearSequence, SEQUENCE_MS);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      if (isProOverlayBlockingKeyboard()) {
        clearSequence();
        return;
      }
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      if (key === PRO_NAV_SEQUENCE_PREFIX) {
        e.preventDefault();
        armSequence();
        return;
      }

      if (!awaitingSecond) return;

      const match = PRO_NAV_SEQUENCE_SHORTCUTS.find((item) => item.secondKey === key);
      if (match) {
        const href = resolveNavSequenceHref(match.id, {
          workspace: defaultWorkspaceHref ?? "/pro/app/workspace",
          exports: defaultExportsHref ?? "/pro/app/workspace",
        });
        if (href) {
          e.preventDefault();
          clearSequence();
          router.push(href);
          return;
        }
      }

      clearSequence();
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      awaitingSecond = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [router, defaultWorkspaceHref, defaultExportsHref]);

  if (!listening) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-1/2 z-[80] -translate-x-1/2 rounded-xl border border-white/15 bg-pro-elevated/95 px-3 py-2 text-xs text-pro-text shadow-lg ring-1 ring-white/[0.08]"
      role="status"
    >
      Go:{" "}
      {PRO_NAV_SEQUENCE_SHORTCUTS.map((item, i) => (
        <span key={item.id}>
          {i > 0 ? " · " : null}
          <span className="font-mono font-semibold">{item.secondKey.toUpperCase()}</span>{" "}
          {item.label}
        </span>
      ))}
    </div>
  );
}
