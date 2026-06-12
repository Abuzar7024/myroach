import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0f",
          borderRadius: 6,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <ellipse cx="16" cy="18" rx="9" ry="6" fill="#00f0ff" opacity="0.95" />
          <ellipse cx="16" cy="14" rx="5" ry="4" fill="#111118" stroke="#00f0ff" strokeWidth="1.2" />
          <circle cx="13.5" cy="13.5" r="1" fill="#ff00aa" />
          <circle cx="18.5" cy="13.5" r="1" fill="#ff00aa" />
          <path
            d="M7 17 L3 14 M7 19 L2 19 M7 21 L3 24 M25 17 L29 14 M25 19 L30 19 M25 21 L29 24 M16 22 L14 28 M16 22 L18 28"
            stroke="#00f0ff"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
