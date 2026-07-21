"use client";

import { rehydrateKitEntry } from "@/app/data";
import { currencySymbol } from "@/lib/pro/currency-options";

type Line = {
  name: string;
  monthly: number;
  qty: number;
};

function linesFromUnknown(rows: unknown[]): Line[] {
  const out: Line[] = [];
  for (const row of rows) {
    const h = rehydrateKitEntry(row) as Record<string, unknown> | null;
    if (!h || typeof h.name !== "string") continue;
    const monthly = typeof h.monthly === "number" ? h.monthly : 15;
    const qty = typeof h.qty === "number" && h.qty > 0 ? h.qty : 1;
    out.push({ name: h.name, monthly, qty });
  }
  return out;
}

type Props = {
  microTools: unknown[];
  lowTools: unknown[];
  currency: string;
};

export function BudgetCostChart({ microTools, lowTools, currency }: Props) {
  const sym = currencySymbol(currency);
  const micro = linesFromUnknown(microTools);
  const low = linesFromUnknown(lowTools);
  const all = [
    ...micro.map((l) => ({ ...l, band: "Micro" as const })),
    ...low.map((l) => ({ ...l, band: "Low" as const })),
  ];

  if (all.length === 0) {
    return (
      <p className="text-sm text-pro-text-secondary">
        Run a budget suggestion or apply a template to see cost distribution.
      </p>
    );
  }

  const total = all.reduce((s, l) => s + l.monthly * l.qty, 0);
  const microTotal = micro.reduce((s, l) => s + l.monthly * l.qty, 0);
  const lowTotal = low.reduce((s, l) => s + l.monthly * l.qty, 0);
  const max = Math.max(...all.map((l) => l.monthly * l.qty), 1);

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-pro-elevated px-4 py-4 ring-1 ring-white/[0.06]">
        <p className="text-xs font-semibold uppercase tracking-wider text-pro-text-secondary">
          Est. monthly tool spend
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-pro-text">
          {sym}
          {total.toFixed(0)}
          <span className="ml-2 text-sm font-normal text-pro-text-secondary">{currency}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-pro-text-secondary">
          <span>
            Micro:{" "}
            <span className="font-semibold text-pro-text">
              {sym}
              {microTotal.toFixed(0)}
            </span>
          </span>
          {lowTotal > 0 ? (
            <span>
              Low:{" "}
              <span className="font-semibold text-pro-warning">
                {sym}
                {lowTotal.toFixed(0)}
              </span>
            </span>
          ) : null}
          <span>{all.length} line items</span>
        </div>
      </div>

      <ul className="space-y-3" aria-label="Budget cost breakdown">
        {all.slice(0, 12).map((line, i) => {
          const cost = line.monthly * line.qty;
          const width = Math.max(6, Math.round((cost / max) * 100));
          return (
            <li key={`${line.name}-${i}`}>
              <div className="flex justify-between gap-2 text-xs">
                <span className="truncate text-pro-text">
                  <span
                    className={`mr-1.5 inline-block rounded px-1 py-0.5 text-[10px] font-medium uppercase ${
                      line.band === "Micro"
                        ? "bg-white/[0.06] text-pro-text-secondary"
                        : "bg-pro-warning/10 text-pro-warning/80"
                    }`}
                  >
                    {line.band}
                  </span>
                  {line.name}
                </span>
                <span className="shrink-0 tabular-nums font-medium text-pro-text-secondary">
                  {sym}
                  {cost.toFixed(0)}/mo
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-pro-muted ring-1 ring-white/[0.04]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    line.band === "Micro"
                      ? "bg-gradient-to-r from-zinc-500/90 to-zinc-400/60"
                      : "bg-gradient-to-r from-pro-warning/70 to-pro-warning/45"
                  }`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      {all.length > 12 ? (
        <p className="text-xs text-pro-text-secondary">+ {all.length - 12} more line items</p>
      ) : null}
    </div>
  );
}
