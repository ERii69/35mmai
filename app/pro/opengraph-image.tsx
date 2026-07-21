import { ImageResponse } from "next/og";
import { PRO_MARKETING_HEADLINE, PRO_MARKETING_HERO } from "@/lib/pro/marketing-copy";

export const alt = "35mmAiPro — Script to prompt pack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ProOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251, 191, 36, 0.12), transparent 60%)",
          padding: 64,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "#FBBF24",
            marginBottom: 24,
          }}
        >
          35mmAiPro
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#F5F5F7",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          {PRO_MARKETING_HERO}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 32,
            fontWeight: 600,
            color: "#B4B4BA",
            textAlign: "center",
            maxWidth: 820,
          }}
        >
          {PRO_MARKETING_HEADLINE}
        </div>
      </div>
    ),
    { ...size }
  );
}
