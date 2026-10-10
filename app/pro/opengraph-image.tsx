import { ImageResponse } from "next/og";

export const alt =
  "35mmAiPro, $15 a month. Paste a screenplay, lock the look, copy a prompt for every shot.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const checks = [
  "A prompt for every shot in your script",
  "Your look locked into each one",
  "Paste them into Midjourney, Kling, LTX, and more",
];

export default function ProOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0b0b0b",
          color: "#f5f5f5",
          padding: "52px 68px 48px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 52, fontWeight: 800, letterSpacing: "0.08em" }}>
            <span style={{ color: "#e11d48" }}>35</span>
            <span style={{ color: "#ffffff" }}>mm</span>
            <span style={{ color: "#e11d48" }}>Ai</span>
          </div>
          <div
            style={{
              display: "flex",
              background: "#e11d48",
              color: "#ffffff",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.08em",
              padding: "10px 18px",
              borderRadius: 12,
            }}
          >
            PRO
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            marginTop: 28,
            border: "1px solid #8a7344",
            borderRadius: 28,
            padding: "40px 48px",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 380 }}>
            <div
              style={{
                display: "flex",
                color: "#c4a15a",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.16em",
              }}
            >
              PRO
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", marginTop: 8 }}>
              <span style={{ fontSize: 84, fontWeight: 700, lineHeight: 0.9, color: "#ffffff" }}>
                $15
              </span>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 600,
                  color: "#d4d4d4",
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                /mo
              </span>
            </div>
            <div style={{ display: "flex", marginTop: 14, color: "#a3a3a3", fontSize: 24 }}>
              USD · cancel anytime
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {checks.map((line) => (
              <div
                key={line}
                style={{ display: "flex", alignItems: "center", marginBottom: 18, fontSize: 28 }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: "#d6b25e",
                    marginRight: 16,
                  }}
                />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
