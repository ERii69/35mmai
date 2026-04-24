'use client';
import { Trash2, Download } from 'lucide-react';

interface ResetButtonsProps {
  onReset: () => void;
}

export default function ResetButtons({ onReset }: ResetButtonsProps) {
  const exportKit = () => {
    const kit = JSON.parse(localStorage.getItem('selectedGear') || '[]');
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(kit, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', '35mmAI_kit.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={onReset}
        className="flex-1 flex items-center justify-center gap-2 py-4 border border-zinc-700 hover:border-red-500/50 rounded-2xl text-sm font-medium transition-colors"
      >
        <Trash2 className="w-4 h-4" /> RESET KIT
      </button>
      <button
        onClick={exportKit}
        className="flex-1 flex items-center justify-center gap-2 py-4 bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 rounded-2xl text-sm font-medium transition-all"
      >
        <Download className="w-4 h-4" /> EXPORT KIT
      </button>
    </div>
  );
}