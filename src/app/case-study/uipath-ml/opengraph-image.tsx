import { ImageResponse } from "next/og";

export const alt = "Classifying 10K+ emails a month with RPA + ML — case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f7f5f1";
const INK = "#241f1c";
const MUTED = "#5c574f";
const LINE = "#e2ddd6";
const ACCENT = "#c2541f";

const METRICS = ["10K+ emails / month", "85-90% accuracy", "+70% throughput"];

export default function Image() {
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
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: ACCENT, textTransform: "uppercase" }}>
          Case Study / UiPath
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, maxWidth: 1000 }}>
            Classifying 10K+ emails a month with RPA + ML
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 30, color: MUTED }}>by Deepak Ramesh</div>
        </div>
        <div style={{ display: "flex", gap: 36, fontSize: 22, color: INK, borderTop: `1px solid ${LINE}`, paddingTop: 30 }}>
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
