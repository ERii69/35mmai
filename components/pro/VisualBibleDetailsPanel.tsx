"use client";

import { Plus } from "lucide-react";
import { proSurface } from "@/components/pro/ux/pro-surfaces";
import type { VisualBibleState } from "@/lib/pro/types";

const FIELD = `${proSurface.field} mt-1.5 text-sm text-pro-text`;

type Props = {
  visualBible: VisualBibleState;
  onPatch: (fn: (vb: VisualBibleState) => VisualBibleState) => void;
};

export function VisualBibleDetailsPanel({ visualBible: vb, onPatch }: Props) {
  return (
    <div className="space-y-5">
      <p className="text-xs leading-relaxed text-pro-text-secondary">
        Your look bible for grade, lens, and consistency checks. Filled from prep or edit here.
      </p>

      <section className="space-y-2 rounded-xl bg-pro-elevated/80 p-3 ring-1 ring-white/[0.06]">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-xs font-medium text-pro-text-secondary">Design notes</h3>
          <span className="text-[10px] text-[#525252]">Markdown ok</span>
        </div>
        <label className="block text-xs text-pro-text-secondary">
          <span className="sr-only">Lighting, production design, mood</span>
          <textarea
            rows={3}
            className={`${FIELD} max-h-48 resize-y font-mono text-xs leading-relaxed`}
            placeholder="Lighting, grade, wardrobe — brief bullets or ## sections"
            value={vb.designSheetNotes}
            onChange={(e) =>
              onPatch((prev) => ({ ...prev, designSheetNotes: e.target.value }))
            }
          />
        </label>
      </section>

      <section className="space-y-3 rounded-xl bg-pro-elevated/80 p-4 ring-1 ring-white/[0.06]">
        <h3 className="text-xs font-medium text-pro-text-secondary">Palette</h3>
        {vb.palette.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {vb.palette.map((line, i) => {
              const hex = extractHex(line);
              return (
                <span
                  key={`${line}-${i}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-pro-elevated px-2 py-1 text-xs text-pro-text-secondary ring-1 ring-white/[0.08]"
                  title={line}
                >
                  {hex ? (
                    <span
                      className="size-5 shrink-0 rounded-md ring-1 ring-white/15"
                      style={{ backgroundColor: hex }}
                      aria-hidden
                    />
                  ) : null}
                  <span className="max-w-[8rem] truncate">{line}</span>
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#525252]">One hex or note per line — e.g. #0D7999</p>
        )}
        <label className="block text-xs text-pro-text-secondary">
          Edit swatches
          <textarea
            rows={3}
            className={FIELD}
            value={vb.palette.join("\n")}
            onChange={(e) =>
              onPatch((prev) => ({
                ...prev,
                palette: e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
          />
        </label>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-pro-text-secondary">
          Lens &amp; framing
          <textarea
            rows={2}
            className={FIELD}
            placeholder="24mm / 35mm spherical; wides with depth…"
            value={vb.lensAndFraming}
            onChange={(e) =>
              onPatch((prev) => ({ ...prev, lensAndFraming: e.target.value }))
            }
          />
        </label>
        <label className="block text-xs text-pro-text-secondary">
          Grain &amp; texture
          <textarea
            rows={2}
            className={FIELD}
            placeholder="Fine grain; gentle halation on highlights…"
            value={vb.grainAndTexture}
            onChange={(e) =>
              onPatch((prev) => ({ ...prev, grainAndTexture: e.target.value }))
            }
          />
        </label>
      </section>

      <label className="block text-xs text-pro-text-secondary">
        Avoid in external AI tools
        <textarea
          rows={2}
          className={FIELD}
          placeholder="No HDR glow, no oversaturated skin…"
          value={vb.negativePromptNotes}
          onChange={(e) =>
            onPatch((prev) => ({ ...prev, negativePromptNotes: e.target.value }))
          }
        />
      </label>

      <section className="space-y-2">
        <h3 className="text-xs font-medium text-pro-text-secondary">Visual consistency</h3>
        <ul className="space-y-2">
          {vb.consistencyChecklist.map((item, i) => (
            <li
              key={item.id}
              className={`flex items-start gap-3 rounded-xl px-3 py-2.5 ring-1 ${
                item.done
                  ? "bg-pro-elevated ring-white/[0.08]"
                  : "bg-pro-elevated/60 ring-white/[0.04]"
              }`}
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={(e) => {
                  const next = [...vb.consistencyChecklist];
                  next[i] = { ...next[i], done: e.target.checked };
                  onPatch((prev) => ({ ...prev, consistencyChecklist: next }));
                }}
                className="mt-0.5 size-4 shrink-0 rounded border-white/[0.12] accent-pro-primary"
              />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-pro-text outline-none focus:ring-1 focus:ring-white/20"
                value={item.label}
                onChange={(e) => {
                  const next = [...vb.consistencyChecklist];
                  next[i] = { ...next[i], label: e.target.value };
                  onPatch((prev) => ({ ...prev, consistencyChecklist: next }));
                }}
              />
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-pro-text-secondary ring-1 ring-white/10 hover:bg-white/5 hover:text-pro-text"
          onClick={() =>
            onPatch((prev) => ({
              ...prev,
              consistencyChecklist: [
                ...prev.consistencyChecklist,
                { id: `chk-${Date.now()}`, label: "New check", done: false },
              ],
            }))
          }
        >
          <Plus className="size-3.5" aria-hidden />
          Add check
        </button>
      </section>
    </div>
  );
}

function extractHex(line: string): string | null {
  const m = line.match(/#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\b/);
  return m ? `#${m[1]}` : null;
}
