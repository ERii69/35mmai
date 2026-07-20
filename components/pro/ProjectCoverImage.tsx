"use client";

import { Clapperboard } from "lucide-react";
import type { ProjectCover } from "@/lib/pro/project-cover";

type Props = {
  cover: ProjectCover;
  className?: string;
  priority?: boolean;
};

export function ProjectCoverImage({ cover, className = "" }: Props) {
  if (cover.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cover.imageUrl}
        alt={cover.alt}
        className={`size-full object-cover ${className}`}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`relative flex size-full items-center justify-center ${className}`}
      style={{ background: cover.gradient }}
      role="img"
      aria-label={cover.alt}
    >
      <Clapperboard className="size-10 text-white/20" aria-hidden />
    </div>
  );
}
