import { ImageResponse } from "next/og";

// Branded Open Graph / social card. Statically generated at build time, so it
// works with `output: "export"`. Next injects the og:image + twitter:image tags
// (resolved against `metadataBase`) on every page automatically.
export const alt = "Finance with Kunal — Global Markets & Economic Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Required for `output: "export"` — render this image once at build time.
export const dynamic = "force-static";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "linear-gradient(135deg, #f7f6fc 0%, #ece9fb 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", width: "6px", height: "34px", background: "#7c3aed", borderRadius: "3px" }} />
          <div
            style={{
              display: "flex",
              fontSize: "28px",
              letterSpacing: "8px",
              color: "#7c3aed",
              textTransform: "uppercase",
            }}
          >
            Finance with Kunal
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "82px",
            fontWeight: 700,
            color: "#1e1b3a",
            marginTop: "28px",
            lineHeight: 1.05,
            maxWidth: "920px",
          }}
        >
          Data. Insight. Action. Beyond the ticker.
        </div>

        <div style={{ display: "flex", fontSize: "30px", color: "#524b7a", marginTop: "30px" }}>
          Markets · Global Economy · Commentary
        </div>
      </div>
    ),
    { ...size },
  );
}
