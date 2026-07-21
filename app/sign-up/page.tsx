import { SignUpForm } from "@/components/auth/SignUpForm";
import { isProPublicCheckoutEnabled } from "@/lib/pro/launch-flags";

export default function SignUpPage() {
  return <SignUpForm checkoutEnabled={isProPublicCheckoutEnabled()} />;
}
