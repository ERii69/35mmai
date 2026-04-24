'use client';
import { Camera, Users, Lightbulb, Mic } from 'lucide-react';

const roles = [
  { name: 'Cinematographer', icon: Camera, color: 'amber' },
  { name: 'Photographer', icon: Camera, color: 'emerald' },
  { name: 'Gaffer', icon: Lightbulb, color: 'orange' },
  { name: 'Sound Recordist', icon: Mic, color: 'sky' },
  { name: 'Director', icon: Users, color: 'violet' },
];

interface RoleSelectorProps {
  onSelect: (role: string) => void;
}

export default function RoleSelector({ onSelect }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
      {roles.map((role) => {
        const Icon = role.icon;
        return (
          <button
            key={role.name}
            onClick={() => onSelect(role.name)}
            className="group flex flex-col items-center justify-center p-8 rounded-2xl border border-zinc-800 hover:border-amber-400 hover:bg-zinc-900/50 transition-all duration-300"
          >
            <div className={`w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-10 h-10 text-${role.color}-400`} />
            </div>
            <span className="text-xl font-medium text-zinc-100 tracking-tight">{role.name}</span>
          </button>
        );
      })}
    </div>
  );
}