import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BLACKSITE // ops console";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#050505",
          color: "#ededed",
          fontFamily: "monospace",
          padding: 64,
          justifyContent: "space-between",
          backgroundImage:
            "linear-gradient(to right, #161616 1px, transparent 1px), linear-gradient(to bottom, #161616 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 18,
              height: 18,
              background: "#fff",
              boxShadow: "0 0 24px #fff",
            }}
          />
          <div style={{ fontSize: 26, letterSpacing: 8 }}>BLACKSITE</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 22, letterSpacing: 10, color: "#5a5a5a" }}>
            INTRUSION OPERATIONS CONSOLE
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1.05,
              marginTop: 18,
              letterSpacing: -1,
            }}
          >
            <span>SEE THE NETWORK.</span>
            <span>OWN THE NODE.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            letterSpacing: 4,
            color: "#5a5a5a",
          }}
        >
          <span>NODE GRAPH · ORBIT · TELEMETRY · SHELL</span>
          <span>CONCEPT PIECE // FABRICATED DATA</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
