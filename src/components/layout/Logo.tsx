import { FONT_MONO } from "@/lib/utils";

// Brand mark: an outer ring and an inner disc in signal green, carrying the
// "FK" monogram over a rising-trend arrow in signal ink. The band between ring
// and disc is left transparent on purpose — it shows the surface behind the
// mark, so the logo sits correctly on the nav, the footer, and either theme
// without needing a per-surface fill.
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <circle
        cx="50"
        cy="50"
        r="47"
        fill="none"
        stroke="var(--color-signal)"
        strokeWidth="6"
      />
      <circle cx="50" cy="50" r="40" fill="var(--color-signal)" />

      <text
        x="50"
        y="38"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--color-signal-ink)"
        style={{ fontFamily: FONT_MONO, fontSize: "36px", fontWeight: 700 }}
      >
        FK
      </text>

      {/* lucide "trending-up" geometry, scaled into the lower half of the disc */}
      <g
        transform="translate(26 46) scale(2)"
        fill="none"
        stroke="var(--color-signal-ink)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </g>
    </svg>
  );
}
