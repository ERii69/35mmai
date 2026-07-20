"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type CSSProperties } from "react";
import {
  archiveProject,
  deleteProject,
  renameProject,
  setDefaultProject,
} from "@/app/actions/pro/projects";
import { ProDashboardContinueRow } from "@/components/pro/ProDashboardContinueRow";
import { ProDashboardProjectCardDesktop } from "@/components/pro/ProDashboardProjectCardDesktop";
import { ProDashboardProjectRowMobile } from "@/components/pro/ProDashboardProjectRowMobile";
import { ProDashboardPullRefresh } from "@/components/pro/ProDashboardPullRefresh";
import { ProConfirmDialog } from "@/components/pro/ux/ProConfirmDialog";
import { ProCountBadge } from "@/components/pro/ux/ProCountBadge";
import { useProToast } from "@/components/pro/ux/ProToastProvider";
import { proBtn, proDashboardGrid } from "@/components/pro/ux/pro-surfaces";

export type DashboardProject = {
  id: string;
  name: string;
  is_default: boolean;
  last_opened_at: string;
  updated_at: string;
  stats?: {
    approvedScenes: number;
    totalShots: number;
    percentComplete: number;
    promptsReady: number;
    totalPromptSlots: number;
    hasScript: boolean;
    hasLook: boolean;
    scriptToPrompt: boolean;
    workflowLabel?: string;
    summaryLine: string;
  };
};

type Props = {
  projects: DashboardProject[];
};

type AnimPhase = "idle" | "spotlight" | "settling";

const SPOTLIGHT_MS = 720;
const SETTLE_MS = 480;

function sortByLastOpened(projects: DashboardProject[]): DashboardProject[] {
  return [...projects].sort(
    (a, b) => new Date(b.last_opened_at).getTime() - new Date(a.last_opened_at).getTime()
  );
}

function orderWithDefaultFirst(
  projects: DashboardProject[],
  defaultId: string
): DashboardProject[] {
  const def = projects.find((p) => p.id === defaultId);
  if (!def) return sortByLastOpened(projects);
  const rest = sortByLastOpened(projects.filter((p) => p.id !== defaultId));
  return [def, ...rest];
}

function applyDefaultFlag(projects: DashboardProject[], defaultId: string): DashboardProject[] {
  return projects.map((p) => ({ ...p, is_default: p.id === defaultId }));
}

function sortForDisplay(projects: DashboardProject[]): DashboardProject[] {
  const defaultProject = projects.find((p) => p.is_default);
  if (!defaultProject) return sortByLastOpened(projects);
  return orderWithDefaultFirst(projects, defaultProject.id);
}

function runViewTransition(update: () => void) {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    (
      document as Document & { startViewTransition: (cb: () => void) => void }
    ).startViewTransition(update);
  } else {
    update();
  }
}

function formatLastOpened(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type ConfirmAction = { type: "archive" | "delete"; id: string; name: string };

export function ProDashboardProjects({ projects }: Props) {
  const router = useRouter();
  const { showToast } = useProToast();
  const [pending, startTransition] = useTransition();
  const [displayProjects, setDisplayProjects] = useState(() => sortForDisplay(projects));
  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function prefersReducedMotion(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  useEffect(() => {
    if (animPhase !== "idle") return;
    setDisplayProjects(sortForDisplay(projects));
  }, [projects, animPhase]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  function stopCardNav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDelete(e: React.MouseEvent, projectId: string, projectName: string) {
    stopCardNav(e);
    if (pending) return;
    setConfirmAction({ type: "delete", id: projectId, name: projectName });
  }

  function handleArchive(e: React.MouseEvent, projectId: string, projectName: string) {
    stopCardNav(e);
    if (pending) return;
    setConfirmAction({ type: "archive", id: projectId, name: projectName });
  }

  function runConfirmedAction() {
    if (!confirmAction || pending) return;
    const { type, id } = confirmAction;
    startTransition(async () => {
      const res =
        type === "archive" ? await archiveProject(id) : await deleteProject(id);
      if (!res.ok) {
        showToast({
          variant: "error",
          message:
            type === "archive"
              ? `Archive failed: ${res.error}`
              : res.error,
        });
        return;
      }
      setConfirmAction(null);
      setDisplayProjects((prev) => prev.filter((p) => p.id !== id));
      showToast({
        variant: "success",
        message: type === "archive" ? "Project archived." : "Project deleted.",
      });
      router.refresh();
    });
  }

  function handleRenameSubmit(e: React.FormEvent, projectId: string) {
    e.preventDefault();
    e.stopPropagation();
    const name = renameName.trim();
    if (!name) return;
    startTransition(async () => {
      const res = await renameProject(projectId, name);
      if (!res.ok) return;
      setRenameId(null);
      setRenameName("");
      setDisplayProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, name: res.data.name } : p))
      );
      router.refresh();
    });
  }

  function handleSetDefault(e: React.MouseEvent | null, projectId: string) {
    e?.preventDefault();
    e?.stopPropagation();
    if (pending || animPhase !== "idle") return;

    const optimistic = applyDefaultFlag(projects, projectId);

    if (prefersReducedMotion()) {
      setDisplayProjects(orderWithDefaultFirst(optimistic, projectId));
      startTransition(async () => {
        const res = await setDefaultProject(projectId);
        if (res.ok) router.refresh();
        else setDisplayProjects(sortForDisplay(projects));
      });
      return;
    }

    setSpotlightId(projectId);
    setAnimPhase("spotlight");
    setDisplayProjects(orderWithDefaultFirst(optimistic, projectId));

    startTransition(async () => {
      const res = await setDefaultProject(projectId);
      if (!res.ok) {
        setAnimPhase("idle");
        setSpotlightId(null);
        setDisplayProjects(sortForDisplay(projects));
        return;
      }

      settleTimerRef.current = setTimeout(() => {
        setAnimPhase("settling");
        runViewTransition(() => {
          setDisplayProjects(orderWithDefaultFirst(optimistic, projectId));
        });

        settleTimerRef.current = setTimeout(() => {
          setAnimPhase("idle");
          setSpotlightId(null);
          router.refresh();
        }, SETTLE_MS);
      }, SPOTLIGHT_MS);
    });
  }

  const defaultProject = displayProjects.find((p) => p.is_default) ?? null;
  const mobileListProjects =
    defaultProject && displayProjects.length > 1
      ? displayProjects.filter((p) => p.id !== defaultProject.id)
      : defaultProject && displayProjects.length === 1
        ? []
        : displayProjects;

  return (
    <ProDashboardPullRefresh>
    <section aria-label="Projects" className="mt-2">

      {renameId === defaultProject?.id ? (
        <form
          className="mb-4 rounded-xl border border-white/[0.1] bg-pro-elevated p-3 ring-1 ring-white/[0.08] md:hidden"
          onSubmit={(e) => handleRenameSubmit(e, defaultProject.id)}
        >
          <input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            maxLength={120}
            autoFocus
            className="w-full rounded-lg border border-white/[0.12] bg-pro-muted px-2.5 py-2 text-sm text-pro-text outline-none focus:ring-2 focus:ring-pro-primary/50"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={pending || !renameName.trim()}
              className={`${proBtn.cardAction} font-medium text-pro-text`}
            >
              Save
            </button>
            <button
              type="button"
              className={proBtn.cardAction}
              onClick={() => {
                setRenameId(null);
                setRenameName("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : defaultProject ? (
        <ProDashboardContinueRow
          projectId={defaultProject.id}
          projectName={defaultProject.name}
          isDefault
          pending={pending}
          stats={{
            approvedScenes: defaultProject.stats?.approvedScenes ?? 0,
            percentComplete: defaultProject.stats?.percentComplete ?? 0,
            summaryLine: defaultProject.stats?.summaryLine,
            workflowLabel: defaultProject.stats?.workflowLabel,
          }}
          onRename={() => {
            setRenameId(defaultProject.id);
            setRenameName(defaultProject.name);
          }}
          onArchive={() => {
            if (!pending) {
              setConfirmAction({
                type: "archive",
                id: defaultProject.id,
                name: defaultProject.name,
              });
            }
          }}
          onDelete={() => {
            if (!pending) {
              setConfirmAction({
                type: "delete",
                id: defaultProject.id,
                name: defaultProject.name,
              });
            }
          }}
        />
      ) : null}

      <ProConfirmDialog
        open={confirmAction?.type === "archive"}
        title="Archive project?"
        description={
          confirmAction
            ? `"${confirmAction.name}" moves to Archives. Restore it anytime from the Archives tab.`
            : ""
        }
        confirmLabel="Archive"
        pending={pending}
        onClose={() => setConfirmAction(null)}
        onConfirm={runConfirmedAction}
      />
      <ProConfirmDialog
        open={confirmAction?.type === "delete"}
        title="Delete project?"
        description={
          confirmAction
            ? `"${confirmAction.name}" and all its workspace data will be permanently removed.`
            : ""
        }
        confirmLabel="Delete"
        danger
        pending={pending}
        onClose={() => setConfirmAction(null)}
        onConfirm={runConfirmedAction}
      />

      {defaultProject && mobileListProjects.length > 0 ? (
        <div className="mb-2 mt-5 flex items-baseline justify-between md:hidden">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-pro-text-secondary">
            Other projects
          </h2>
        </div>
      ) : null}

      <ul className="flex flex-col gap-2 md:hidden">
        {mobileListProjects.map((p) => (
          <li key={p.id}>
            {renameId === p.id ? (
              <form
                className="rounded-xl border border-white/[0.1] bg-pro-elevated p-3 ring-1 ring-white/[0.08]"
                onSubmit={(e) => handleRenameSubmit(e, p.id)}
              >
                <input
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  maxLength={120}
                  autoFocus
                  className="w-full rounded-lg border border-white/[0.12] bg-pro-muted px-2.5 py-2 text-sm text-pro-text outline-none focus:ring-2 focus:ring-pro-primary/50"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={pending || !renameName.trim()}
                    className={`${proBtn.cardAction} font-medium text-pro-text`}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className={proBtn.cardAction}
                    onClick={() => {
                      setRenameId(null);
                      setRenameName("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <ProDashboardProjectRowMobile
                project={p}
                pending={pending}
                formatLastOpened={formatLastOpened}
                onRename={() => {
                  setRenameId(p.id);
                  setRenameName(p.name);
                }}
                onArchive={() => {
                  if (!pending) setConfirmAction({ type: "archive", id: p.id, name: p.name });
                }}
                onDelete={() => {
                  if (!pending) setConfirmAction({ type: "delete", id: p.id, name: p.name });
                }}
                onMakeDefault={
                  p.is_default
                    ? undefined
                    : () => handleSetDefault(null, p.id)
                }
              />
            )}
          </li>
        ))}
      </ul>

      {displayProjects.length > 0 ? (
        <div className="mb-3 flex items-center gap-2">
          <h2 id="projects-grid-heading" className="text-xs font-semibold uppercase tracking-wide text-pro-text-secondary">
            Your projects
          </h2>
          <ProCountBadge
            count={displayProjects.length}
            label={`${displayProjects.length} ${displayProjects.length === 1 ? "project" : "projects"}`}
          />
        </div>
      ) : null}

      <ul className={`hidden md:grid ${proDashboardGrid}`}>
        {displayProjects.map((p) => {
          const isSpotlight = spotlightId === p.id && animPhase !== "idle";
          const isRenaming = renameId === p.id;
          return (
            <li
              key={p.id}
              style={
                isSpotlight
                  ? ({ viewTransitionName: `project-${p.id}` } as CSSProperties)
                  : undefined
              }
              className={`min-w-0 transition-transform duration-500 ease-out ${
                isSpotlight ? "relative z-10 scale-[1.01]" : ""
              }`}
            >
              <ProDashboardProjectCardDesktop
                project={p}
                isSpotlight={isSpotlight}
                isRenaming={isRenaming}
                renameName={renameName}
                pending={pending}
                animPhaseIdle={animPhase === "idle"}
                formatLastOpened={formatLastOpened}
                onRenameNameChange={setRenameName}
                onRenameSubmit={(e) => handleRenameSubmit(e, p.id)}
                onRenameCancel={() => {
                  setRenameId(null);
                  setRenameName("");
                }}
                onSetDefault={(e) => handleSetDefault(e, p.id)}
                onRenameStart={() => {
                  setRenameId(p.id);
                  setRenameName(p.name);
                }}
                onArchive={() => {
                  if (!pending) setConfirmAction({ type: "archive", id: p.id, name: p.name });
                }}
                onDelete={() => {
                  if (!pending) setConfirmAction({ type: "delete", id: p.id, name: p.name });
                }}
                onMakeDefault={() => handleSetDefault(null, p.id)}
                stopCardNav={stopCardNav}
              />
            </li>
          );
        })}
      </ul>
    </section>
    </ProDashboardPullRefresh>
  );
}
