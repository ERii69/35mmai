"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Info, Search, X } from "lucide-react";
import {
  useState,
  useEffect,
  useDeferredValue,
  useMemo,
  useRef,
  Suspense,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { AboutPageContent } from "@/components/about/AboutPageContent";
import { StepFromQuery } from "@/components/about/StepFromQuery";
import { ProComingSoonContent } from "@/components/pro/ProComingSoonContent";
import { BudgetSheetLinks } from "@/components/budget/BudgetSheetLinks";
import {
  allTools,
  BUDGET_DEFAULT_LOW_ROWS,
  BUDGET_DEFAULT_MICRO_ROWS,
  budgetLinesFromPreset,
  DIRECTORY_LAST_UPDATED_DISPLAY,
  getToolByRank,
  rehydrateKitEntry,
  rolesList,
  workflowStages,
  type Tool,
} from "./data";

// Helper functions for Role selection
const getRoleDescription = (role: string): string => {
  const descriptions: Record<string, string> = {
    "Director": "Lead the creative vision, guide performances, and make key artistic decisions.",
    "DOP (Director of Photography)": "Shape the visual language through lighting, camera movement, and composition.",
    "1st Assistant Director": "Manage the set, keep the schedule on track, and coordinate the crew.",
    "2nd Assistant Director": "Handle background talent, paperwork, and daily logistics.",
    "Gaffer (Lighting)": "Design and execute the lighting plan to achieve the desired mood.",
    "Key Grip": "Oversee rigging, camera movement, and grip equipment.",
    "Script Supervisor": "Maintain continuity, track takes, and ensure script accuracy.",
    "Location Manager": "Find, secure, and manage filming locations.",
    "Production Designer": "Create the overall visual world — sets, props, and atmosphere.",
    "Costume Designer": "Design and source costumes that reflect characters and story.",
    "Make-up Artist": "Create character looks and maintain continuity throughout the shoot.",
    "Producer / Line Producer": "Oversee budget, schedule, and overall production management.",
    "Production Coordinator": "Handle logistics, paperwork, and crew coordination.",
    "Lawyer / Clearance": "Manage legal contracts, clearances, and rights.",
    "Editor": "Assemble footage, shape pacing, and build the emotional story.",
    "Sound Designer": "Create immersive audio, foley, and soundscapes.",
  };
  return descriptions[role] || "Contribute your expertise to bring the project to life.";
};

const getMobileRoleSummary = (role: string): string => {
  const source = getRoleDescription(role);
  if (source.length <= 84) return source;
  return `${source.slice(0, 81).trimEnd()}...`;
};

const getUseCaseText = (tool: any, maxLength?: number): string => {
  const source = (tool.shortDescription || tool.helps || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!maxLength || source.length <= maxLength) return source;
  return `${source.slice(0, maxLength - 3).trimEnd()}...`;
};

const getMobileSummary = (tool: any): string => {
  const source = getUseCaseText(tool);
  if (source.length <= 96) return source;
  return `${source.slice(0, 93).trimEnd()}...`;
};

const getBudgetFitLabel = (budgetFit: string): string => {
  if (budgetFit === "indie") return "Indie / Low Budget";
  if (budgetFit === "hollywood") return "Aspirational / Higher Budget";
  return "Works for most budgets";
};

const cleanHowToStep = (step: string): string => {
  return step.replace(/^Step\s*\d+\s*:\s*/i, "").trim();
};

function directorySearchQueryForWorkflowStage(stageTitle: string): string {
  if (stageTitle.includes("Pre-Production")) return "Pre-Prod";
  if (stageTitle === "Production") return "Production";
  if (stageTitle.includes("Post-Production")) return "Post-Prod";
  return "";
}

function focusAdjacentListboxOption(
  listbox: HTMLElement | null,
  current: HTMLElement,
  delta: number
) {
  if (!listbox) return;
  const opts = Array.from(
    listbox.querySelectorAll<HTMLElement>('[role="option"]')
  );
  const i = opts.indexOf(current);
  if (i < 0) return;
  opts[i + delta]?.focus();
}

function focusListboxEdge(listbox: HTMLElement | null, end: "start" | "end") {
  if (!listbox) return;
  const opts = listbox.querySelectorAll<HTMLElement>('[role="option"]');
  if (!opts.length) return;
  (end === "start" ? opts[0] : opts[opts.length - 1])?.focus();
}

function focusListboxOptionByOffset(
  listbox: HTMLElement | null,
  current: HTMLElement,
  delta: number
) {
  if (!listbox) return;
  const opts = Array.from(
    listbox.querySelectorAll<HTMLElement>('[role="option"]')
  );
  const i = opts.indexOf(current);
  if (i < 0) return;
  const next = Math.max(0, Math.min(opts.length - 1, i + delta));
  opts[next]?.focus();
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [previousStep, setPreviousStep] = useState(0);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [budgetMenuOpen, setBudgetMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "info" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);
  // Workflow Builder States — hydrate from localStorage to avoid save-on-mount clobbering
  const [currentWorkflowStage, setCurrentWorkflowStage] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem("workflowStage");
    if (saved === null) return 0;
    const wf = parseInt(saved, 10);
    if (Number.isNaN(wf) || wf < 0 || wf >= workflowStages.length) return 0;
    return wf;
  });
  const [workflowStageMenuOpen, setWorkflowStageMenuOpen] = useState(false);
  const [myKit, setMyKit] = useState<any[]>([]);
  const [currency, setCurrency] = useState("USD");

  const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CAD", label: "CAD (C$)" },
  { value: "AUD", label: "AUD (A$)" },
  ] as const;
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const isToolListingStep = step === 2 || step === 9;
  const indexedTools = useMemo(
    () =>
      allTools.map((tool) => {
        const priceLower = tool.price.toLowerCase();
        return {
          tool,
          searchIndex: [
            tool.name,
            tool.helps,
            tool.category,
            tool.roles.join(" "),
            tool.examplePrompt || "",
          ]
            .join(" ")
            .toLowerCase(),
          roleSet: new Set(tool.roles),
          isBudgetFriendlyHint:
            priceLower.includes("free") || priceLower.includes("tier"),
          parsedPrice: parseFloat(tool.price.match(/\d+/)?.[0] || "999"),
        };
      }),
    []
  );

  const searchLower = useMemo(
    () => deferredSearchTerm.toLowerCase().trim(),
    [deferredSearchTerm]
  );

  const filteredTools: Tool[] = useMemo(() => {
    if (!isToolListingStep) return [];
    return indexedTools
      .filter(({ tool, searchIndex, roleSet, isBudgetFriendlyHint, parsedPrice }) => {
        const matchesSearch = !searchLower || searchIndex.includes(searchLower);

        let matchesBudget = true;
        if (selectedBudget === "indie") {
          matchesBudget =
            tool.budgetFit === "indie" ||
            tool.budgetFit === "both" ||
            isBudgetFriendlyHint ||
            parsedPrice <= 25;
        } else if (selectedBudget === "hollywood") {
          matchesBudget =
            tool.budgetFit === "hollywood" || tool.budgetFit === "both";
        }

        const matchesRole = !selectedRole || roleSet.has(selectedRole);

        return matchesSearch && matchesBudget && matchesRole;
      })
      .map(({ tool }) => tool)
      .sort((a, b) => a.rank - b.rank);
  }, [indexedTools, isToolListingStep, searchLower, selectedBudget, selectedRole]);

  const spotlightToolForRole = useMemo(() => {
    if (!selectedRole) return null;
    return allTools
      .filter((tool) => tool.roles.includes(selectedRole))
      .sort((a, b) => a.rank - b.rank)[0] || null;
  }, [selectedRole]);
// === CURRENCY HELPERS ===
  const currencySymbol = useMemo(() => {
    switch (currency) {
      case "EUR": return "€";
      case "GBP": return "£";
      case "CAD": return "C$";
      case "AUD": return "A$";
      default: return "$";
    }
  }, [currency]);

  const exchangeRate = useMemo(() => {
    const rates: Record<string, number> = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.78,
      CAD: 1.39,
      AUD: 1.52,
    };
    return rates[currency] || 1;
  }, [currency]);

 // Helper to get monthly price from tool object
const getMonthlyPrice = (tool: any): number => {
  if (tool.monthly) return tool.monthly;
  if (tool.price) {
    const match = tool.price.match(/\d+/);
    if (match) return parseFloat(match[0]);
  }
  return 15; // fallback
};

// Clean Add to My Kit function
const addToMyKit = (tool: any) => {
  if (myKit.some((t: any) => t.name === tool.name)) {
    setToast({ message: `${tool.name} is already in My Kit`, tone: "info" });
    return;
  }
  const toolWithPrice = {
    ...tool,
    catalogRank: tool.rank,
    monthly: getMonthlyPrice(tool),
    qty: 1,
  };
  setMyKit([...myKit, toolWithPrice]);
  setToast({ message: `Added ${tool.name} to Kit`, tone: "ok" });
};

  const bulkAddWorkflowToolsToKit = (ranks: number[]) => {
    const unique = [...new Set(ranks)];
    const toAdd: any[] = [];
    let already = 0;
    let missing = 0;
    for (const rank of unique) {
      const tool = getToolByRank(rank);
      if (!tool) {
        missing++;
        continue;
      }
      if (myKit.some((t: any) => t.name === tool.name)) {
        already++;
        continue;
      }
      if (toAdd.some((t) => t.name === tool.name)) continue;
      toAdd.push({
        ...tool,
        catalogRank: tool.rank,
        monthly: getMonthlyPrice(tool),
        qty: 1,
      });
    }
    if (toAdd.length > 0) {
      setMyKit([...myKit, ...toAdd]);
    }
    if (toAdd.length === 0 && already === 0 && missing === unique.length) {
      setToast({ message: "No matching tools to add", tone: "info" });
      return;
    }
    const parts: string[] = [];
    if (toAdd.length) parts.push(`${toAdd.length} added to My Kit`);
    if (already) parts.push(`${already} already in kit`);
    if (missing) parts.push(`${missing} invalid catalog rank`);
    setToast({ message: parts.join(" · "), tone: toAdd.length ? "ok" : "info" });
  };

  const goToDirectoryForCurrentWorkflowStage = () => {
    const title = workflowStages[currentWorkflowStage]?.title ?? "";
    const q = directorySearchQueryForWorkflowStage(title);
    setSelectedRole(null);
    setSelectedBudget(null);
    setSearchTerm(q);
    setWorkflowStageMenuOpen(false);
    setStep(9);
  };
   // Micro Budget Tools - with categories (default starter kit for low-budget filmmakers)
// Micro Budget Tools
  const [microTools, setMicroTools] = useState<any[]>(() =>
    budgetLinesFromPreset(BUDGET_DEFAULT_MICRO_ROWS)
  );

  const [lowTools, setLowTools] = useState<any[]>(() =>
    budgetLinesFromPreset(BUDGET_DEFAULT_LOW_ROWS)
  );

  const microTotal = useMemo(
    () =>
      microTools.reduce(
        (sum, t) => sum + (t.monthly || 0) * (t.qty || 1) * exchangeRate,
        0
      ),
    [microTools, exchangeRate]
  );
  const lowTotal = useMemo(
    () =>
      lowTools.reduce(
        (sum, t) => sum + (t.monthly || 0) * (t.qty || 1) * exchangeRate,
        0
      ),
    [lowTools, exchangeRate]
  );
  const kitTotal = useMemo(
    () =>
      myKit.reduce(
        (sum, tool) => sum + getMonthlyPrice(tool) * (tool.qty || 1) * exchangeRate,
        0
      ),
    [myKit, exchangeRate]
  );

  const [microTraditional, setMicroTraditional] = useState(4000);
  const [lowTraditional, setLowTraditional] = useState(25000);
  // Persist selectedRole and selectedBudget across refresh
useEffect(() => {
  const savedRole = localStorage.getItem("selectedRole");
  if (savedRole) setSelectedRole(savedRole);

  const savedBudget = localStorage.getItem("selectedBudget");
  if (savedBudget) setSelectedBudget(savedBudget);
}, []);

useEffect(() => {
  if (selectedRole) localStorage.setItem("selectedRole", selectedRole);
}, [selectedRole]);

useEffect(() => {
  if (selectedBudget) localStorage.setItem("selectedBudget", selectedBudget);
}, [selectedBudget]);
  // Auto-import from My Kit → Budget Templates when entering Step 5
useEffect(() => {
  if (step === 5 && myKit.length > 0) {
    const toolsToAdd = myKit.map((tool) => ({
      ...tool,
      qty: 1,
      monthly: parseFloat(tool.price?.match(/\d+/)?.[0] || "15") || 15,
      category: tool.category || "General",
    }));

    setMicroTools((prev) => {
      const next = [...prev];
      toolsToAdd.forEach((tool) => {
        if (!next.some((t) => t.name === tool.name)) {
          next.push(tool);
        }
      });
      return next;
    });

    setLowTools((prev) => {
      const next = [...prev];
      toolsToAdd.forEach((tool) => {
        if (!next.some((t) => t.name === tool.name)) {
          next.push(tool);
        }
      });
      return next;
    });
  }
}, [step, myKit]);

// Load My Kit and last step from localStorage when the app starts
useEffect(() => {
  // Load My Kit
  const savedKit = localStorage.getItem("myKit");
  if (savedKit) {
    try {
      const parsed = JSON.parse(savedKit);
      if (Array.isArray(parsed)) {
        setMyKit(parsed.map((item) => rehydrateKitEntry(item) as any));
      }
    } catch {
      console.error("Failed to load My Kit from localStorage");
    }
  }

  // Load last visited step
  const savedStep = localStorage.getItem("lastStep");
  if (savedStep) {
    const stepNumber = parseInt(savedStep);
    if (!isNaN(stepNumber) && stepNumber >= 0 && stepNumber <= 9) {
      setStep(stepNumber);
    }
  }

}, []); // Runs only once when component mounts

// Save My Kit to localStorage whenever it changes
useEffect(() => {
  localStorage.setItem("myKit", JSON.stringify(myKit));
}, [myKit]);

// Save current step whenever it changes
useEffect(() => {
  localStorage.setItem("lastStep", step.toString());
}, [step]);

  const roleFilterRootRef = useRef<HTMLDivElement>(null);
  const budgetFilterRootRef = useRef<HTMLDivElement>(null);
  const currencyFilterRootRef = useRef<HTMLDivElement>(null);
  const roleListboxRef = useRef<HTMLDivElement>(null);
  const budgetListboxRef = useRef<HTMLDivElement>(null);
  const roleTriggerRef = useRef<HTMLButtonElement>(null);
  const budgetTriggerRef = useRef<HTMLButtonElement>(null);
  const currencyTriggerRef = useRef<HTMLButtonElement>(null);
  const workflowStageFilterRootRef = useRef<HTMLDivElement>(null);
  const workflowStageTriggerRef = useRef<HTMLButtonElement>(null);
  const workflowStagePanelRef = useRef<HTMLDivElement>(null);
  const workflowKeyboardRootRef = useRef<HTMLDivElement>(null);
  const toolModalRef = useRef<HTMLDivElement>(null);
  const toolModalCloseButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!roleMenuOpen && !budgetMenuOpen && !currencyMenuOpen && !workflowStageMenuOpen)
      return;
    const onPointerDown = (e: PointerEvent) => {
      const n = e.target as Node;
      if (roleFilterRootRef.current?.contains(n)) return;
      if (budgetFilterRootRef.current?.contains(n)) return;
      if (currencyFilterRootRef.current?.contains(n)) return;
      if (workflowStageFilterRootRef.current?.contains(n)) return;
      setRoleMenuOpen(false);
      setBudgetMenuOpen(false);
      setCurrencyMenuOpen(false);
      setWorkflowStageMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [roleMenuOpen, budgetMenuOpen, currencyMenuOpen, workflowStageMenuOpen]);

  useEffect(() => {
    if (!roleMenuOpen && !budgetMenuOpen && !currencyMenuOpen && !workflowStageMenuOpen)
      return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      const hadRole = roleMenuOpen;
      const hadBudget = budgetMenuOpen;
      const hadCurrency = currencyMenuOpen;
      const hadWorkflowStage = workflowStageMenuOpen;
      setRoleMenuOpen(false);
      setBudgetMenuOpen(false);
      setCurrencyMenuOpen(false);
      setWorkflowStageMenuOpen(false);
      window.requestAnimationFrame(() => {
        if (hadRole) roleTriggerRef.current?.focus();
        else if (hadBudget) budgetTriggerRef.current?.focus();
        else if (hadCurrency) currencyTriggerRef.current?.focus();
        else if (hadWorkflowStage) workflowStageTriggerRef.current?.focus();
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [roleMenuOpen, budgetMenuOpen, currencyMenuOpen, workflowStageMenuOpen]);

  useEffect(() => {
    if (step !== 5) setCurrencyMenuOpen(false);
    if (step !== 4) setWorkflowStageMenuOpen(false);
  }, [step]);

  useEffect(() => {
    localStorage.setItem("workflowStage", String(currentWorkflowStage));
  }, [currentWorkflowStage]);

  useEffect(() => {
    if (step !== 4) return;
    const id = window.requestAnimationFrame(() => {
      workflowStagePanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [step, currentWorkflowStage]);

  useEffect(() => {
    if (step !== 4) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT"))
        return;
      const root = workflowKeyboardRootRef.current;
      if (!root) return;
      const active = document.activeElement as Node | null;
      if (active && active !== document.body && !root.contains(active)) return;
      e.preventDefault();
      if (e.key === "ArrowLeft") {
        setCurrentWorkflowStage((s) => Math.max(0, s - 1));
      } else {
        setCurrentWorkflowStage((s) =>
          Math.min(workflowStages.length - 1, s + 1)
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  useEffect(() => {
    if (!roleMenuOpen) return;
    const id = window.requestAnimationFrame(() => {
      const list = roleListboxRef.current;
      if (!list) return;
      const opts = list.querySelectorAll<HTMLElement>('[role="option"]');
      if (!opts.length) return;
      const roleIdx = selectedRole ? rolesList.indexOf(selectedRole) : -1;
      const idx =
        selectedRole === null || roleIdx < 0
          ? 0
          : Math.min(roleIdx + 1, opts.length - 1);
      opts[idx]?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [roleMenuOpen, selectedRole]);

  useEffect(() => {
    if (!budgetMenuOpen) return;
    const id = window.requestAnimationFrame(() => {
      const list = budgetListboxRef.current;
      if (!list) return;
      const opts = list.querySelectorAll<HTMLElement>('[role="option"]');
      if (!opts.length) return;
      let idx = 0;
      if (selectedBudget === "indie") idx = 1;
      else if (selectedBudget === "hollywood") idx = 2;
      opts[idx]?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [budgetMenuOpen, selectedBudget]);

  useEffect(() => {
    if (!selectedTool) {
      lastFocusedElementRef.current?.focus();
      lastFocusedElementRef.current = null;
      return;
    }
    lastFocusedElementRef.current = document.activeElement as HTMLElement | null;
    const id = window.requestAnimationFrame(() => {
      toolModalCloseButtonRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [selectedTool]);

  useEffect(() => {
    if (!selectedTool) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedTool(null);
        return;
      }
      if (e.key !== "Tab") return;
      const modal = toolModalRef.current;
      if (!modal) return;
      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedTool]);

  const onRoleOptionKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    const { key } = e;
    if (key === "ArrowDown") {
      e.preventDefault();
      focusAdjacentListboxOption(roleListboxRef.current, e.currentTarget, 1);
    } else if (key === "ArrowUp") {
      e.preventDefault();
      focusAdjacentListboxOption(roleListboxRef.current, e.currentTarget, -1);
    } else if (key === "PageDown") {
      e.preventDefault();
      focusListboxOptionByOffset(roleListboxRef.current, e.currentTarget, 5);
    } else if (key === "PageUp") {
      e.preventDefault();
      focusListboxOptionByOffset(roleListboxRef.current, e.currentTarget, -5);
    } else if (key === "Home") {
      e.preventDefault();
      focusListboxEdge(roleListboxRef.current, "start");
    } else if (key === "End") {
      e.preventDefault();
      focusListboxEdge(roleListboxRef.current, "end");
    }
  };

  const onBudgetOptionKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    const { key } = e;
    if (key === "ArrowDown") {
      e.preventDefault();
      focusAdjacentListboxOption(budgetListboxRef.current, e.currentTarget, 1);
    } else if (key === "ArrowUp") {
      e.preventDefault();
      focusAdjacentListboxOption(budgetListboxRef.current, e.currentTarget, -1);
    } else if (key === "PageDown") {
      e.preventDefault();
      focusListboxOptionByOffset(budgetListboxRef.current, e.currentTarget, 2);
    } else if (key === "PageUp") {
      e.preventDefault();
      focusListboxOptionByOffset(budgetListboxRef.current, e.currentTarget, -2);
    } else if (key === "Home") {
      e.preventDefault();
      focusListboxEdge(budgetListboxRef.current, "start");
    } else if (key === "End") {
      e.preventDefault();
      focusListboxEdge(budgetListboxRef.current, "end");
    }
  };

  const selectRoleFilterOption = (role: string | null) => {
    setSelectedRole(role);
    setRoleMenuOpen(false);
    window.requestAnimationFrame(() => roleTriggerRef.current?.focus());
  };

  const selectBudgetFilterOption = (budget: "indie" | "hollywood" | null) => {
    setSelectedBudget(budget);
    setBudgetMenuOpen(false);
    window.requestAnimationFrame(() => budgetTriggerRef.current?.focus());
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleStartOver = () => {
    setStep(0);
    setSelectedBudget(null);
    setSelectedRole(null);
    setSearchTerm("");
    setSelectedTool(null);
    setCurrentWorkflowStage(0);
    localStorage.setItem("workflowStage", "0");
  };

  const openMobileMenu = () => {
    setPreviousStep(step === 8 ? 0 : step);
    setStep(8);
  };

  const closeMobileMenu = () => {
    setStep(previousStep);
  };

  const goLandingBudgetPath = (budget: "indie" | "hollywood") => {
    setSelectedBudget(budget);
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches;
    setStep(isMobile ? 9 : 1);
  };

   return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5] font-sans relative overflow-x-clip">

      <Suspense fallback={null}>
        <StepFromQuery setStep={setStep} />
      </Suspense>

      {/* Film Grain - Full screen */}
      <div className="film-grain absolute inset-0 opacity-[0.04] pointer-events-none" />

      {/* GLOBAL WRAPPER — pt reserves space for fixed header (sticky breaks under overflow-x on ancestors) */}
      <div className="relative z-10 flex min-h-screen flex-col pt-[calc(4.25rem+env(safe-area-inset-top))] md:pt-[calc(5.25rem+env(safe-area-inset-top))]">

{/* GLOBAL NAVIGATION + LOGO */}
<header className="fixed inset-x-0 top-0 z-40 border-b border-[#333] bg-[#0f0f0f]/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
  <div className="flex items-center justify-between gap-3 px-4 py-2 sm:px-6 md:py-2.5">

  {/* Left: Logo + BETA (single row — shorter on mobile) */}
  <div className="flex min-w-0 items-center gap-2 md:gap-2.5">
    <button
      type="button"
      className="cursor-pointer shrink-0 text-2xl font-extrabold tracking-widest text-white md:text-4xl"
      onClick={() => setStep(0)}
      aria-label="Go to home"
    >
      <span className="text-[#e11d48]">35</span>mm<span className="text-[#e11d48]">AI</span>
    </button>
    <span className="shrink-0 rounded-full border border-amber-400/50 bg-amber-500 px-2 py-0.5 text-[10px] font-bold leading-none tracking-widest text-black md:px-2.5 md:py-1 md:text-xs">
      BETA
    </span>
  </div>

  {/* Centered Navigation */}
  <nav className="hidden md:flex items-center gap-8 text-sm mx-auto" aria-label="Primary">
    <Button 
      variant="ghost" 
      onClick={() => setStep(0)}
      aria-current={step === 0 ? "page" : undefined}
      className="flex items-center gap-1.5 text-[#d1d5db] hover:text-[#e11d48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
    >
      Home
    </Button>
    <Button 
      variant="ghost" 
      onClick={() => setStep(9)}
      aria-current={step === 9 ? "page" : undefined}
      className="flex items-center gap-1.5 text-[#d1d5db] hover:text-[#e11d48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
    >
      🛠️ All Tools
    </Button>
    <Button 
      variant="ghost" 
      onClick={() => setStep(step === 4 ? 0 : 4)}
      aria-current={step === 4 ? "page" : undefined}
      className="flex items-center gap-1.5 text-[#d1d5db] hover:text-[#e11d48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
    >
      📋 Workflows
    </Button>
    <Button 
      variant="ghost" 
      onClick={() => setStep(step === 5 ? 0 : 5)}
      aria-current={step === 5 ? "page" : undefined}
      className="flex items-center gap-1.5 text-[#d1d5db] hover:text-[#e11d48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
    >
      💰 Budget Templates
    </Button>
    <Button 
      variant="ghost" 
      onClick={() => setStep(step === 7 ? 0 : 7)}
      aria-current={step === 7 ? "page" : undefined}
      className="flex items-center gap-1.5 text-[#d1d5db] hover:text-[#e11d48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
    >
      🧰 My Kit
    </Button>
    <Button 
      variant="ghost" 
      onClick={() => setStep(step === 6 ? 0 : 6)}
      aria-current={step === 6 ? "page" : undefined}
      className="flex items-center gap-1.5 border border-[#e11d48]/30 text-[#d1d5db] hover:border-[#e11d48] hover:text-[#e11d48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
    >
      ✨ 35mmAI Pro
    </Button>
    <Button 
      variant="ghost" 
      onClick={() => setStep(step === 3 ? 0 : 3)}
      aria-current={step === 3 ? "page" : undefined}
      className="flex items-center gap-1.5 text-[#d1d5db] hover:text-[#e11d48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
    >
      <Info className="h-4 w-4" /> About
    </Button>
  </nav>

  {/* Mobile: logo + sticky bar — hamburger only (no extra top buttons) */}
  <div className="flex shrink-0 items-center md:hidden">
    <button
      type="button"
      onClick={openMobileMenu}
      className="p-1.5 text-2xl leading-none text-white"
      aria-label="Open menu"
    >
      ☰
    </button>
  </div>
  </div>
</header>
{/* Floating My Kit Sidebar (hidden on My Kit page — full list is already on screen) */}
        {myKit.length > 0 && step !== 7 && (
          <div className="hidden md:block fixed right-6 top-[calc(4.75rem+env(safe-area-inset-top))] z-50 max-h-[70vh] w-80 overflow-auto rounded-3xl border border-[#333] bg-[#111] p-6 shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium text-lg">My Kit ({myKit.length})</span>
              <button 
                onClick={() => setMyKit([])}
                className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Tool List */}
            <div className="space-y-3">
              {myKit.map((tool, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center bg-[#1a1a1a] p-4 rounded-2xl group"
                >
                  <div className="flex-1 pr-4">
                    <div className="font-medium text-base">{tool.name}</div>
                    <div className="text-xs text-[#888] line-clamp-1">{tool.helps}</div>
                  </div>
                  <button 
                    onClick={() => setMyKit(myKit.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-600 opacity-70 hover:opacity-100 transition-all p-1"
                  >
                    <X size={22} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Main Content Area — flex column + min-h-0 so My Kit (empty) can flex between header and footer */}
        <div
          className={`flex min-h-0 flex-1 flex-col px-4 sm:px-6 ${step === 0 ? "py-2 md:py-8" : "py-8"} ${[2, 3, 5, 7, 9].includes(step) ? "pb-28 md:pb-8" : ""}`}
        >

{/* === STEP 0: LANDING PAGE - FINAL FIXED VERSION === */}
{step === 0 && (
  <div className="min-h-0 bg-[#0f0f0f] text-[#f5f5f5] relative overflow-hidden flex flex-col">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.03)_0%,transparent_70%)] pointer-events-none" />

    <div className="flex-1 flex flex-col justify-between pt-3 md:pt-12 px-4 md:px-6">

      {/* Headline - ABOVE on Desktop, BELOW on Mobile */}
      <div className="text-center mb-4 md:mb-16 order-1 md:order-1 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-7xl font-bold tracking-tighter leading-none mb-3 md:mb-6">
          Cut costs.<br className="md:hidden" /> Elevate your film.
        </h1>
        <p className="text-sm md:text-xl text-[#d1d5db]">
          AI tools that help indie filmmakers save time and cut costs from script to screen.
        </p>
      </div>

      {/* Budget Cards */}
      <div className="grid md:grid-cols-2 gap-3 md:gap-8 order-2 md:order-2 max-w-5xl mx-auto w-full">
        
        {/* Indie / Low Budget */}
        <button
          type="button"
          onClick={() => goLandingBudgetPath("indie")}
          className="group rounded-3xl border border-[#333] bg-[#111] p-4 md:p-8 text-left transition-all hover:border-emerald-500"
        >
          <div className="text-emerald-400 text-xs font-medium tracking-wider mb-3">INDIE / LOW BUDGET</div>
          <h3 className="text-lg md:text-3xl font-bold mb-2 md:mb-4">Solo / Short Film</h3>
          <p className="text-[#888] text-xs md:text-base mb-3 md:mb-8">Under ~$5,000 • Fast, free & cheap tools</p>
          <span className="block w-full rounded-2xl bg-emerald-600 py-2.5 md:py-4 text-center text-sm md:text-base font-medium transition-colors group-hover:bg-emerald-700">
            Start Micro Budget Path
          </span>
        </button>

        {/* Hollywood / Aspirational */}
        <button
          type="button"
          onClick={() => goLandingBudgetPath("hollywood")}
          className="group rounded-3xl border border-[#333] bg-[#111] p-4 md:p-8 text-left transition-all hover:border-yellow-500"
        >
          <div className="text-yellow-400 text-xs font-medium tracking-wider mb-3">HOLLYWOOD-STYLE / ASPIRATIONAL</div>
          <h3 className="text-lg md:text-3xl font-bold mb-2 md:mb-4">Indie Feature</h3>
          <p className="text-[#888] text-xs md:text-base mb-3 md:mb-8">~$5K – $30K • Cinematic polish on any budget</p>
          <span className="block w-full rounded-2xl bg-yellow-600 py-2.5 md:py-4 text-center text-sm md:text-base font-medium transition-colors group-hover:bg-yellow-700">
            Start Aspirational Path
          </span>
        </button>
      </div>

    </div>
  </div>
)}
{/* === STEP 9: ALL TOOLS PAGE === */}
{step === 9 && (
  <div className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5] py-8 md:py-10 px-4 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.03)_0%,transparent_70%)] pointer-events-none" />

    <div className="max-w-6xl mx-auto relative z-10">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">All Tools</h1>
        <p className="text-[#d1d5db] text-base md:text-xl mb-2">
          Browse all <span className="font-semibold text-white">{allTools.length}</span> filmmaking AI tools
        </p>
        <p className="text-sm text-[#888]">
          Last updated: {DIRECTORY_LAST_UPDATED_DISPLAY}
        </p>
      </div>

      {/* Filters + Search */}
      <div className="sticky top-[calc(4.25rem+env(safe-area-inset-top))] z-30 -mx-2 mb-6 rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f]/95 px-2 py-3 backdrop-blur-sm md:static md:mx-0 md:mb-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none md:top-auto">
      <div className="flex flex-col md:flex-row gap-4 mb-4 md:mb-6 max-w-md mx-auto">
        <div ref={roleFilterRootRef} className="relative flex-1">
          <button
            ref={roleTriggerRef}
            id="filter-role-trigger"
            type="button"
            aria-haspopup="listbox"
            aria-expanded={roleMenuOpen}
            aria-controls="filter-role-listbox"
            aria-label="Filter by production role"
            onClick={() => {
              setRoleMenuOpen((open) => !open);
              setBudgetMenuOpen(false);
            }}
            className="w-full bg-[#111] border border-[#333] text-white px-4 py-3 rounded-2xl text-left focus:outline-none focus:border-[#e11d48] flex items-center justify-between"
          >
            <span>{selectedRole || "All Roles"}</span>
            <span className="text-[#888]" aria-hidden>
              {roleMenuOpen ? "▲" : "▼"}
            </span>
          </button>
          {roleMenuOpen && (
            <div
              ref={roleListboxRef}
              id="filter-role-listbox"
              role="listbox"
              aria-labelledby="filter-role-trigger"
              className="absolute top-full mt-2 left-0 right-0 z-30 bg-[#111] border border-[#333] rounded-2xl shadow-2xl max-h-64 overflow-y-auto"
            >
              <button
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={selectedRole === null}
                onKeyDown={onRoleOptionKeyDown}
                onClick={() => selectRoleFilterOption(null)}
                className="w-full text-left px-4 py-3 text-[#d1d5db] hover:bg-[#1a1a1a] transition-colors"
              >
                All Roles
              </button>
              {rolesList.map((role) => (
                <button
                  key={role}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={selectedRole === role}
                  onKeyDown={onRoleOptionKeyDown}
                  onClick={() => selectRoleFilterOption(role)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    selectedRole === role
                      ? "text-[#e11d48] bg-[#1a1a1a]"
                      : "text-[#d1d5db] hover:bg-[#1a1a1a]"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={budgetFilterRootRef} className="relative flex-1">
          <button
            ref={budgetTriggerRef}
            id="filter-budget-trigger"
            type="button"
            aria-haspopup="listbox"
            aria-expanded={budgetMenuOpen}
            aria-controls="filter-budget-listbox"
            aria-label="Filter by budget tier"
            onClick={() => {
              setBudgetMenuOpen((open) => !open);
              setRoleMenuOpen(false);
            }}
            className="w-full bg-[#111] border border-[#333] text-white px-4 py-3 rounded-2xl text-left focus:outline-none focus:border-[#e11d48] flex items-center justify-between"
          >
            <span>
              {selectedBudget === "indie"
                ? "Indie / Low Budget"
                : selectedBudget === "hollywood"
                  ? "Hollywood-Style / Aspirational"
                  : "All Budgets"}
            </span>
            <span className="text-[#888]" aria-hidden>
              {budgetMenuOpen ? "▲" : "▼"}
            </span>
          </button>
          {budgetMenuOpen && (
            <div
              ref={budgetListboxRef}
              id="filter-budget-listbox"
              role="listbox"
              aria-labelledby="filter-budget-trigger"
              className="absolute top-full mt-2 left-0 right-0 z-30 bg-[#111] border border-[#333] rounded-2xl shadow-2xl overflow-hidden"
            >
              <button
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={selectedBudget === null}
                onKeyDown={onBudgetOptionKeyDown}
                onClick={() => selectBudgetFilterOption(null)}
                className="w-full text-left px-4 py-3 text-[#d1d5db] hover:bg-[#1a1a1a] transition-colors"
              >
                All Budgets
              </button>
              <button
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={selectedBudget === "indie"}
                onKeyDown={onBudgetOptionKeyDown}
                onClick={() => selectBudgetFilterOption("indie")}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  selectedBudget === "indie"
                    ? "text-[#e11d48] bg-[#1a1a1a]"
                    : "text-[#d1d5db] hover:bg-[#1a1a1a]"
                }`}
              >
                Indie / Low Budget
              </button>
              <button
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={selectedBudget === "hollywood"}
                onKeyDown={onBudgetOptionKeyDown}
                onClick={() => selectBudgetFilterOption("hollywood")}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  selectedBudget === "hollywood"
                    ? "text-[#e11d48] bg-[#1a1a1a]"
                    : "text-[#d1d5db] hover:bg-[#1a1a1a]"
                }`}
              >
                Hollywood-Style / Aspirational
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="relative mx-auto mb-3 max-w-2xl">
        <Search className="absolute left-4 top-3.5 text-[#888]" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by tool, role, or use case..."
          className="w-full rounded-2xl border border-[#333] bg-[#111] py-3.5 pl-12 pr-11 text-white placeholder-[#666] focus:border-[#e11d48] focus:outline-none"
        />
        {searchTerm.trim() && (
          <button
            type="button"
            aria-label="Clear tool search"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-2.5 rounded-lg p-1.5 text-[#888] transition-colors hover:text-[#e11d48]"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <p className="text-center text-xs text-[#888] md:text-sm">
        Showing <span className="font-medium text-white">{filteredTools.length}</span> of {allTools.length} tools
      </p>
      </div>

      {(selectedRole || selectedBudget || searchTerm.trim()) && (
        <div className="max-w-2xl mx-auto mb-8 flex flex-wrap items-center justify-center gap-2 px-1">
          {selectedRole && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#333] bg-[#111] px-3 py-1.5 text-xs text-[#d1d5db]">
              Role: <span className="font-medium text-white">{selectedRole}</span>
              <button
                type="button"
                aria-label="Remove role filter"
                onClick={() => setSelectedRole(null)}
                className="text-[#888] hover:text-[#e11d48]"
              >
                ×
              </button>
            </span>
          )}
          {selectedBudget && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#333] bg-[#111] px-3 py-1.5 text-xs text-[#d1d5db]">
              Budget:{" "}
              <span className="font-medium text-white">
                {selectedBudget === "indie" ? "Indie / Low" : "Aspirational"}
              </span>
              <button
                type="button"
                aria-label="Remove budget filter"
                onClick={() => setSelectedBudget(null)}
                className="text-[#888] hover:text-[#e11d48]"
              >
                ×
              </button>
            </span>
          )}
          {searchTerm.trim() && (
            <span className="inline-flex max-w-[min(100%,18rem)] items-center gap-2 rounded-full border border-[#333] bg-[#111] px-3 py-1.5 text-xs text-[#d1d5db]">
              Search:{" "}
              <span className="truncate font-medium text-white">{searchTerm.trim()}</span>
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
                className="text-[#888] hover:text-[#e11d48]"
              >
                ×
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setSelectedRole(null);
              setSelectedBudget(null);
              setSearchTerm("");
              setRoleMenuOpen(false);
              setBudgetMenuOpen(false);
            }}
            className="rounded-full border border-[#e11d48]/40 bg-black px-3 py-1.5 text-xs font-medium text-[#e11d48] hover:bg-[#1a1a1a]"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Spotlight - Fixed + Matching Step 2 Style */}
      {selectedRole && spotlightToolForRole && (
          <div className="mb-10 md:mb-12 bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-[#e11d48]/30 rounded-3xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-1 bg-[#e11d48] text-white text-xs font-medium rounded-full">SPOTLIGHT</div>
              <div className="text-[#e11d48] text-sm">Top pick for {selectedRole}</div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-semibold mb-3">{spotlightToolForRole.name}</h3>
                <p className="text-[#d1d5db] mb-6">{getUseCaseText(spotlightToolForRole, 180)}</p>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto min-w-0 md:min-w-[200px]">
                <button 
                  onClick={() => setSelectedTool(spotlightToolForRole)}
                  className="bg-black border border-[#e11d48] text-[#e11d48] hover:bg-[#1a1a1a] px-5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap w-full md:w-auto transition-colors"
                >
                  Tool Details
                </button>
                <button 
                  onClick={() => addToMyKit(spotlightToolForRole)}
                  className="bg-black border border-[#e11d48] text-[#e11d48] hover:bg-[#1a1a1a] px-5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap w-full md:w-auto transition-colors"
                >
                  Add to Kit
                </button>
              </div>
            </div>
          </div>
      )}

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool: any) => (
            <div key={tool.rank} className="rounded-3xl border border-[#333] bg-[#111] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full border border-[#333] bg-[#1a1a1a] px-2.5 py-1 text-[11px] font-medium text-[#d1d5db]">
                  #{tool.rank}
                </span>
                <span className="rounded-full bg-[#1a1a1a] px-2.5 py-1 text-[11px] text-[#aaa]">
                  {tool.category}
                </span>
              </div>
              <a
                href={`https://${tool.link}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${tool.name} website (opens in new tab)`}
                className="block text-lg font-semibold text-white hover:text-[#e11d48]"
              >
                {tool.name}
              </a>
              <div className="mt-2 text-sm font-medium text-emerald-400">{tool.price}</div>
              <p className="mt-2 text-sm leading-relaxed text-[#d1d5db] line-clamp-2">{getMobileSummary(tool)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tool.roles.slice(0, 1).map((role: string, i: number) => (
                  <span key={i} className="rounded-full bg-[#1a1a1a] px-2.5 py-0.5 text-xs text-[#bfbfbf]">
                    {role}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTool(tool)}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#e11d48]/40 bg-black px-3 py-2 text-sm font-medium text-[#e11d48] transition-colors hover:bg-[#1a1a1a]"
                >
                  Tool Details
                </button>
                <button
                  type="button"
                  onClick={() => addToMyKit(tool)}
                  className="flex-1 min-h-[44px] rounded-xl border border-emerald-500/40 bg-black px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-[#1a1a1a] hover:text-emerald-300"
                >
                  Add to Kit
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#111] border border-[#333] rounded-3xl p-8 text-center text-[#888]">
            No tools match your current filters.
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-[#111] border border-[#333] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[840px]">
          <thead className="border-b border-[#333]">
            <tr>
              <th className="px-6 py-5 text-left font-medium text-[#888]">Tool</th>
              <th className="px-6 py-5 text-left font-medium text-[#888]">Category</th>
              <th className="px-6 py-5 text-left font-medium text-[#888]">Use Case</th>
              <th className="px-6 py-5 text-left font-medium text-[#888]">Price</th>
              <th className="w-48 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filteredTools.length > 0 ? (
              filteredTools.map((tool: any) => (
                <tr key={tool.rank} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-6 py-6 font-medium">
                    <a 
                      href={`https://${tool.link}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label={`${tool.name} website (opens in new tab)`}
                      className="text-[#e11d48] hover:underline hover:text-red-400 transition-colors"
                    >
                      {tool.name}
                    </a>
                  </td>
                  <td className="px-6 py-6 text-[#888]">{tool.category}</td>
                  <td className="px-6 py-6 text-[#d1d5db]">{getUseCaseText(tool, 140)}</td>
                  <td className="px-6 py-6 text-[#888]">{tool.price}</td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex gap-4 justify-end">
                      <button 
                        onClick={() => setSelectedTool(tool)}
                        className="text-[#e11d48] hover:underline text-sm font-medium"
                      >
                        Tool Details
                      </button>
                      <button 
                        onClick={() => addToMyKit(tool)}
                        className="text-emerald-400 hover:text-emerald-500 font-medium transition-colors"
                      >
                        Add to Kit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-[#888]">
                  No tools match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  </div>
)}
{/* === STEP 1: CHOOSE YOUR ROLE === */}
{step === 1 && (
  <div className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5] py-12 px-6 relative overflow-hidden">
    {/* Film Grain */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.03)_0%,transparent_70%)] pointer-events-none" />

    <div className="max-w-5xl mx-auto relative z-10">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">Choose Your Role</h1>
        <p className="text-[#d1d5db] text-xl">
          We'll show you the most relevant AI tools for your position
        </p>
        
        {/* Bigger Selected Path */}
        {selectedBudget && (
          <p className="mt-6 text-2xl font-medium">
            Budget Path: <span className="text-[#e11d48] capitalize">{selectedBudget}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {rolesList.map((role, index) => (
          <button
            key={role}
            type="button"
            onClick={() => handleRoleSelect(role)}
            className={`group rounded-3xl border bg-[#111] p-4 text-left transition-all hover:scale-[1.02] md:p-8 ${
              selectedRole === role 
                ? "border-[#e11d48] shadow-xl shadow-[#e11d48]/20" 
                : "border-[#333] hover:border-[#555]"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full border border-[#333] bg-[#1a1a1a] px-2.5 py-1 text-[11px] font-medium text-[#d1d5db]">
                #{index + 1}
              </span>
              {selectedRole === role && (
                <span className="rounded-full bg-[#e11d48]/20 px-2.5 py-1 text-[11px] font-medium text-[#fda4af]">
                  Selected
                </span>
              )}
            </div>

            <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-[#e11d48] md:mb-6 md:text-2xl">
              {role}
            </h3>

            <p className="hidden min-h-[3.5rem] text-sm leading-relaxed text-[#d1d5db] md:mb-10 md:block">
              {getRoleDescription(role)}
            </p>
            <p className="text-sm leading-relaxed text-[#d1d5db] line-clamp-2 md:hidden">
              {getMobileRoleSummary(role)}
            </p>

            <div className={`mt-3 flex min-h-[36px] items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition-colors md:mt-0 md:min-h-0 md:justify-start md:rounded-none md:border-0 md:px-0 md:py-0 ${
              selectedRole === role
                ? "border-[#e11d48]/40 bg-[#e11d48]/10 text-[#e11d48] md:bg-transparent"
                : "border-[#333] text-[#888] group-hover:border-[#444] group-hover:text-[#d1d5db] md:border-0"
            }`}>
              {selectedRole === role ? "✓ Selected Role" : "Choose role"}
            </div>
          </button>
        ))}
      </div>

      <div className="text-center mt-12">
        <button 
          onClick={() => setStep(0)}
          className="text-[#888] hover:text-[#d1d5db] flex items-center gap-2 mx-auto transition-colors"
        >
          ← Back to Budget Path
        </button>
      </div>
    </div>

    
  </div>
)}

{/* Tools Page - Step 2 with Spotlight + Green + Kit in Table */}
{step === 2 && (
  <div className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5] relative overflow-hidden">
    {/* Film Grain */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.03)_0%,transparent_70%)] pointer-events-none" />

    <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
      {selectedRole && (
        <>
          <h2 className="text-2xl md:text-4xl font-bold mb-2">
            Tools for <span className="text-[#e11d48]">{selectedRole}</span>
          </h2>
          <p className="text-[#888] mb-10">AI tools matched to your role</p>
        </>
      )}

      {/* Spotlight - Keep Red Button */}
      {spotlightToolForRole && (
          <div className="mb-12 bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-[#e11d48]/30 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-1 bg-[#e11d48] text-white text-xs font-medium rounded-full">SPOTLIGHT</div>
              <div className="text-[#e11d48] text-sm">Top pick for {selectedRole}</div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <h3 className="text-3xl font-semibold mb-3">{spotlightToolForRole.name}</h3>
                <p className="text-[#d1d5db] mb-6">{getUseCaseText(spotlightToolForRole, 180)}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {spotlightToolForRole.roles.map((role: string, i: number) => (
                    <span key={i} className="text-xs bg-[#222] px-3 py-1 rounded-full">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                {/* Red Button in Spotlight - Kept as requested */}
                <button
                  onClick={() => addToMyKit(spotlightToolForRole)}
                  className="bg-black border border-[#e11d48] text-[#e11d48] hover:bg-[#1a1a1a] px-5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap w-full md:w-auto transition-colors"
                >
                  Add to Kit
                </button>
              </div>
            </div>
          </div>
      )}

      {/* Search */}
      <div className="sticky top-[calc(4.25rem+env(safe-area-inset-top))] z-30 mb-6 rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f]/95 p-3 backdrop-blur-sm md:static md:mb-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none md:top-auto">
      <div className="relative mb-2">
        <Search className="absolute left-4 top-3.5 text-[#888]" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tools by name, role, or workflow..."
          className="w-full bg-[#111] border border-[#333] rounded-2xl pl-12 pr-11 py-3.5 text-white placeholder-[#666] focus:outline-none focus:border-[#e11d48]"
        />
        {searchTerm.trim() && (
          <button
            type="button"
            aria-label="Clear search text"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-2.5 rounded-lg p-1.5 text-[#888] transition-colors hover:text-[#e11d48]"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <p className="text-xs text-[#888] md:text-sm">
        Showing <span className="font-medium text-white">{filteredTools.length}</span> recommended tools
      </p>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool: any) => (
            <div key={tool.rank} className="rounded-3xl border border-[#333] bg-[#111] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full border border-[#333] bg-[#1a1a1a] px-2.5 py-1 text-[11px] font-medium text-[#d1d5db]">
                  #{tool.rank}
                </span>
                <span className="rounded-full bg-[#1a1a1a] px-2.5 py-1 text-[11px] text-[#aaa]">
                  {tool.category}
                </span>
              </div>
              <a
                href={`https://${tool.link}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${tool.name} website (opens in new tab)`}
                className="block text-lg font-semibold text-white hover:text-[#e11d48]"
              >
                {tool.name}
              </a>
              <div className="mt-2 text-sm font-medium text-emerald-400">{tool.price}</div>
              <p className="mt-2 text-sm leading-relaxed text-[#d1d5db] line-clamp-2">{getMobileSummary(tool)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tool.roles.slice(0, 1).map((role: string, i: number) => (
                  <span key={i} className="rounded-full bg-[#222] px-2.5 py-0.5 text-xs text-[#bfbfbf]">
                    {role}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTool(tool)}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#e11d48]/40 bg-black px-3 py-2 text-sm font-medium text-[#e11d48] transition-colors hover:bg-[#1a1a1a]"
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => addToMyKit(tool)}
                  className="flex-1 min-h-[44px] rounded-xl border border-emerald-500/40 bg-black px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-[#1a1a1a] hover:text-emerald-300"
                >
                  Add to Kit
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#111] border border-[#333] rounded-3xl p-8 text-center text-[#888]">
            No tools found for "{searchTerm}".<br />
            Try a broader keyword like storyboard, VFX, voice, or budget.
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-[#111] border border-[#333] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="border-b border-[#333]">
              <th className="text-left py-5 px-8 font-medium text-[#888]">Tool</th>
              <th className="text-left py-5 px-4 font-medium text-[#888]">Category</th>
              <th className="text-left py-5 px-4 font-medium text-[#888]">Use Case</th>
              <th className="text-left py-5 px-4 font-medium text-[#888]">Price</th>
              <th className="text-left py-5 px-4 font-medium text-[#888]">Top Roles</th>
              <th className="w-40"></th>
            </tr>
          </thead>
          <tbody>
            {filteredTools.length > 0 ? (
              filteredTools.map((tool: any) => (
                <tr key={tool.rank} className="border-b border-[#333] hover:bg-[#1a1a1a] transition-colors group">
                  <td className="py-5 px-8 font-medium">
                    <a 
                      href={`https://${tool.link}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label={`${tool.name} website (opens in new tab)`}
                      className="text-[#e11d48] hover:underline hover:text-red-400 transition-colors"
                    >
                      {tool.name}
                    </a>
                  </td>
                  <td className="py-5 px-4">
                    <span className="px-3 py-1 bg-[#1a1a1a] text-xs rounded-full">{tool.category}</span>
                  </td>
                  <td className="py-5 px-4 text-[#d1d5db] text-sm">{getUseCaseText(tool, 150)}</td>
                  <td className="py-5 px-4 text-[#e11d48]">{tool.price}</td>
                  <td className="py-5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {tool.roles.slice(0, 2).map((role: string, i: number) => (
                        <span key={i} className="text-xs bg-[#222] px-2.5 py-0.5 rounded-full">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <div className="flex gap-4 justify-end">
                      <button 
                        onClick={() => setSelectedTool(tool)}
                        className="text-[#e11d48] hover:underline text-sm font-medium"
                      >
                        Tool Details
                      </button>

                      {/* Green + Kit - Consistent with All Tools page */}
                      <button 
                        onClick={() => addToMyKit(tool)}
                        className="text-emerald-400 hover:text-emerald-500 font-medium transition-colors"
                      >
                        Add to Kit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-20 text-center text-[#888]">
                  No tools found for "{searchTerm}".<br />
                  Try a broader keyword like storyboard, VFX, voice, or budget.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-10">
        <Button 
          variant="outline" 
          onClick={() => setStep(1)} 
          className="border-[#444] text-[#d1d5db] hover:bg-[#222]"
        >
          ← Back to Role Choice
        </Button>
        <Button onClick={handleStartOver} className="bg-[#e11d48] hover:bg-red-600">
          Restart Planner
        </Button>
      </div>
    </div>
  </div>
)}
 {/* === STEP 3: ABOUT PAGE === */}
{step === 3 && <AboutPageContent variant="embedded" onNavigate={setStep} />}
{/* === STEP 4: INTERACTIVE WORKFLOW BUILDER === */}
{step === 4 && (
  <div className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5] py-8 md:py-10 px-4 sm:px-6 relative overflow-x-clip">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.03)_0%,transparent_70%)] pointer-events-none" />

    <div ref={workflowKeyboardRootRef} className="max-w-5xl mx-auto relative z-10">
      <nav
        className="mb-6 hidden justify-center text-sm text-[#888] md:flex"
        aria-label="Breadcrumb"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="hover:text-[#e11d48] transition-colors"
            >
              Home
            </button>
          </li>
          <li aria-hidden className="text-[#444]">
            /
          </li>
          <li className="text-[#d1d5db]">Workflows</li>
        </ol>
      </nav>

      <div className="text-center mb-8 md:mb-10">
        <h1 className="text-3xl md:text-6xl font-bold mb-4 tracking-tight">
          Workflow Builder
        </h1>
        <p className="text-[#d1d5db] max-w-2xl mx-auto">
          Complete indie filmmaking workflow with practical steps and AI tool
          recommendations
        </p>
      </div>

      {/* Mobile: phase listbox */}
      <div className="mb-6 md:hidden">
        <div
          ref={workflowStageFilterRootRef}
          className="relative mx-auto max-w-md"
        >
          <button
            ref={workflowStageTriggerRef}
            id="workflow-stage-trigger"
            type="button"
            aria-haspopup="listbox"
            aria-expanded={workflowStageMenuOpen}
            aria-controls="workflow-stage-listbox"
            aria-label="Select workflow phase"
            onClick={() => setWorkflowStageMenuOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-2xl border border-[#333] bg-[#111] px-4 py-3 text-left text-sm font-medium text-white focus:outline-none focus:border-[#e11d48]"
          >
            <span>{workflowStages[currentWorkflowStage].title}</span>
            <span className="text-[#888]" aria-hidden>
              {workflowStageMenuOpen ? "▲" : "▼"}
            </span>
          </button>
          {workflowStageMenuOpen && (
            <div
              id="workflow-stage-listbox"
              role="listbox"
              aria-labelledby="workflow-stage-trigger"
              className="absolute left-0 right-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-[#333] bg-[#111] shadow-2xl"
            >
              {workflowStages.map((stage, index) => (
                <button
                  key={stage.title}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={currentWorkflowStage === index}
                  onClick={() => {
                    setCurrentWorkflowStage(index);
                    setWorkflowStageMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                    currentWorkflowStage === index
                      ? "bg-[#1a1a1a] text-[#e11d48]"
                      : "text-[#d1d5db] hover:bg-[#1a1a1a]"
                  }`}
                >
                  {stage.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: phase tabs */}
      <div className="mb-8 md:mb-10 hidden md:block">
        <div className="flex justify-between items-center border-b border-[#222] pb-3 overflow-x-auto gap-2">
          {workflowStages.map((stage, index) => (
            <button
              key={stage.title}
              type="button"
              onClick={() => {
                setCurrentWorkflowStage(index);
                setWorkflowStageMenuOpen(false);
              }}
              className={`flex-1 min-w-[120px] text-center pb-3 font-medium text-sm md:text-base transition-all relative
                ${
                  currentWorkflowStage === index
                    ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#e11d48]"
                    : "text-[#888] hover:text-[#d1d5db]"
                }`}
            >
              {stage.title}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={workflowStagePanelRef}
        className="lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-6 lg:items-stretch"
      >
        <div className="bg-[#111] border border-[#333] rounded-3xl p-5 sm:p-8 md:p-10 lg:self-start">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-[#e11d48] mb-2">
              {workflowStages[currentWorkflowStage].title}
            </h2>
            <p className="text-[#d1d5db] text-base md:text-lg">
              {workflowStages[currentWorkflowStage].description}
            </p>
            <p className="text-sm text-[#737373] mt-3">
              {workflowStages[currentWorkflowStage].steps.length} steps in this
              phase · Use the outline (desktop) or chips (mobile) to jump, or
              scroll through.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3">
              <button
                type="button"
                onClick={goToDirectoryForCurrentWorkflowStage}
                className="rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-2.5 text-sm font-medium text-white hover:border-[#e11d48] transition-colors text-left"
              >
                {directorySearchQueryForWorkflowStage(
                  workflowStages[currentWorkflowStage].title
                )
                  ? `Browse All Tools (${directorySearchQueryForWorkflowStage(workflowStages[currentWorkflowStage].title)} search)`
                  : "Browse full directory"}
              </button>
              {workflowStages[currentWorkflowStage].steps.some(
                (s) => s.tools && s.tools.length > 0
              ) && (
                <button
                  type="button"
                  onClick={() =>
                    bulkAddWorkflowToolsToKit(
                      workflowStages[currentWorkflowStage].steps.flatMap(
                        (s) => s.tools || []
                      )
                    )
                  }
                  className="rounded-xl border border-emerald-700/50 bg-emerald-950/30 px-4 py-2.5 text-sm font-medium text-emerald-400 hover:border-emerald-500 transition-colors"
                >
                  Add all matches from this phase to My Kit
                </button>
              )}
            </div>
          </div>

          {/* Mobile: jump chips */}
          <div className="lg:hidden -mx-2 mb-6 border-y border-[#2a2a2a] bg-[#141414] px-2 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[#737373] mb-2 px-1">
              On this page
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {workflowStages[currentWorkflowStage].steps.map((item, idx) => {
                const m = item.step.match(/^(\d+\.\d+)/);
                const chip = m ? m[1] : String(idx + 1);
                return (
                  <button
                    key={`m-${idx}`}
                    type="button"
                    title={item.step}
                    onClick={() =>
                      document
                        .getElementById(
                          `wf-step-${currentWorkflowStage}-${idx}`
                        )
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                    className="shrink-0 rounded-full border border-[#333] bg-[#111] px-3 py-1.5 text-xs font-medium text-[#d1d5db] hover:border-[#e11d48] transition-colors"
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-10 md:space-y-14">
            {workflowStages[currentWorkflowStage].steps.map((item, idx) => {
              const stepTotal =
                workflowStages[currentWorkflowStage].steps.length;
              return (
                <div
                  id={`wf-step-${currentWorkflowStage}-${idx}`}
                  key={idx}
                  className="scroll-mt-28 border-l-4 border-[#e11d48] pl-4 md:pl-8"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#737373] mb-1">
                        Step {idx + 1} of {stepTotal}
                      </p>
                      <h3 className="text-xl md:text-2xl font-semibold text-white">
                        {item.step}
                      </h3>
                    </div>
                    {item.tools && item.tools.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          bulkAddWorkflowToolsToKit(item.tools as number[])
                        }
                        className="shrink-0 self-start rounded-xl border border-[#333] px-3 py-2 text-xs font-medium text-[#e11d48] hover:border-[#e11d48] hover:bg-[#e11d48]/5 transition-colors md:text-sm"
                      >
                        Add step suggestions to My Kit
                      </button>
                    )}
                  </div>

                  <p className="text-[#d1d5db] mt-3 mb-6 leading-relaxed">
                    {item.description}
                  </p>

                  {item.proTip && (
                    <div className="mb-6 bg-[#1a1a1a] border-l-4 border-amber-400 p-5 rounded-2xl text-sm">
                      <p className="text-amber-300 leading-relaxed">
                        {item.proTip}
                      </p>
                    </div>
                  )}

                  {item.tools && item.tools.length > 0 && (
                    <div className="space-y-4">
                      {item.tools.map((catalogRank) => {
                        const tool = getToolByRank(catalogRank);
                        if (!tool) {
                          return (
                            <div
                              key={catalogRank}
                              className="rounded-2xl border border-dashed border-[#444] bg-[#1a1a1a] p-4 md:p-6"
                            >
                              <p className="font-medium text-white">
                                Unknown catalog rank #{catalogRank}
                              </p>
                              <p className="mt-1 text-sm text-[#888]">
                                This rank is not in the catalog — fix the workflow
                                data or restore the tool entry.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRole(null);
                                  setSelectedBudget(null);
                                  setSearchTerm(String(catalogRank));
                                  setStep(9);
                                }}
                                className="mt-3 text-sm font-medium text-[#e11d48] hover:text-red-400 transition-colors"
                              >
                                Open All Tools
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={tool.name}
                            className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 gap-y-2 mb-3">
                                <span className="px-3 py-1 bg-[#e11d48]/10 text-[#e11d48] text-xs font-medium rounded-full">
                                  Suggested
                                </span>
                                <span className="px-2 py-0.5 rounded-md border border-[#333] text-[10px] font-medium uppercase tracking-wide text-[#a3a3a3]">
                                  {tool.category}
                                </span>
                                <span className="text-sm text-[#888]">
                                  {tool.price}
                                </span>
                              </div>

                              <a
                                href={`https://${tool.link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${tool.name} website (opens in new tab)`}
                                className="text-lg md:text-xl font-medium hover:text-[#e11d48] transition-colors block"
                              >
                                {tool.name}
                              </a>

                              <p className="text-[#d1d5db] text-sm leading-relaxed mt-2">
                                {getUseCaseText(tool, 160)}
                              </p>
                            </div>

                            <div className="flex flex-shrink-0 flex-col gap-2 items-stretch md:items-end md:min-w-[9rem]">
                              <button
                                type="button"
                                onClick={() => addToMyKit(tool)}
                                className="rounded-xl border border-emerald-700/50 bg-emerald-950/30 px-4 py-2.5 text-sm font-medium text-emerald-400 hover:border-emerald-500 transition-colors"
                              >
                                Add to Kit
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedTool(tool)}
                                className="rounded-xl px-4 py-2 text-sm font-medium text-[#e11d48] hover:bg-[#e11d48]/10 transition-colors"
                              >
                                Tool details
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="hidden lg:block" aria-label="Section outline">
          <nav className="sticky top-[calc(5rem+env(safe-area-inset-top))] z-20 max-h-[min(36rem,calc(100vh-5.5rem-env(safe-area-inset-top)))] overflow-y-auto overscroll-contain rounded-2xl border border-[#333] bg-[#111] p-5 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#a3a3a3] mb-3">
              On this page
            </p>
            <ul className="space-y-1.5">
              {workflowStages[currentWorkflowStage].steps.map((item, idx) => (
                <li key={`d-${idx}`}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-2 py-2.5 text-left text-base leading-snug text-[#d1d5db] hover:bg-[#1a1a1a] hover:text-white transition-colors"
                    title={item.step}
                    onClick={() =>
                      document
                        .getElementById(`wf-step-${currentWorkflowStage}-${idx}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                  >
                    <span className="text-sm font-medium text-[#737373]">
                      {idx + 1}.
                    </span>{" "}
                    {item.step.replace(/^\d+\.\d+\s+/, "").length > 38
                      ? `${item.step.replace(/^\d+\.\d+\s+/, "").slice(0, 35)}…`
                      : item.step.replace(/^\d+\.\d+\s+/, "")}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      <p className="mt-6 hidden text-center text-xs text-[#666] md:block">
        Tip: when focus is anywhere in this workflow (except typing), use ← →
        to change phase.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-6 sm:gap-3">
        <button
          type="button"
          onClick={() =>
            setCurrentWorkflowStage(Math.max(0, currentWorkflowStage - 1))
          }
          disabled={currentWorkflowStage === 0}
          className="flex-1 rounded-2xl border border-[#333] bg-[#111] px-4 py-3.5 text-sm font-medium text-[#d1d5db] transition-colors hover:border-[#444] hover:bg-[#1a1a1a] hover:text-white focus:outline-none focus:border-[#e11d48] disabled:pointer-events-none disabled:opacity-40 disabled:hover:border-[#333] disabled:hover:bg-[#111] disabled:hover:text-[#d1d5db]"
        >
          ← Previous Stage
        </button>

        {currentWorkflowStage < workflowStages.length - 1 && (
          <button
            type="button"
            onClick={() =>
              setCurrentWorkflowStage(currentWorkflowStage + 1)
            }
            className="flex-1 rounded-2xl border border-[#e11d48]/60 bg-[#1a1a1a] px-4 py-3.5 text-sm font-medium text-white transition-colors hover:border-[#e11d48] hover:bg-[#e11d48]/10 focus:outline-none focus:border-[#e11d48]"
          >
            Next Stage →
          </button>
        )}

        {currentWorkflowStage === workflowStages.length - 1 && (
          <button
            type="button"
            onClick={() => setStep(5)}
            className="flex-1 rounded-2xl border border-emerald-600/50 bg-emerald-950/20 px-4 py-3.5 text-sm font-medium text-emerald-400 transition-colors hover:border-emerald-500 hover:bg-emerald-950/35 focus:outline-none focus:border-emerald-400"
          >
            Open Budget Planner
          </button>
        )}
      </div>
    </div>
  </div>
)}
{/* === STEP 5: BUDGET TEMPLATES === */}
{step === 5 && (
  <div className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5] py-10 md:py-12 px-4 sm:px-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.03)_0%,transparent_70%)] pointer-events-none" />

    <div className="max-w-6xl mx-auto relative z-10">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-3xl font-bold md:text-5xl">Budget Templates</h1>
        <p className="text-base text-[#d1d5db] md:text-xl">
          Interactive planner with live AI savings calculator
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-xs text-[#737373] md:text-sm">
          Each column links to a full Google Sheet — use{" "}
          <span className="text-[#a3a3a3]">Download .xlsx</span> on mobile for a file copy, or{" "}
          <span className="text-[#a3a3a3]">Open in Google Sheets</span> in the browser / app.
        </p>
      </div>

      {/* Currency Selector */}
      <div className="mb-10 flex justify-center">
        <div className="flex items-center gap-2 rounded-2xl border border-[#333] bg-[#111] px-3 py-2 sm:gap-3 sm:px-5 sm:py-3">
          <span className="shrink-0 text-sm text-[#888] sm:text-base">Currency:</span>
          <div ref={currencyFilterRootRef} className="relative min-w-[9.5rem] flex-1 sm:min-w-[11rem]">
            <button
              ref={currencyTriggerRef}
              id="budget-currency-trigger"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={currencyMenuOpen}
              aria-controls="budget-currency-listbox"
              aria-label="Select currency"
              onClick={() => {
                setCurrencyMenuOpen((open) => !open);
                setRoleMenuOpen(false);
                setBudgetMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2 text-left text-sm text-white focus:outline-none focus:border-[#e11d48] sm:px-4 sm:py-2.5 sm:text-base"
            >
              <span>
                {CURRENCY_OPTIONS.find((o) => o.value === currency)?.label ?? currency}
              </span>
              <span className="text-[#888]" aria-hidden>
                {currencyMenuOpen ? "▲" : "▼"}
              </span>
            </button>
            {currencyMenuOpen && (
              <div
                id="budget-currency-listbox"
                role="listbox"
                aria-labelledby="budget-currency-trigger"
                className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[#333] bg-[#111] shadow-2xl"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    tabIndex={-1}
                    aria-selected={currency === opt.value}
                    onClick={() => {
                      setCurrency(opt.value);
                      setCurrencyMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors sm:text-base ${
                      currency === opt.value
                        ? "bg-[#1a1a1a] text-[#e11d48]"
                        : "text-[#d1d5db] hover:bg-[#1a1a1a]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">

        {/* MICRO BUDGET */}
        <div className="bg-[#111] border border-[#333] rounded-3xl p-5 sm:p-8">
          <div className="mb-6 flex items-start gap-3 border-b border-[#2a2a2a] pb-5">
            <div className="text-3xl leading-none">📱</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Micro budget</p>
              <h3 className="text-xl font-bold text-white md:text-2xl">Solo / short film</h3>
              <p className="mt-1 text-sm text-[#888]">Under ~$5,000 • AI tool line items</p>
            </div>
          </div>

          <div className="space-y-4">
            {microTools.map((tool, index) => {
              const qty = tool.qty || 1;
              const converted = Math.round((tool.monthly || 0) * qty * exchangeRate);

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white">{tool.name}</div>
                      <div className="text-xs text-[#888]">{tool.category}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMicroTools(microTools.filter((_, i) => i !== index))}
                      className="shrink-0 rounded-lg border border-[#333] p-2 text-[#888] transition-colors hover:border-red-500/50 hover:text-red-400"
                      aria-label={`Remove ${tool.name}`}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 border-t border-[#2a2a2a] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-[#888]">Qty</span>
                      <div className="flex items-center overflow-hidden rounded-xl border border-[#444] bg-[#1f1f1f]">
                        <button
                          type="button"
                          onClick={() => {
                            const newTools = [...microTools];
                            newTools[index].qty = Math.max(1, qty - 1);
                            setMicroTools(newTools);
                          }}
                          className="flex h-10 w-10 items-center justify-center text-lg hover:bg-[#2a2a2a]"
                        >
                          −
                        </button>
                        <span className="min-w-[2.5rem] border-x border-[#444] py-2 text-center text-sm font-semibold">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newTools = [...microTools];
                            newTools[index].qty = qty + 1;
                            setMicroTools(newTools);
                          }}
                          className="flex h-10 w-10 items-center justify-center text-lg hover:bg-[#2a2a2a]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-[#666]">Line total / mo</div>
                      <div className="text-lg font-semibold text-emerald-400">
                        {currencySymbol}
                        {converted}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="mt-10 pt-6 border-t border-[#333] space-y-4">
            <div className="flex justify-between text-lg">
              <span>Total with AI</span>
              <span className="font-medium text-emerald-400">
                {currencySymbol}{Math.round(microTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Traditional estimate</span>
              <input 
                type="number" 
                value={microTraditional} 
                onChange={(e) => setMicroTraditional(Number(e.target.value) || 0)}
                className="bg-[#1a1a1a] border border-[#444] rounded-xl px-4 py-2 w-32 text-right font-medium"
              />
            </div>
            <div className="flex justify-between text-xl font-semibold text-emerald-400 pt-4 border-t border-[#333]">
              <span>You Save</span>
              <span>
                {currencySymbol}{Math.round(microTraditional - microTotal)}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <button
              type="button"
              onClick={() =>
                setMicroTools(budgetLinesFromPreset(BUDGET_DEFAULT_MICRO_ROWS))
              }
              className="min-h-[44px] w-full shrink-0 rounded-2xl border border-[#444] px-5 py-3.5 text-sm font-medium hover:bg-[#222] sm:w-auto sm:py-3"
            >
              Reset to Default
            </button>
            <div className="w-full min-w-0 sm:flex-1">
              <BudgetSheetLinks variant="micro" />
            </div>
          </div>
        </div>

        {/* LOW / ASPIRATIONAL BUDGET */}
        <div className="bg-[#111] border border-[#333] rounded-3xl p-5 sm:p-8">
          <div className="mb-6 flex items-start gap-3 border-b border-[#2a2a2a] pb-5">
            <div className="text-3xl leading-none">🎬</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Low / aspirational</p>
              <h3 className="text-xl font-bold text-white md:text-2xl">Indie feature</h3>
              <p className="mt-1 text-sm text-[#888]">~$5K – $30K • AI tool line items</p>
            </div>
          </div>

          <div className="space-y-4">
            {lowTools.map((tool, index) => {
              const qty = tool.qty || 1;
              const converted = Math.round((tool.monthly || 0) * qty * exchangeRate);

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white">{tool.name}</div>
                      <div className="text-xs text-[#888]">{tool.category}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLowTools(lowTools.filter((_, i) => i !== index))}
                      className="shrink-0 rounded-lg border border-[#333] p-2 text-[#888] transition-colors hover:border-red-500/50 hover:text-red-400"
                      aria-label={`Remove ${tool.name}`}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 border-t border-[#2a2a2a] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-[#888]">Qty</span>
                      <div className="flex items-center overflow-hidden rounded-xl border border-[#444] bg-[#1f1f1f]">
                        <button
                          type="button"
                          onClick={() => {
                            const newTools = [...lowTools];
                            newTools[index].qty = Math.max(1, qty - 1);
                            setLowTools(newTools);
                          }}
                          className="flex h-10 w-10 items-center justify-center text-lg hover:bg-[#2a2a2a]"
                        >
                          −
                        </button>
                        <span className="min-w-[2.5rem] border-x border-[#444] py-2 text-center text-sm font-semibold">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newTools = [...lowTools];
                            newTools[index].qty = qty + 1;
                            setLowTools(newTools);
                          }}
                          className="flex h-10 w-10 items-center justify-center text-lg hover:bg-[#2a2a2a]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-[#666]">Line total / mo</div>
                      <div className="text-lg font-semibold text-amber-300">
                        {currencySymbol}
                        {converted}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals for Low Budget */}
          <div className="mt-10 pt-6 border-t border-[#333] space-y-4">
            <div className="flex justify-between text-lg">
              <span>Total with AI</span>
              <span className="font-medium text-yellow-400">
                {currencySymbol}{Math.round(lowTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Traditional estimate</span>
              <input 
                type="number" 
                value={lowTraditional} 
                onChange={(e) => setLowTraditional(Number(e.target.value) || 0)}
                className="bg-[#1a1a1a] border border-[#444] rounded-xl px-4 py-2 w-32 text-right font-medium"
              />
            </div>
            <div className="flex justify-between text-xl font-semibold text-yellow-400 pt-4 border-t border-[#333]">
              <span>You Save</span>
              <span>
                {currencySymbol}{Math.round(lowTraditional - lowTotal)}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <button
              type="button"
              onClick={() =>
                setLowTools(budgetLinesFromPreset(BUDGET_DEFAULT_LOW_ROWS))
              }
              className="min-h-[44px] w-full shrink-0 rounded-2xl border border-[#444] px-5 py-3.5 text-sm font-medium hover:bg-[#222] sm:w-auto sm:py-3"
            >
              Reset to Default
            </button>
            <div className="w-full min-w-0 sm:flex-1">
              <BudgetSheetLinks variant="low" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
{/* === STEP 6: 35mmAI PRO PAGE === */}
{step === 6 && <ProComingSoonContent variant="embedded" onNavigate={setStep} />}
{/* === STEP 7: MY KIT SUMMARY === */}
{step === 7 && (
  <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0f0f0f] text-[#f5f5f5]">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.03)_0%,transparent_70%)]" />

    <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-0 sm:px-0">
      {myKit.length === 0 ? (
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-1 px-3 py-6 text-center md:py-8">
          <div className="mb-2 text-4xl md:mb-3 md:text-5xl" aria-hidden>
            🧰
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-white md:text-3xl">
            Your Kit is Empty
          </h1>
          <p className="mb-4 w-full max-w-md text-pretty text-sm leading-relaxed text-[#888] sm:text-base">
            Use <span className="text-[#d1d5db]">All Tools</span> in the bar below, or open the
            directory here.
          </p>
          <button
            type="button"
            onClick={() => setStep(9)}
            className="text-sm font-medium text-[#d1d5db] underline decoration-[#444] decoration-2 underline-offset-[6px] transition-colors hover:text-white hover:decoration-[#e11d48]/50"
          >
            Browse Tools
          </button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-10 text-center md:mb-12">
        <h1 className="mb-3 text-3xl font-bold md:text-5xl">My Kit</h1>
        <p className="text-base text-[#d1d5db] md:text-xl">
          Your saved tools with a live monthly cost estimate
        </p>

        <div className="mt-4 text-lg font-medium text-emerald-400 md:text-2xl">
          Total estimated monthly cost: {currencySymbol}
          {Math.round(kitTotal)}
        </div>
      </div>

        <div className="mx-auto w-full max-w-3xl space-y-4">
          {myKit.map((tool, index) => (
            <div 
              key={index} 
              className="bg-[#111] border border-[#333] rounded-3xl p-6 flex flex-col md:flex-row gap-6 group"
            >
              <div className="flex-1">
                <a 
                  href={`https://${tool.link}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={`${tool.name} website (opens in new tab)`}
                  className="text-xl font-semibold hover:text-[#e11d48] transition-colors block"
                >
                  {tool.name}
                </a>
                <div className="text-sm text-[#888] mt-1">{tool.category}</div>
                <p className="text-[#d1d5db] text-sm mt-3 leading-relaxed">{getUseCaseText(tool, 180)}</p>
              </div>

              <div className="flex-shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between gap-4">
                <div className="text-right">
                  <div className="text-emerald-400 font-medium">
                    {currencySymbol}{Math.round((tool.monthly || 0) * exchangeRate)}
                  </div>
                  <div className="text-xs text-[#888]">per month</div>
                </div>

                <button 
                  onClick={() => setMyKit(myKit.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-600 p-2 transition-colors"
                  title="Remove from My Kit"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>

          {/* Desktop only — mobile matches empty kit: bottom bar + menu for navigation */}
          <div className="mt-10 hidden flex-col gap-3 md:mt-12 md:flex md:flex-row md:flex-wrap md:justify-center">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex-1 rounded-2xl border border-[#444] py-3.5 text-sm font-medium transition-colors hover:bg-[#222] md:min-w-[200px]"
            >
              Back to Workflow Builder
            </button>

            <button
              type="button"
              onClick={handleStartOver}
              className="flex-1 rounded-2xl border border-[#444] py-3.5 text-sm font-medium transition-colors hover:bg-[#222] md:min-w-[200px]"
            >
              Restart Planner
            </button>
          </div>

          <p className="mt-6 hidden text-center text-sm md:block">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="text-[#d1d5db] underline decoration-[#444] decoration-2 underline-offset-4 transition-colors hover:text-white hover:decoration-[#e11d48]/60"
            >
              Open Budget Planner
            </button>
          </p>
        </div>
      )}
    </div>
  </div>
)}
 </div> {/* closes flex-1 main content area */}

       {/* Footer - at the very bottom */}
<footer className="mt-auto shrink-0 border-t border-[#333] py-6 text-center text-[#666] text-sm md:py-8">
  <div className="max-w-5xl mx-auto px-6">
    <p>© 2026 35mmAI • Built for independent filmmakers</p>
    <p className="mt-2 text-xs">
      Not affiliated with any mentioned tools. All links are for reference only.
    </p>
    <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
      <Link
        href="/about"
        className="text-[#888] underline-offset-2 transition-colors hover:text-[#e11d48] hover:underline"
      >
        About 35mmAI
      </Link>
      <span className="text-[#444]" aria-hidden>
        ·
      </span>
      <Link
        href="/pro"
        className="text-[#888] underline-offset-2 transition-colors hover:text-[#e11d48] hover:underline"
      >
        Pro (waitlist)
      </Link>
    </p>
    <p className="mt-6 text-xs text-[#555]">
      Made with ❤️ for the film community
    </p>
  </div>
</footer>

      </div> {/* closes flex-col wrapper */}

    {/* Improved Hamburger Menu (Step 8) - Mobile Only - Popup Style */}
{step === 8 && (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6 md:hidden"
    onClick={closeMobileMenu}
  >
    <div
      className="max-h-[85vh] w-full max-w-md overflow-auto rounded-3xl border border-[#333] bg-[#111]"
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* Close Button */}
      <div className="flex justify-end p-6">
        <button 
          type="button"
          onClick={closeMobileMenu}
          className="text-3xl text-white hover:text-[#e11d48] transition-colors"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Menu Items */}
      <div className="px-8 pb-10 space-y-2 text-left">
        <button 
          onClick={() => setStep(0)}
          className="block w-full rounded-2xl px-6 py-4 text-left text-lg font-medium text-white transition-all hover:bg-[#1a1a1a] hover:text-[#e11d48] active:scale-[0.98]"
        >
          Home
        </button>

        <button 
          onClick={() => setStep(9)}
          className="block w-full rounded-2xl px-6 py-4 text-left text-lg font-medium text-white transition-all hover:bg-[#1a1a1a] hover:text-[#e11d48] active:scale-[0.98]"
        >
          All Tools
        </button>

        <button 
          onClick={() => setStep(4)}
          className="block w-full rounded-2xl px-6 py-4 text-left text-lg font-medium text-white transition-all hover:bg-[#1a1a1a] hover:text-[#e11d48] active:scale-[0.98]"
        >
          Workflows
        </button>

        <button 
          onClick={() => setStep(5)}
          className="block w-full rounded-2xl px-6 py-4 text-left text-lg font-medium text-white transition-all hover:bg-[#1a1a1a] hover:text-[#e11d48] active:scale-[0.98]"
        >
          Budget Templates
        </button>

        <button 
          onClick={() => setStep(7)}
          className="block w-full rounded-2xl px-6 py-4 text-left text-lg font-medium text-white transition-all hover:bg-[#1a1a1a] hover:text-[#e11d48] active:scale-[0.98]"
        >
          My Kit
        </button>

        <button 
          onClick={() => setStep(6)}
          className="block w-full rounded-2xl px-6 py-4 text-left text-lg font-medium text-white transition-all hover:bg-[#1a1a1a] hover:text-[#e11d48] active:scale-[0.98]"
        >
          35mmAI Pro
        </button>

        <button
          type="button"
          onClick={() => setStep(3)}
          className="block w-full rounded-2xl px-6 py-4 text-left text-lg font-medium text-white transition-all hover:bg-[#1a1a1a] hover:text-[#e11d48] active:scale-[0.98]"
        >
          About
        </button>
      </div>

    </div>
  </div>
)}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed left-1/2 top-20 z-[58] w-[min(92vw,24rem)] -translate-x-1/2 rounded-2xl border px-4 py-3 text-center text-sm shadow-lg ${
            toast.tone === "ok"
              ? "border-emerald-500/40 bg-[#111] text-emerald-300"
              : "border-amber-500/40 bg-[#111] text-amber-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      {[2, 3, 5, 7, 9].includes(step) && !selectedTool && (
        <div className="fixed inset-x-0 bottom-0 z-[45] border-t border-[#333] bg-[#0f0f0f]/95 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
          <div className="mx-auto flex max-w-lg gap-2">
            {step === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="flex-1 min-h-[44px] rounded-xl border border-emerald-500/40 bg-[#111] text-sm font-medium text-white transition-colors hover:border-emerald-500/70 hover:bg-[#1a1a1a]"
                >
                  My Kit ({myKit.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStep(9)}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#e11d48]/40 bg-[#111] text-sm font-medium text-[#f5f5f5] transition-colors hover:border-[#e11d48]/80 hover:bg-[#1a1a1a]"
                >
                  All Tools
                </button>
              </>
            )}
            {step === 5 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#444] bg-[#111] text-sm font-medium text-white transition-colors hover:border-[#555] hover:bg-[#1a1a1a]"
                >
                  My Kit
                </button>
                <button
                  type="button"
                  onClick={() => setStep(9)}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#444] bg-[#111] text-sm font-medium text-white transition-colors hover:border-[#555] hover:bg-[#1a1a1a]"
                >
                  All Tools
                </button>
              </>
            )}
            {step === 3 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#444] bg-[#111] text-sm font-medium text-white transition-colors hover:border-[#555] hover:bg-[#1a1a1a]"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => setStep(9)}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#e11d48]/40 bg-[#111] text-sm font-medium text-[#f5f5f5] transition-colors hover:border-[#e11d48]/80 hover:bg-[#1a1a1a]"
                >
                  All Tools
                </button>
              </>
            )}
            {step === 7 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#444] bg-[#111] text-sm font-medium text-white transition-colors hover:border-[#555] hover:bg-[#1a1a1a]"
                >
                  Budget
                </button>
                <button
                  type="button"
                  onClick={() => setStep(9)}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#444] bg-[#111] text-sm font-medium text-white transition-colors hover:border-[#555] hover:bg-[#1a1a1a]"
                >
                  All Tools
                </button>
              </>
            )}
            {step === 9 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#444] bg-[#111] text-sm font-medium text-white transition-colors hover:border-[#555] hover:bg-[#1a1a1a]"
                >
                  My Kit
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="flex-1 min-h-[44px] rounded-xl border border-[#444] bg-[#111] text-sm font-medium text-white transition-colors hover:border-[#555] hover:bg-[#1a1a1a]"
                >
                  Budget
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tool Detail Modal */}
      {selectedTool && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-2 md:items-center md:p-4"
          onClick={() => setSelectedTool(null)}
        >
          <div 
            ref={toolModalRef}
            className="max-h-[94vh] w-full max-w-2xl overflow-hidden rounded-t-3xl border border-[#333] bg-[#111] md:max-h-[90vh] md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedTool.name} details`}
          >
            <div className="flex items-center justify-between border-b border-[#333] px-4 py-4 sm:px-8 sm:py-6">
             <h2 className="pr-3 text-xl font-semibold text-white sm:text-3xl">{selectedTool.name}</h2>
              <button
                ref={toolModalCloseButtonRef}
                type="button"
                onClick={() => setSelectedTool(null)}
                className="rounded-lg p-1 text-[#888] transition-colors hover:text-white"
                aria-label="Close tool details"
              >
                <X size={28} />
              </button>
            </div>
            <div className="max-h-[calc(94vh-190px)] overflow-y-auto p-4 sm:max-h-[calc(90vh-220px)] sm:p-8">
              <p className="mb-4 text-base leading-relaxed text-[#d1d5db] sm:mb-6 sm:text-lg">
                {getUseCaseText(selectedTool, 260)}
              </p>
              <div className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-[#888]">Category</p>
                  <p className="mt-1 text-sm text-white">{selectedTool.category}</p>
                </div>
                <div className="rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-[#888]">Budget Fit</p>
                  <p className="mt-1 text-sm text-white">{getBudgetFitLabel(selectedTool.budgetFit)}</p>
                </div>
                <div className="rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-[#888]">Typical Price</p>
                  <p className="mt-1 text-sm text-white">{selectedTool.price}</p>
                </div>
                <div className="rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-[#888]">Top Roles</p>
                  <p className="mt-1 text-sm text-white">{selectedTool.roles.slice(0, 2).join(" • ")}</p>
                </div>
              </div>
              {selectedTool.howToUse && selectedTool.howToUse.length > 0 && (
          <div className="mb-10">
            <h4 className="mb-4 font-medium text-[#e11d48]">Quick setup steps</h4>
            <div className="space-y-6">
              {selectedTool.howToUse.map((step: string, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-[#e11d48] flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-[#d1d5db]">{cleanHowToStep(step)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      {selectedTool.examplePrompt && (
  <div className="mb-8 rounded-2xl border border-[#333] bg-[#1a1a1a] p-4 sm:p-6">
    <div className="flex justify-between items-center mb-3">
      <h4 className="text-[#e11d48] font-medium">Prompt starter</h4>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(selectedTool.examplePrompt);
          setToast({ message: "Prompt copied", tone: "ok" });
        }}
        className="text-xs px-4 py-2 bg-[#222] hover:bg-[#e11d48] hover:text-white rounded-full transition-colors"
      >
        Copy
      </button>
    </div>
    <p className="text-[#d1d5db] text-sm leading-relaxed italic bg-[#111] p-4 rounded-xl border-l-4 border-[#e11d48]">
      “{selectedTool.examplePrompt}”
    </p>
  </div>
)}
            </div>
            <div className="border-t border-[#333] px-4 py-3 sm:px-8 sm:py-5">
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => addToMyKit(selectedTool)}
                  className="min-h-[44px] rounded-xl border border-emerald-500/40 bg-black px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-[#1a1a1a] hover:text-emerald-300"
                >
                  Add to Kit
                </button>
                <a
                  href={`https://${selectedTool.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${selectedTool.name} website (opens in new tab)`}
                  className="block min-h-[44px] rounded-xl border border-[#e11d48]/40 bg-black px-4 py-2 text-center text-sm font-medium text-[#e11d48] transition-colors hover:bg-[#1a1a1a] hover:text-[#fb7185] sm:flex-1 sm:py-3 sm:text-base"
                >
                  Open Tool Website →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
    
  );

}