import { Barlow_Condensed } from "next/font/google";

/** Condensed cinematic sans for the wordmark */
export const brandDisplayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-cinema",
  display: "swap",
});
