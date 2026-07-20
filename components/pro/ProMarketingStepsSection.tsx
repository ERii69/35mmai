import { PRO_MARKETING_STEPS } from "@/lib/pro/marketing-steps";
import { proMarketing } from "@/components/pro/pro-marketing-surfaces";

type Props = {
  sectionId?: string;
  headingId?: string;
  /** Hint for entitled users on the Script tab. */
  showEntitledHint?: boolean;
};

/** Three-step orientation — pick workflow, prep, export. */
export function ProMarketingStepsSection({
  sectionId = "pro-steps",
  headingId = "pro-steps-heading",
  showEntitledHint = false,
}: Props) {
  return (
    <section id={sectionId} aria-labelledby={headingId} className={proMarketing.section}>
      <div className="space-y-1 text-center md:text-left">
        <h2 id={headingId} className="text-lg font-semibold text-pro-text md:text-xl">
          How it works
        </h2>
        <p className="text-sm text-pro-text-secondary">Three steps from template to prompt pack.</p>
      </div>

      <ol className="mt-4 space-y-3">
        {PRO_MARKETING_STEPS.map(({ step, title, body }) => (
          <li
            key={step}
            className="flex gap-3 rounded-xl border border-white/[0.08] bg-pro-elevated/60 p-4"
          >
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-pro-accent/15 text-xs font-bold text-pro-accent-bright ring-1 ring-pro-accent/25"
              aria-hidden
            >
              {step}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-pro-text">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-pro-text-secondary sm:text-sm">
                {body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {showEntitledHint ? (
        <p className="mt-3 text-center text-xs text-pro-text-secondary md:text-left">
          In the studio: pick a workflow on the dashboard, then paste your script on the Script tab.
        </p>
      ) : null}
    </section>
  );
}
