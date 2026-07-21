"use client";

import dynamic from "next/dynamic";
import { ProSkeleton } from "@/components/pro/ux/ProSkeleton";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  projectId: string;
  projectName: string;
  initialState: ProjectStatePayload;
  initialUpdatedAt: string;
  claudeAgentsEnabled: boolean;
  openWorkflowInitially?: boolean;
};

function WorkspaceChunkLoading() {
  return (
    <div className="space-y-4 pb-20 md:space-y-6" aria-busy="true" aria-label="Loading workspace">
      <div className="flex items-center justify-between gap-3">
        <ProSkeleton className="h-7 w-40" />
        <ProSkeleton className="h-8 w-16 rounded-lg" />
      </div>
      <ProSkeleton className="h-11 w-full rounded-xl md:hidden" />
      <ProSkeleton className="h-10 w-full rounded-lg md:hidden" />
      <div className="flex gap-2 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <ProSkeleton key={i} className="h-9 w-24 shrink-0 rounded-lg" />
        ))}
      </div>
      <ProSkeleton className="h-[min(60vh,28rem)] w-full rounded-2xl" />
    </div>
  );
}

const ProWorkspace = dynamic(
  () => import("@/components/pro/ProWorkspace").then((m) => m.ProWorkspace),
  {
    loading: () => <WorkspaceChunkLoading />,
  }
);

/** Lazy-loads the heavy workspace bundle in a separate chunk (avoids dev chunk timeouts). */
export function ProWorkspaceClientLoader(props: Props) {
  return <ProWorkspace {...props} />;
}
