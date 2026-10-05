import { proMarketing } from "@/components/pro/pro-marketing-surfaces";
import { moreScriptWorkflowChoices, PRIMARY_WORKFLOW_CHOICES } from "@/lib/pro/workflow-choices";

type Props = {
  sectionId?: string;
  headingId?: string;
};

/** Primary workflows on /pro — Script to prompt featured among peers. */
export function ProMarketingWorkflowsSection({
  sectionId = "pro-workflows",
  headingId = "pro-workflows-heading",
}: Props) {
  const moreCount = moreScriptWorkflowChoices().length;

  return (
    <section id={sectionId} aria-labelledby={headingId} className={proMarketing.section}>
      <div className="space-y-1 text-center">
        <h2 id={headingId} className="text-lg font-semibold text-pro-text md:text-xl">
          Start from a workflow
        </h2>
        <p className="mx-auto max-w-xl text-sm text-pro-text-secondary">
          Script to prompt is the default. Switch anytime in the studio.
        </p>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {PRIMARY_WORKFLOW_CHOICES.map((choice) => {
          const featured = choice.id === "director-prep-script-to-prompt";
          return (
            <li
              key={choice.id}
              className="flex flex-col rounded-xl border border-white/[0.08] bg-pro-elevated/70 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-pro-text">{choice.label}</h3>
                {choice.badge ? (
                  <span className={featured ? proMarketing.accentBadge : "rounded-full border border-white/10 px-2 py-px text-[10px] font-semibold text-pro-text-secondary"}>
                    {featured ? "Default" : choice.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-pro-text-secondary sm:text-sm">
                {choice.description}
              </p>
            </li>
          );
        })}
      </ul>

      {moreCount > 0 ? (
        <p className="mt-3 text-center text-xs text-pro-text-secondary">
          {moreCount} more workflows open in the studio after you sign up.
        </p>
      ) : null}
    </section>
  );
}
