import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 36,
          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #818cf8 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "white",
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: 72,
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          KN
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 18,
            marginTop: 8,
            opacity: 0.85,
            letterSpacing: "2px",
          }}
        >
          KAGENOVA
        </div>
      </div>
    ),
    { ...size }
  );
}
