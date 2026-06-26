import { ImageResponse } from "next/og";

export const alt = "Deepak Ramesh — AI Engineer · LLM Pipelines & Automation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f7f5f1";
const INK = "#241f1c";
const MUTED = "#5c574f";
const LINE = "#e2ddd6";
const ACCENT = "#c2541f";

const METRICS = [
  "5 to 32 sites in 4 weeks",
  "live WhatsApp SaaS",
  "10K+ emails / month classified",
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          color: INK,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 4,
            color: ACCENT,
            textTransform: "uppercase",
          }}
        >
          AI Engineer / LLM Pipelines &amp; Automation
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, letterSpacing: -2 }}>
            Deepak Ramesh
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 36, color: MUTED, maxWidth: 920, lineHeight: 1.25 }}>
            I ship LLM-integrated products and the systems that build them, fast.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 36,
            fontSize: 23,
            color: INK,
            borderTop: `1px solid ${LINE}`,
            paddingTop: 30,
          }}
        >
          {METRICS.map((m) => (
            <div key={m} style={{ display: "flex", gap: 10 }}>
              <span style={{ color: ACCENT }}>/</span>
              <span>{m}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
