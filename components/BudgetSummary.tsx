'use client';
import { GearItem } from '@/data/gear';
import { X } from 'lucide-react';

interface BudgetSummaryProps {
  total: number;
  selectedGear: GearItem[];
  role: string;
}

export default function BudgetSummary({ total, selectedGear, role }: BudgetSummaryProps) {
  return (
    <div className="sticky top-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
      <div className="uppercase text-xs tracking-[3px] text-amber-400 mb-2">YOUR {role.toUpperCase()} KIT</div>
      <div className="text-6xl font-bold tabular-nums tracking-tighter mb-8">${total}</div>

      <div className="space-y-4 max-h-[460px] overflow-auto pr-2 custom-scroll">
        {selectedGear.length === 0 ? (
          <p className="text-zinc-500 italic">Your kit is empty. Add some gear!</p>
        ) : (
          selectedGear.map((item) => (
            <div key={item.id} className="flex justify-between items-center group">
              <div className="flex-1">
                <div className="text-sm">{item.name}</div>
                <div className="text-xs text-zinc-500">{item.category}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="tabular-nums text-sm">${item.price}</span>
                <button
                  onClick={() => {
                    const event = new CustomEvent('removeFromSummary', { detail: item.id });
                    window.dispatchEvent(event);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedGear.length > 0 && (
        <div className="mt-8 pt-6 border-t border-zinc-800 text-xs text-zinc-500 flex justify-between">
          <span>EST. DAILY RENTAL</span>
          <span className="text-emerald-400">READY TO SHOOT</span>
        </div>
      )}
    </div>
  );
}