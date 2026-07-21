"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

/** Attach a document click listener on the next tick (avoids closing on the same click that opened). */
export function useOutsideClick(
  open: boolean,
  refs: RefObject<HTMLElement | null>[],
  onClose: () => void
) {
  const refsRef = useRef(refs);
  const onCloseRef = useRef(onClose);

  useLayoutEffect(() => {
    refsRef.current = refs;
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    function onClick(event: MouseEvent) {
      const target = event.target as Node;
      if (refsRef.current.some((ref) => ref.current?.contains(target))) return;
      onCloseRef.current();
    }

    const timer = window.setTimeout(() => {
      document.addEventListener("click", onClick);
    }, 0);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
}
