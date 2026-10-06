import Link from "next/link";
import { PRO_DATA_RETENTION_DAYS } from "@/lib/pro/membership-policy";
import { BRAND_NAME, BRAND_NAME_PRO } from "@/lib/brand/brand-identity";
import { PRO_MARKETING_PRICE } from "@/lib/pro/marketing-copy";

export function ProTermsContent() {
  return (
    <>
      <p className="text-sm text-[#737373]">Last updated: October 4, 2026 · {BRAND_NAME} and {BRAND_NAME_PRO}</p>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">The service</h2>
        <p>
          {BRAND_NAME_PRO} is a paid membership ({PRO_MARKETING_PRICE.fullLabel} USD, billed monthly,
          no free trial) that gives you a private workspace for production prep: projects, prompts,
          and exports. The free {BRAND_NAME} catalog at{" "}
          <Link href="/" className="text-pro-primary underline-offset-2 hover:underline">
            home
          </Link>{" "}
          remains separate and does not require a subscription.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Your content</h2>
        <p>
          You keep ownership of what you write and upload (scripts, notes, scene lists). You grant
          us only the rights needed to store, back up, and display it back to you in the workspace
          and exports. We do not claim ownership of your film ideas.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Acceptable use</h2>
        <p>
          Do not use {BRAND_NAME_PRO} for illegal content, harassment, or attempts to break into other
          accounts. Do not scrape or reverse-engineer the service. One membership is for one person&apos;s
          account unless we explicitly offer team plans later. The service is not directed at children
          under 13.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Billing &amp; cancellation</h2>
        <p>
          {PRO_MARKETING_PRICE.fullLabel} USD renews each month until you cancel in the Stripe billing
          portal (Account → Manage billing). There is no free trial. Canceling stops the next
          charge. You keep access until the end of the period you already paid for. We do not refund
          that current period, except where the law requires a refund.
        </p>
        <p>
          On cancel, project data is handled as described in our{" "}
          <Link href="/pro/privacy" className="text-pro-primary underline-offset-2 hover:underline">
            Privacy &amp; data
          </Link>{" "}
          policy: retain for {PRO_DATA_RETENTION_DAYS} days after access ends, then delete workspace
          content unless you resubscribe.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Disclaimer</h2>
        <p>
          The service is provided as-is during early rollout. We improve reliability over time but
          do not guarantee uninterrupted access. Export your prep packets regularly — that is your
          backup copy.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Privacy</h2>
        <p>
          Read the full{" "}
          <Link href="/pro/privacy" className="text-pro-primary underline-offset-2 hover:underline">
            Privacy &amp; data policy
          </Link>{" "}
          for how we handle account-only storage, no sale of data, and no model training on your
          scripts.
        </p>
      </section>
    </>
  );
}
