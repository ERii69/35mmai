import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "New password — 35mmAiPro",
  description: "Choose a new password for your 35mmAiPro account",
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
