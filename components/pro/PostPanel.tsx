"use client";

import { PostDeliverablesPanel } from "@/components/pro/post/PostDeliverablesPanel";
import { PostKitPanel } from "@/components/pro/post/PostKitPanel";
import { PostLookHandoffPanel } from "@/components/pro/post/PostLookHandoffPanel";
import { PostPipelinePanel } from "@/components/pro/post/PostPipelinePanel";
import { PostSignOffPanel } from "@/components/pro/post/PostSignOffPanel";
import { PostSummaryStrip } from "@/components/pro/post/PostSummaryStrip";
import type { PostTabId } from "@/lib/pro/workspace-modes";
import type { ProjectStatePayload } from "@/lib/pro/types";

type Props = {
  state: ProjectStatePayload;
  postTab: PostTabId;
  updateState: (fn: (p: ProjectStatePayload) => ProjectStatePayload) => void;
  onGoToLook?: () => void;
  onGoToPostKitTab?: () => void;
};

export function PostPanel({
  state,
  postTab,
  updateState,
  onGoToLook,
  onGoToPostKitTab,
}: Props) {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold text-pro-text">Post-production</h2>
        <p className="mt-2 max-w-xl text-[15px] leading-normal text-pro-text-secondary">
          Edit, grade, and deliver — pipeline, kit, look handoff, and sign-off in one place.
        </p>
      </header>

      <PostSummaryStrip state={state} />

      {postTab === "pipeline" ? (
        <PostPipelinePanel
          state={state}
          updateState={updateState}
          onGoToPostKit={onGoToPostKitTab}
        />
      ) : null}
      {postTab === "kit" ? <PostKitPanel state={state} updateState={updateState} /> : null}
      {postTab === "look-handoff" ? (
        <PostLookHandoffPanel state={state} updateState={updateState} onGoToLook={onGoToLook} />
      ) : null}
      {postTab === "deliverables" ? (
        <PostDeliverablesPanel state={state} updateState={updateState} />
      ) : null}
      {postTab === "checklist" ? (
        <section>
          <h3 className="text-sm font-semibold text-pro-text">Sign-off</h3>
          <div className="mt-4">
            <PostSignOffPanel state={state} updateState={updateState} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
