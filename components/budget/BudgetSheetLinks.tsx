"use client";

import { Download, ExternalLink } from "lucide-react";
import {
  BUDGET_TEMPLATE_SHEETS,
  googleSpreadsheetExportUrl,
} from "@/app/data";

const linkBase =
  "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-center text-sm font-medium transition-colors";

export function BudgetSheetLinks({ variant }: { variant: "micro" | "low" }) {
  const sheet = BUDGET_TEMPLATE_SHEETS[variant];
  const exportUrl = googleSpreadsheetExportUrl(sheet.id, "xlsx");
  const primary =
    variant === "micro"
      ? "bg-emerald-600 text-white hover:bg-emerald-700"
      : "bg-yellow-600 text-black hover:bg-yellow-500";

  return (
    <div className="flex flex-col gap-2">
      <a
        href={sheet.editUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${linkBase} ${primary}`}
      >
        <ExternalLink className="size-4 shrink-0" aria-hidden />
        Open in Google Sheets
      </a>
      <a
        href={exportUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${linkBase} border border-[#444] bg-[#1a1a1a] text-[#e5e5e5] hover:border-[#555] hover:bg-[#222]`}
      >
        <Download className="size-4 shrink-0" aria-hidden />
        Download .xlsx
      </a>
      <p className="text-center text-[11px] leading-snug text-[#666]">
        On phones: <strong className="font-medium text-[#888]">Download</strong> saves a copy.
        <strong className="font-medium text-[#888]"> Open</strong> uses your browser or the Sheets
        app (sign in if prompted).
      </p>
    </div>
  );
}
