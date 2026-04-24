'use client';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-5 top-4 text-zinc-500 w-5 h-5" />
      <input
        type="text"
        placeholder="Search gear... (e.g. Alexa, Ronin, SkyPanel)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-2xl pl-14 py-4 text-lg placeholder-zinc-500 outline-none"
      />
    </div>
  );
}