import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account — 35mmAI",
  description: "Your 35mmAI account and 35mmPRO billing",
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
