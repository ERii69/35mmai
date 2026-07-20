"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { proBtn, proSurface } from "@/components/pro/ux/pro-surfaces";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

function isChunkLoadError(error: Error): boolean {
  return (
    error.name === "ChunkLoadError" ||
    /loading chunk .* failed/i.test(error.message) ||
    /failed to fetch dynamically imported module/i.test(error.message)
  );
}

export default function ProWorkspaceError({ error, reset }: Props) {
  const chunkError = isChunkLoadError(error);

  useEffect(() => {
    console.error("[ProWorkspace]", error);
  }, [error]);

  return (
    <div className={`${proSurface.section} mx-auto max-w-lg space-y-4 p-6 text-center`}>
      <h2 className="text-lg font-semibold text-pro-text">Workspace didn&apos;t load</h2>
      <p className="text-sm text-pro-text-secondary">
        {chunkError
          ? "The app updated while this tab was open, or the dev server is still compiling. Reload to fetch the latest bundle."
          : error.message || "Something went wrong opening this project."}
      </p>
      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        <Button
          type="button"
          className={proBtn.primary}
          onClick={() => window.location.reload()}
        >
          Reload workspace
        </Button>
        <Button type="button" variant="outline" className={proBtn.outline} onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
