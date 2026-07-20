import { getToolByRank, rehydrateKitEntry, type Tool } from "@/app/data";

export type KitDisplayEntry = Tool & { catalogRank: number; qty: number; monthly: number };

export function kitEntriesFromState(kit: unknown[]): KitDisplayEntry[] {
  const out: KitDisplayEntry[] = [];
  for (const entry of kit) {
    const hydrated = rehydrateKitEntry(entry) as KitDisplayEntry | null;
    if (hydrated && typeof hydrated.name === "string") {
      out.push(hydrated);
    }
  }
  return out;
}

export function addToolToKit(kit: unknown[], rank: number): unknown[] {
  const tool = getToolByRank(rank);
  if (!tool) return kit;
  const hydrated = rehydrateKitEntry({ catalogRank: rank, qty: 1 }) as KitDisplayEntry;
  if (kitEntriesFromState(kit).some((k) => k.catalogRank === rank)) return kit;
  return [...kit, hydrated];
}

export function removeKitAtIndex(kit: unknown[], index: number): unknown[] {
  return kit.filter((_, i) => i !== index);
}

export function isToolInKit(kit: unknown[], rank: number): boolean {
  return kitEntriesFromState(kit).some((k) => k.catalogRank === rank);
}

export function kitMonthlyTotal(kit: unknown[]): number {
  return kitEntriesFromState(kit).reduce((sum, k) => sum + k.monthly * k.qty, 0);
}

export type BulkAddKitResult = {
  kit: unknown[];
  added: number;
  skipped: number;
};

/** Add multiple catalog ranks; skips duplicates and unknown ranks. */
export function addToolsToKit(kit: unknown[], ranks: number[]): BulkAddKitResult {
  let next = kit;
  let added = 0;
  let skipped = 0;
  for (const rank of ranks) {
    const before = kitEntriesFromState(next).length;
    next = addToolToKit(next, rank);
    const after = kitEntriesFromState(next).length;
    if (after > before) added += 1;
    else skipped += 1;
  }
  return { kit: next, added, skipped };
}
