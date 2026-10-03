import type { Metadata } from "next";
import { catalogPageTitle } from "@/lib/catalog-metadata";

export const metadata: Metadata = {
  title: catalogPageTitle("About"),
  description:
    "Independent AI tool directory for indie filmmakers — how we curate listings, common questions, and contact.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
