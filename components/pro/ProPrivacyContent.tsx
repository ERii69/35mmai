import Link from "next/link";
import { SITE_CONTACT_EMAIL } from "@/app/data";
import { PRO_DATA_RETENTION_DAYS } from "@/lib/pro/membership-policy";
import { BRAND_NAME, BRAND_NAME_PRO } from "@/lib/brand/brand-identity";

export function ProPrivacyContent() {
  return (
    <>
      <p className="text-sm text-[#737373]">
        Last updated: October 4, 2026 · Applies to the {BRAND_NAME} catalog and {BRAND_NAME_PRO}.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Your private account</h2>
        <p>
          {BRAND_NAME_PRO} is a <strong>private workspace</strong> for your film prep — scripts,
          scene breakdowns, kit, budget, and exports. It is not a social feed, gallery, or
          collaboration network. There are <strong>no public project links</strong>, no team seats,
          and no publish buttons. Other customers cannot open your projects.
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
            our models, and we do not sell that content. Your screenplay is saved to your account.
            AI assist is off unless we turn it on for the product. If it is on, the text needed for
            that request may be sent to the AI provider to run it. That provider&apos;s own terms
            then apply to that request.
          </li>
          <li>
            <strong>We do not expose</strong> your projects on the public {BRAND_NAME} catalog or in
            search engines.
          </li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Who can access your data</h2>
        <p>
          You, when signed in with an active membership (or during the post-cancel retention window
          below). Our hosting, database, and payment providers process data only to run the service.
          We do not offer a shared workspace.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Free catalog</h2>
        <p>
          The {BRAND_NAME} directory does not require an account. My Kit and the filters you choose
          stay in your browser on that device. We do not upload that kit to our database.
        </p>
        <p>
          Some tool links are affiliate links. If you buy or subscribe through one, the partner may
          know the click came from {BRAND_NAME}, and we may earn a commission at no extra cost to
          you. Those links are labeled. Rankings are editorial, not paid placement.
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
          Contact us at{" "}
          <a
            href={`mailto:${SITE_CONTACT_EMAIL}`}
            className="text-pro-primary underline-offset-2 hover:underline"
          >
            {SITE_CONTACT_EMAIL}
          </a>
          . For billing, use Account → Manage billing (Stripe Customer Portal).
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
