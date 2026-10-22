import { ImageResponse } from "next/og";

export const alt = "Healthcare Knowledge Navigator: evidence-based clinical answers with citations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0f766e",
          color: "white",
        }}
      >
        <div style={{ fontSize: 36, opacity: 0.85 }}>Healthcare Knowledge Navigator</div>
        <div style={{ fontSize: 68, fontWeight: 700, marginTop: 24, lineHeight: 1.1 }}>
          Evidence-based clinical answers, with citations
        </div>
        <div style={{ fontSize: 32, marginTop: 32, opacity: 0.85 }}>
          Guidelines and research · Confidence scoring · Every claim sourced
        </div>
      </div>
    ),
    size,
  );
}
