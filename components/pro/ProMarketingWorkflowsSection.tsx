import { Sparkles } from "lucide-react";
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
      <div className="space-y-1 text-center md:text-left">
        <h2 id={headingId} className="text-lg font-semibold text-pro-text md:text-xl">
          Workflows
        </h2>
        <p className="text-sm text-pro-text-secondary">
          Script to prompt is the default — Classical AI and Blank sit alongside it. Switch anytime in
          the studio.
        </p>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {PRIMARY_WORKFLOW_CHOICES.map((choice) => {
          const featured = choice.id === "director-prep-script-to-prompt";
          return (
            <li
              key={choice.id}
              className={`flex flex-col rounded-xl border p-4 ${
                featured
                  ? "border-pro-accent/30 bg-pro-accent/[0.06] ring-1 ring-pro-accent/15"
                  : "border-white/[0.08] bg-pro-elevated/90"
              }`}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                {featured ? (
                  <Sparkles className={`size-3.5 shrink-0 ${proMarketing.heroIcon}`} aria-hidden />
                ) : null}
                <h3 className="text-sm font-semibold text-pro-text">{choice.label}</h3>
                {choice.badge ? (
                  <span className={proMarketing.accentBadge}>
                    {featured ? "Recommended" : choice.badge}
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
        <p className="mt-4 text-center text-xs text-pro-text-secondary md:text-left">
          + {moreCount} more in the studio after you sign up.
        </p>
      ) : null}
    </section>
  );
}
