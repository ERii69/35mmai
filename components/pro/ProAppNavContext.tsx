"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type ProAppNavContextValue = {
  workflowLabel: string | null;
  setWorkflowLabel: Dispatch<SetStateAction<string | null>>;
};

const ProAppNavContext = createContext<ProAppNavContextValue | null>(null);

export function ProAppNavProvider({ children }: { children: ReactNode }) {
  const [workflowLabel, setWorkflowLabel] = useState<string | null>(null);
  const value = useMemo(
    () => ({ workflowLabel, setWorkflowLabel }),
    [workflowLabel]
  );
  return <ProAppNavContext.Provider value={value}>{children}</ProAppNavContext.Provider>;
}

export function useProAppNav(): ProAppNavContextValue {
  const ctx = useContext(ProAppNavContext);
  if (!ctx) {
    throw new Error("useProAppNav must be used within ProAppNavProvider");
  }
  return ctx;
}
