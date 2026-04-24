'use client';
import { useState, useEffect } from 'react';
import { gearData } from '@/data/gear';
import { Plus } from 'lucide-react';

export default function Spotlight() {
  const [featured, setFeatured] = useState(gearData[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const random = gearData[Math.floor(Math.random() * gearData.length)];
      setFeatured(random);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-amber-400/30 rounded-3xl p-8 flex items-center gap-8 film-grain">
      <div className="flex-1">
        <div className="uppercase text-amber-400 text-sm tracking-[4px]">SPOTLIGHT GEAR</div>
        <h3 className="text-4xl font-bold tracking-tighter mt-2">{featured.name}</h3>
        <p className="text-zinc-400 mt-3">
          {featured.category} • ${featured.price}/day
        </p>
      </div>
      <button
        onClick={() => {
          const event = new CustomEvent('addSpotlight', { detail: featured });
          window.dispatchEvent(event);
        }}
        className="flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold px-10 py-4 rounded-2xl transition-all active:scale-95"
      >
        <Plus className="w-5 h-5" /> ADD TO KIT
      </button>
    </div>
  );
}