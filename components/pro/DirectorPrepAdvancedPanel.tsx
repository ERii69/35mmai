"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProModal } from "@/components/pro/ux/ProModal";
import { newSceneRow } from "@/lib/pro/director-prep-prompt";
import {
  DIRECTOR_PREP_MAX_SNAPSHOTS,
  type ProjectStatePayload,
  type SceneRow,
  type SceneRowStatus,
} from "@/lib/pro/types";

const FIELD =
  "w-full rounded-lg border border-white/[0.08] bg-pro-muted px-3 py-2 text-sm text-white outline-none focus:border-pro-primary/60";

type Props = {
  projectId: string;
  state: ProjectStatePayload;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
};

export function DirectorPrepAdvancedPanel({ state, updateState }: Props) {
  const dp = state.directorPrep;
  const [filter, setFilter] = useState<"all" | "draft" | "approved">("all");
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState("");
  const sequences = state.shotPlan.sequences;

  const scenes = useMemo(() => {
    if (filter === "all") return dp.scenes;
    return dp.scenes.filter((s) => s.status === filter);
  }, [dp.scenes, filter]);

  function patch(fn: (p: ProjectStatePayload["directorPrep"]) => ProjectStatePayload["directorPrep"]) {
    updateState((s) => ({ ...s, directorPrep: fn(s.directorPrep) }));
  }

  function updateScene(i: number, patchRow: Partial<SceneRow>) {
    patch((prev) => {
      const next = [...prev.scenes];
      next[i] = { ...next[i], ...patchRow };
      return { ...prev, scenes: next };
    });
  }

  function openSnapshotModal() {
    setSnapshotLabel(`Snapshot ${dp.snapshots.length + 1}`);
    setSnapshotModalOpen(true);
  }

  function saveSnapshot() {
    const label = snapshotLabel.trim();
    if (!label) return;
    patch((prev) => ({
      ...prev,
      snapshots: [
        {
          id: `snap-${Date.now()}`,
          label,
          createdAt: new Date().toISOString(),
          directorRules: { ...prev.directorRules, genreTags: [...prev.directorRules.genreTags] },
          scenes: prev.scenes.map((s) => ({ ...s, visualRefs: [...s.visualRefs] })),
        },
        ...prev.snapshots,
      ].slice(0, DIRECTOR_PREP_MAX_SNAPSHOTS),
    }));
    setSnapshotModalOpen(false);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-pro-text-secondary">Extra vision fields</h3>
        <label className="block text-sm text-pro-text-secondary">
          Preferred shots
          <textarea
            rows={2}
            className={`mt-1 ${FIELD}`}
            value={dp.directorRules.preferredShots}
            onChange={(e) =>
              patch((p) => ({
                ...p,
                directorRules: { ...p.directorRules, preferredShots: e.target.value },
              }))
            }
          />
        </label>
        <label className="block text-sm text-pro-text-secondary">
          Genre tags (comma-separated)
          <input
            className={`mt-1 ${FIELD}`}
            value={dp.directorRules.genreTags.join(", ")}
            onChange={(e) =>
              patch((p) => ({
                ...p,
                directorRules: {
                  ...p.directorRules,
                  genreTags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                },
              }))
            }
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm text-pro-text-secondary">
            Script title
            <input
              className={`mt-1 ${FIELD}`}
              value={dp.screenplay.title}
              onChange={(e) =>
                patch((p) => ({
                  ...p,
                  screenplay: { ...p.screenplay, title: e.target.value },
                }))
              }
            />
          </label>
          <label className="block text-sm text-pro-text-secondary">
            Draft label
            <input
              className={`mt-1 ${FIELD}`}
              value={dp.screenplay.draftLabel}
              onChange={(e) =>
                patch((p) => ({
                  ...p,
                  screenplay: { ...p.screenplay, draftLabel: e.target.value },
                }))
              }
            />
          </label>
          <label className="block text-sm text-pro-text-secondary">
            Page estimate
            <input
              type="number"
              min={0}
              className={`mt-1 ${FIELD}`}
              value={dp.screenplay.pageEstimate ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                patch((p) => ({
                  ...p,
                  screenplay: {
                    ...p.screenplay,
                    pageEstimate: v === "" ? null : Math.max(0, parseInt(v, 10) || 0),
                  },
                }));
              }}
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium uppercase tracking-wide text-pro-text-secondary">
            Scene editor ({dp.scenes.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {(["all", "draft", "approved"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "rounded-lg bg-pro-muted px-2.5 py-1 text-xs text-white"
                    : "rounded-lg px-2.5 py-1 text-xs text-pro-text-secondary"
                }
              >
                {f}
              </button>
            ))}
            <Button
              type="button"
              size="sm"
              className="bg-pro-primary hover:brightness-110"
              onClick={() => {
                const n =
                  dp.scenes.length > 0 ? Math.max(...dp.scenes.map((s) => s.number)) + 1 : 1;
                patch((p) => ({ ...p, scenes: [...p.scenes, newSceneRow(n)] }));
              }}
            >
              Add scene
            </Button>
          </div>
        </div>

        <ul className="space-y-3">
          {scenes.map((scene) => {
            const index = dp.scenes.findIndex((s) => s.id === scene.id);
            return (
              <li key={scene.id} className="rounded-lg border border-white/[0.08] bg-pro-surface p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-pro-text-secondary">#{scene.number}</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-white/[0.1] text-pro-text"
                      onClick={() =>
                        updateScene(index, {
                          status: (scene.status === "approved" ? "draft" : "approved") as SceneRowStatus,
                        })
                      }
                    >
                      {scene.status === "approved" ? "Unapprove" : "Approve"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-white/[0.1] text-pro-text"
                      onClick={() =>
                        patch((p) => ({
                          ...p,
                          scenes: p.scenes.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <input
                  className={FIELD}
                  value={scene.heading}
                  placeholder="INT. LOCATION - DAY"
                  onChange={(e) => updateScene(index, { heading: e.target.value })}
                />
                <input
                  className={FIELD}
                  value={scene.oneLine}
                  placeholder="One-line summary"
                  onChange={(e) => updateScene(index, { oneLine: e.target.value })}
                />
                <textarea
                  rows={2}
                  className={FIELD}
                  value={scene.shotNotes}
                  placeholder="Shot notes"
                  onChange={(e) => updateScene(index, { shotNotes: e.target.value })}
                />
                {sequences.length > 0 ? (
                  <select
                    className={FIELD}
                    value={scene.linkedSequenceId ?? ""}
                    onChange={(e) =>
                      updateScene(index, {
                        linkedSequenceId: e.target.value || null,
                      })
                    }
                  >
                    <option value="">No linked shot sequence</option>
                    {sequences.map((seq) => (
                      <option key={seq.id} value={seq.id}>
                        {seq.title || seq.id}
                      </option>
                    ))}
                  </select>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium uppercase tracking-wide text-pro-text-secondary">Snapshots</h3>
          <Button type="button" size="sm" variant="outline" className="border-white/[0.1] text-pro-text" onClick={openSnapshotModal}>
            Save snapshot
          </Button>
        </div>
        {dp.snapshots.length === 0 ? (
          <p className="text-sm text-pro-text-secondary">Save before major rewrites.</p>
        ) : (
          <ul className="space-y-2">
            {dp.snapshots.map((snap) => (
              <li
                key={snap.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.08] px-3 py-2"
              >
                <div>
                  <p className="text-sm text-white">{snap.label}</p>
                  <p className="text-xs text-[#525252]">{snap.scenes.length} scenes</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-white/[0.1] text-pro-text"
                  onClick={() => {
                    if (!confirm(`Restore "${snap.label}"?`)) return;
                    patch((p) => ({
                      ...p,
                      directorRules: {
                        ...snap.directorRules,
                        genreTags: [...snap.directorRules.genreTags],
                      },
                      scenes: snap.scenes.map((s) => ({ ...s, visualRefs: [...s.visualRefs] })),
                    }));
                  }}
                >
                  Restore
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ProModal
        open={snapshotModalOpen}
        onClose={() => setSnapshotModalOpen(false)}
        title="Save snapshot"
        description="Name this version before you make big changes."
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/[0.1] text-pro-text"
              onClick={() => setSnapshotModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-pro-primary hover:brightness-110"
              disabled={!snapshotLabel.trim()}
              onClick={saveSnapshot}
            >
              Save
            </Button>
          </>
        }
      >
        <label className="block text-sm text-pro-text-secondary">
          Label
          <input
            autoFocus
            className={`mt-1.5 ${FIELD}`}
            value={snapshotLabel}
            placeholder="Before rewrite, Draft 2…"
            onChange={(e) => setSnapshotLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && snapshotLabel.trim()) saveSnapshot();
            }}
          />
        </label>
      </ProModal>
    </div>
  );
}
