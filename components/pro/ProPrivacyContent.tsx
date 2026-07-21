import Link from "next/link";
import { PRO_DATA_RETENTION_DAYS } from "@/lib/pro/membership-policy";

export function ProPrivacyContent() {
  return (
    <>
      <p className="text-sm text-[#737373]">
        Last updated: May 2026 · Applies to 35mmAiPro membership and workspace (
        <code className="text-[#a3a3a3]">/pro/app</code>).
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Your private account</h2>
        <p>
          35mmAiPro is a <strong>private workspace</strong> for your film prep — scripts, scene
          breakdowns, kit, budget, and exports. It is not a social feed, gallery, or collaboration
          network in v1. There are <strong>no public project links</strong>, no team seats, and no
          publish buttons. Only <strong>you</strong>, signed in to <strong>your account</strong>,
          can open your projects.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">What we store</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Account email and authentication data (Supabase Auth).</li>
          <li>Billing status with Stripe (we do not store full card numbers).</li>
          <li>
            Project names and workspace JSON: world bible, Director&apos;s Prep (including script
            text you paste), kit, workflow, budget, and related fields.
          </li>
        </ul>
        <p>
          Data is stored in our database (Supabase Postgres) and is scoped to your user id using{" "}
          <strong>row-level security</strong> — the API only returns rows that belong to your
          account.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">What we do not do</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>We do not sell</strong> your personal information or project content to third
            parties.
          </li>
          <li>
            <strong>We do not use</strong> your scripts, scene rows, or workspace content to train
            AI models. When server AI assist is off (no provider API key), prep stays local /
            API-free and we do not send your screenplay to an LLM. When AI assist is enabled, relevant
            project text may be sent to that provider to run the request — still not used to train
            their or our models under our configuration.
          </li>
          <li>
            <strong>We do not expose</strong> your projects on the public 35mmAI catalog or in
            search engines.
          </li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Who can access your data</h2>
        <p>
          You, when signed in with an active membership (or during the post-cancel retention window
          below). Our infrastructure providers (hosting, database, payments) process data only to
          run the service — under their terms and our configuration. We do not offer a shared
          workspace or producer view in v1.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">When you cancel</h2>
        <p>
          If you cancel your subscription, you keep Pro access until the end of the current billing
          period. After that:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            For <strong>{PRO_DATA_RETENTION_DAYS} days</strong>, we retain your projects so you can
            sign in, export CSV/Markdown, or resubscribe.
          </li>
          <li>
            After <strong>{PRO_DATA_RETENTION_DAYS} days</strong> without an active subscription, we
            delete your projects and workspace content from our database.
          </li>
          <li>
            Export anything you need before that window ends. Billing records may be kept longer
            where required for tax and Stripe reconciliation.
          </li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Security</h2>
        <p>
          Traffic uses HTTPS in production. Passwords are handled by our auth provider; we do not
          store them in plain text. Treat your account like a bank login: use a strong unique
          password and do not share it.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Questions</h2>
        <p>
          Contact us via the email on the{" "}
          <Link href="/about" className="text-pro-primary underline-offset-2 hover:underline">
            About
          </Link>{" "}
          page. For billing, use Account → Manage billing (Stripe Customer Portal).
        </p>
        <p className="text-sm text-[#737373]">
          See also{" "}
          <Link href="/pro/terms" className="text-pro-primary underline-offset-2 hover:underline">
            Terms of use
          </Link>
          .
        </p>
      </section>
    </>
  );
}
