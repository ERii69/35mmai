import { redirect } from "next/navigation";
import { CATALOG_PATHS } from "@/lib/catalog-routes";

/** How it works lives on the About page. */
export default function HowItWorksPage() {
  redirect(`${CATALOG_PATHS.about}#how-it-works`);
}
