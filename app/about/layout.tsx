import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — 35mmAI",
  description:
    "Independent AI tool directory for indie filmmakers — how we curate listings, common questions, and contact.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
