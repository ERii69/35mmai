'use client';
import { GearItem } from '@/data/gear';
import { Plus, X } from 'lucide-react';

interface GearCardProps {
  item: GearItem;
  isSelected: boolean;
  onAdd: (item: GearItem) => void;
  onRemove: (id: string) => void;
}

export function GearCard({ item, isSelected, onAdd, onRemove }: GearCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-400/50 group transition-all">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-lg">{item.name}</div>
          <div className="text-sm text-zinc-500 mt-1">{item.category}</div>
        </div>
        {item.free ? (
          <span className="px-3 py-1 text-xs bg-emerald-400/10 text-emerald-400 rounded-full">FREE</span>
        ) : (
          <span className="text-xl font-semibold tabular-nums">${item.price}</span>
        )}
      </div>

      <button
        onClick={() => (isSelected ? onRemove(item.id) : onAdd(item))}
        className={`mt-6 w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
          isSelected
            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            : 'bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950'
        }`}
      >
        {isSelected ? (
          <>
            <X className="w-4 h-4" /> REMOVE
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" /> ADD TO KIT
          </>
        )}
      </button>
    </div>
  );
}