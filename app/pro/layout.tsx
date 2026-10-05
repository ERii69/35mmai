import type { Metadata } from "next";
import { ProWebShell } from "@/components/pro/ProWebShell";
import { isProLiveRelease } from "@/lib/pro/launch-flags";
import { PRO_MARKETING_PRICE } from "@/lib/pro/marketing-copy";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const live = isProLiveRelease();
const description = live
  ? `Paste your screenplay, lock your look, and export copy-ready prompts for Midjourney, Kling, LTX, and more. ${PRO_MARKETING_PRICE.trialThenLabel}.`
  : "Paste your screenplay, lock your look, export copy-ready AI prompts for Midjourney, Kling, LTX, and more. Private beta — invite or waitlist.";
const socialDescription = live
  ? `Script + look → a prompt pack for the tools you already use. ${PRO_MARKETING_PRICE.fullLabel} subscription.`
  : "Script + look → exportable prompt pack for classical filmmakers using external AI tools. Private beta.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "35mmAiPro — Script to prompt pack",
  description,
  alternates: {
    canonical: "/pro",
  },
  openGraph: {
    title: "35mmAiPro — Script to prompt pack",
    description: socialDescription,
    type: "website",
    url: "/pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "35mmAiPro — Script to prompt pack",
    description: socialDescription,
  },
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return <ProWebShell>{children}</ProWebShell>;
}
