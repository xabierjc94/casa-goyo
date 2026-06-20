import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: "#7B1527",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(184,135,11,0.45)",
        }}
      >
        <span
          style={{
            color: "#FAF0E6",
            fontSize: 22,
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            lineHeight: 1,
            paddingTop: 2,
          }}
        >
          G
        </span>
      </div>
    ),
    { ...size }
  )
}
