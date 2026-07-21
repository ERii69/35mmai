"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PRO_NAV_SEQUENCE_PREFIX,
  PRO_NAV_SEQUENCE_SHORTCUTS,
  resolveNavSequenceHref,
} from "@/lib/pro/nav-sequence-shortcuts";
import { isProOverlayBlockingKeyboard } from "@/lib/pro/is-pro-overlay-blocking-keyboard";

const SEQUENCE_MS = 900;

type Props = {
  defaultWorkspaceHref: string | null;
  defaultExportsHref: string | null;
};

/** G then key → Dashboard, Workspace, Finish → Export, or Archives. */
export function ProAppKeyboardNav({ defaultWorkspaceHref, defaultExportsHref }: Props) {
  const router = useRouter();

  useEffect(() => {
    let awaitingSecond = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function clearSequence() {
      awaitingSecond = false;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented) return;
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
        if (awaitingSecond) return;
        awaitingSecond = true;
        timer = setTimeout(clearSequence, SEQUENCE_MS);
        return;
      }

      if (!awaitingSecond) return;

      const match = PRO_NAV_SEQUENCE_SHORTCUTS.find((item) => item.secondKey === key);
      if (match) {
        const href = resolveNavSequenceHref(match.id, {
          workspace: defaultWorkspaceHref,
          exports: defaultExportsHref,
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

    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearSequence();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [router, defaultWorkspaceHref, defaultExportsHref]);

  return null;
}
