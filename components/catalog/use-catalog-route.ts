"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Tool } from "@/app/data";
import {
  CATALOG_PATHS,
  CATALOG_STEP,
  catalogPathForStep,
  catalogToolPath,
  getToolBySlug,
  parseCatalogPathname,
} from "@/lib/catalog-routes";

function homeStepFromQuery(searchParams: {
  get: (key: string) => string | null;
}): number | null {
  const raw = searchParams.get("step");
  if (raw === "1") return CATALOG_STEP.role;
  if (raw === "2") return CATALOG_STEP.roleTools;
  return null;
}

function homeHrefForStep(n: number): string {
  if (n === CATALOG_STEP.role) return `${CATALOG_PATHS.home}?step=1`;
  if (n === CATALOG_STEP.roleTools) return `${CATALOG_PATHS.home}?step=2`;
  return CATALOG_PATHS.home;
}

export function useCatalogRoute(initialPath = "/") {
  const livePath = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  const pathname = ready && livePath ? livePath : initialPath;
  const parsed = parseCatalogPathname(pathname);
  const queryHomeStep = homeStepFromQuery(searchParams);
  const pathStep =
    pathname === "/" && queryHomeStep !== null
      ? queryHomeStep
      : parsed?.step ?? CATALOG_STEP.home;
  const pathSlug = parsed?.toolSlug ?? null;
  const pendingHomeStepRef = useRef<number | null>(null);

  const [step, setStepIndex] = useState<number>(pathStep);
  const [previousStep, setPreviousStep] = useState<number>(CATALOG_STEP.home);
  const [selectedTool, setSelectedToolState] = useState<Tool | null>(() =>
    pathSlug ? (getToolBySlug(pathSlug) ?? null) : null
  );

  useEffect(() => {
    const next = parseCatalogPathname(pathname);
    if (!next) return;
    const queryStep = homeStepFromQuery(searchParams);

    if (pendingHomeStepRef.current !== null && pathname === "/") {
      setStepIndex(pendingHomeStepRef.current);
      pendingHomeStepRef.current = null;
      setSelectedToolState(null);
      return;
    }

    setStepIndex((current) => {
      if (current === CATALOG_STEP.mobileMenu) {
        setPreviousStep(queryStep ?? next.step);
        return current;
      }
      if (pathname === "/" && queryStep !== null) {
        return queryStep;
      }
      return next.step;
    });

    if (next.toolSlug) {
      setSelectedToolState(getToolBySlug(next.toolSlug) ?? null);
    } else {
      setSelectedToolState(null);
    }
  }, [pathname, searchParams]);

  const setStep = useCallback(
    (n: number) => {
      if (n === CATALOG_STEP.mobileMenu) {
        setPreviousStep(step === CATALOG_STEP.mobileMenu ? previousStep : step);
        setStepIndex(CATALOG_STEP.mobileMenu);
        return;
      }

      if (n === CATALOG_STEP.role || n === CATALOG_STEP.roleTools) {
        const href = homeHrefForStep(n);
        pendingHomeStepRef.current = n;
        setStepIndex(n);
        router.push(href, { scroll: false });
        return;
      }

      pendingHomeStepRef.current = null;
      const href = catalogPathForStep(n);
      setStepIndex(n === CATALOG_STEP.roleTools ? CATALOG_STEP.tools : n);
      if (pathname !== href) {
        router.push(href);
      }
    },
    [pathname, previousStep, router, step]
  );

  const setSelectedTool = useCallback(
    (tool: Tool | null) => {
      if (!tool) {
        setSelectedToolState(null);
        if (pathSlug) router.push("/tools", { scroll: false });
        return;
      }
      setSelectedToolState(tool);
      const href = catalogToolPath(tool);
      if (pathname !== href) router.push(href, { scroll: false });
    },
    [pathname, pathSlug, router]
  );

  const closeMobileMenu = useCallback(() => {
    setStepIndex(previousStep);
  }, [previousStep]);

  return {
    step,
    setStep,
    selectedTool,
    setSelectedTool,
    previousStep,
    closeMobileMenu,
  };
}
