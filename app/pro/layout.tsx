import type { Metadata } from "next";
import { ProWebShell } from "@/components/pro/ProWebShell";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "35mmAiPro — Script to prompt pack",
  description:
    "Paste your screenplay, lock your look, export copy-ready AI prompts for Midjourney, Kling, LTX, and more. Private beta — invite or waitlist.",
  alternates: {
    canonical: "/pro",
  },
  openGraph: {
    title: "35mmAiPro — Script to prompt pack",
    description:
      "Professional prompt packs from your script and look. Tool names and catalog links on every beat. Private beta.",
    type: "website",
    url: "/pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "35mmAiPro — Script to prompt pack",
    description:
      "Script + look → exportable prompt pack for classical filmmakers using external AI tools. Private beta.",
  },
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return <ProWebShell>{children}</ProWebShell>;
}
