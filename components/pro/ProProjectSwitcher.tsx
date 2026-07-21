"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { proNavPill, proNavPillCompact } from "@/components/pro/ux/pro-surfaces";
import { useOutsideClick } from "@/lib/pro/use-outside-click";
import {
  dispatchOpenNewProject,
  PRO_OPEN_PROJECT_SWITCHER_EVENT,
} from "@/lib/pro/pro-nav-events";
import type { ProjectRow } from "@/lib/pro/types";

type Props = {
  initialProjects: ProjectRow[];
  currentProjectId: string | null;
  className?: string;
  compact?: boolean;
};

const FOCUSABLE_OPTION =
  'button[role="option"], button[data-pro-switcher-action]';

export function ProProjectSwitcher({
  initialProjects,
  currentProjectId,
  className,
  compact = false,
}: Props) {
  const router = useRouter();
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState(initialProjects);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(
    null
  );

  const close = useCallback(() => setOpen(false), []);

  const optionCount = projects.length + 1; // projects + New project

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  useOutsideClick(open, [triggerRef, panelRef], close);

  useEffect(() => {
    function openSwitcher() {
      setOpen(true);
    }
    window.addEventListener(PRO_OPEN_PROJECT_SWITCHER_EVENT, openSwitcher);
    return () => window.removeEventListener(PRO_OPEN_PROJECT_SWITCHER_EVENT, openSwitcher);
  }, []);

  useEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }

    const selectedIdx = Math.max(
      0,
      projects.findIndex((p) => p.id === currentProjectId)
    );
    setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);

    function positionMenu() {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.min(320, Math.max(rect.width, 280)),
      });
    }

    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open, projects, currentProjectId]);

  useEffect(() => {
    if (!open || !menuPos) return;
    const panel = panelRef.current;
    const nodes = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_OPTION);
    nodes?.[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, menuPos, activeIndex]);

  const switchTo = useCallback(
    (id: string) => {
      close();
      router.push(`/pro/app/workspace/${id}`);
      router.refresh();
    },
    [close, router]
  );

  const openNewProject = useCallback(() => {
    close();
    dispatchOpenNewProject();
  }, [close]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % optionCount);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + optionCount) % optionCount);
        return;
      }
      if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(optionCount - 1);
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (activeIndex < projects.length) {
          const project = projects[activeIndex];
          if (project) switchTo(project.id);
        } else {
          openNewProject();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, activeIndex, optionCount, projects, close, switchTo, openNewProject]);

  const currentProject = currentProjectId
    ? projects.find((p) => p.id === currentProjectId)
    : null;

  const pillActive = open;
  const activeId =
    activeIndex < projects.length
      ? `${listboxId}-opt-${projects[activeIndex]?.id ?? activeIndex}`
      : `${listboxId}-new`;

  const menu =
    open && mounted && menuPos
      ? createPortal(
          <div
            ref={panelRef}
            id={listboxId}
            data-pro-overlay=""
            className="fixed z-[100] rounded-xl border border-white/[0.1] bg-pro-elevated p-2 shadow-xl ring-1 ring-white/[0.06]"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
            }}
            role="listbox"
            aria-label="Projects"
            aria-activedescendant={activeId}
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="max-h-52 overflow-y-auto">
              {projects.map((p, index) => (
                <li key={p.id}>
                  <button
                    type="button"
                    id={`${listboxId}-opt-${p.id}`}
                    role="option"
                    aria-selected={p.id === currentProjectId}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => switchTo(p.id)}
                    className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-pro-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pro-primary/50 ${
                      index === activeIndex ? "bg-pro-muted/70" : ""
                    } ${
                      p.id === currentProjectId
                        ? "font-medium text-pro-text"
                        : "text-pro-text-secondary"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    {p.is_default ? (
                      <span className="shrink-0 text-[10px] text-pro-primary">Default</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 border-t border-white/[0.08] pt-2">
              <button
                type="button"
                id={`${listboxId}-new`}
                data-pro-switcher-action=""
                role="option"
                aria-selected={false}
                onMouseEnter={() => setActiveIndex(projects.length)}
                onClick={openNewProject}
                className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-pro-text hover:bg-pro-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pro-primary/50 ${
                  activeIndex === projects.length ? "bg-pro-muted/70" : ""
                }`}
              >
                <Plus className="size-4 shrink-0 text-pro-primary" aria-hidden />
                New project…
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className={cn("relative shrink-0", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          compact ? proNavPillCompact(pillActive) : proNavPill(pillActive),
          "shrink-0 whitespace-nowrap"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-label={
          currentProject
            ? `Project: ${currentProject.name}. Switch project`
            : "Projects"
        }
      >
        <span className={cn("shrink-0 font-medium", compact && currentProject && "max-w-[6.5rem] truncate")}>
          {currentProject?.name ?? "Projects"}
        </span>
        <ChevronDown
          className={cn(
            compact ? "size-3" : "size-3.5",
            "shrink-0 text-pro-text-secondary transition",
            open && "rotate-180 text-pro-primary"
          )}
          aria-hidden
        />
      </button>
      {menu}
    </div>
  );
}
