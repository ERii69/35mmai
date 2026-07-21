"use client";

import { useEffect, useState } from "react";

/**
 * Tailwind `md` breakpoint (min-width: 768px).
 * `null` before mount — prefer mobile-first UI until known.
 */
export function useMdUp(): boolean | null {
  const [mdUp, setMdUp] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setMdUp(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return mdUp;
}
