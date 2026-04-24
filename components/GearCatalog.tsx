'use client';
import { GearItem } from '@/data/gear';
import { gearData } from '@/data/gear';
import { GearCard } from './GearCard';
interface GearCatalogProps {
  searchTerm: string;
  showFreeOnly: boolean;
  selectedGear: GearItem[];
  onAdd: (item: GearItem) => void;
  onRemove: (id: string) => void;
}

export default function GearCatalog({
  searchTerm,
  showFreeOnly,
  selectedGear,
  onAdd,
  onRemove,
}: GearCatalogProps) {
  const filtered = gearData
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFree = !showFreeOnly || item.free;
      return matchesSearch && matchesFree;
    })
    .sort((a, b) => (a.free === b.free ? 0 : a.free ? -1 : 1));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filtered.map((item) => (
        <GearCard
          key={item.id}
          item={item}
          isSelected={selectedGear.some((g) => g.id === item.id)}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      ))}
      {filtered.length === 0 && (
        <div className="col-span-full text-center py-20 text-zinc-500">No gear found matching your filters.</div>
      )}
    </div>
  );
}