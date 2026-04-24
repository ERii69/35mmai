"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Applies `?step=N` from the URL once, then strips the query so the address bar stays clean.
 */
export function StepFromQuery({ setStep }: { setStep: (n: number) => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const raw = searchParams.get("step");
    if (raw === null || raw === "") return;
    const n = Number.parseInt(raw, 10);
    if (Number.isInteger(n) && n >= 0 && n <= 9) {
      setStep(n);
    }
    router.replace("/", { scroll: false });
  }, [searchParams, router, setStep]);

  return null;
}
