"use client";

import { Download } from "lucide-react";
import { BUDGET_PATH_FEATURE, BUDGET_PATH_MICRO } from "@/lib/catalog-labels";

type BudgetLine = {
  name?: string;
  category?: string;
  price?: string;
  qty?: number;
  monthly?: number;
};

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function budgetCsv(title: string, tools: BudgetLine[], traditional: number): string {
  const rows = [
    ["Category", "Item", "Qty", "Monthly cost", "Line total", "Price on the card"],
    ...tools.map((tool) => {
      const qty = tool.qty || 1;
      const monthly = tool.monthly || 0;
      return [
        tool.category || "",
        tool.name || "",
        qty,
        monthly,
        monthly * qty,
        tool.price || "",
      ];
    }),
  ];
  const monthlyTotal = tools.reduce(
    (sum, tool) => sum + (tool.monthly || 0) * (tool.qty || 1),
    0
  );
  rows.push([]);
  rows.push(["", "Estimated monthly total", "", "", monthlyTotal, ""]);
  rows.push(["", "Traditional estimate", "", "", traditional, ""]);
  rows.push(["", "You save", "", "", traditional - monthlyTotal, ""]);
  rows.push([]);
  rows.push([
    "",
    title,
    "",
    "",
    "",
    "A line is counted only when the card states a monthly price. Free tiers, usage, and one-time purchases stay in the price column.",
  ]);
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export function BudgetSheetLinks({
  variant,
  tools,
  traditional,
}: {
  variant: "micro" | "low";
  tools: BudgetLine[];
  traditional: number;
}) {
  const pathName = variant === "micro" ? BUDGET_PATH_MICRO : BUDGET_PATH_FEATURE;
  const primary =
    variant === "micro"
      ? "bg-emerald-600 text-white hover:bg-emerald-700"
      : "bg-yellow-600 text-black hover:bg-yellow-500";

  function download() {
    const csv = budgetCsv(pathName, tools, traditional);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pathName.toLowerCase().replace(/\s+/g, "-")}-budget.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={download}
        className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-center text-sm font-medium transition-colors ${primary}`}
      >
        <Download className="size-4 shrink-0" aria-hidden />
        Download {pathName} .csv
      </button>
      <p className="text-center text-[11px] leading-snug text-[#666]">
        The file matches the list on this page, including any line you added or removed.
      </p>
    </div>
  );
}
