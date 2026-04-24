'use client';
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface FreeToggleProps {
  showFreeOnly: boolean;
  onToggle: (show: boolean) => void;
}

export default function FreeToggle({ showFreeOnly, onToggle }: FreeToggleProps) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <button
        onClick={() => onToggle(!showFreeOnly)}
        className="flex items-center gap-3 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
      >
        {showFreeOnly ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7" />}
        SHOW FREE ONLY
      </button>
      <div className="text-xs text-zinc-500">(software, personal gear, trials)</div>
    </div>
  );
}