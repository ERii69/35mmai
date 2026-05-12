import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — 35mmAI",
  description: "Create a 35mmAI account",
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
