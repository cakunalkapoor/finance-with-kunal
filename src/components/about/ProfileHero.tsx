"use client";

import { Mail, ExternalLink } from "lucide-react";
import { FONT_MONO } from "@/lib/utils";
import SciFiCard from "@/components/ui/SciFiCard";
import type { ProfileData } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  linkedin: ExternalLink,
  mail: Mail,
};

export default function ProfileHero({ data }: { data: ProfileData }) {
  return (
    <SciFiCard glow="purple" className="p-6 sm:p-8 mb-8">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Avatar */}
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl sm:text-3xl font-bold"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(79,70,229,0.35))",
            border: "1px solid rgba(124,58,237,0.4)",
            color: "var(--color-neon-cyan)",
            fontFamily: FONT_MONO,
          }}
        >
          KK
        </div>

        {/* Name + tagline + location */}
        <div className="flex-1 min-w-0">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-1"
            style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
          >
            {data.name}
          </h2>
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: "var(--color-neon-cyan)", fontFamily: FONT_MONO, letterSpacing: "0.05em" }}
          >
            {data.tagline}
          </p>
          <p
            className="text-xs mb-4"
            style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}
          >
            {data.location}
          </p>

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            {data.links.map((link) => {
              const Icon = ICON_MAP[link.icon];
              return (
                <a
                  key={link.label}
                  href={link.url}
                  target={link.url.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all duration-150"
                  style={{
                    background: "rgba(124,58,237,0.1)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    color: "var(--color-text-secondary)",
                    fontFamily: FONT_MONO,
                    letterSpacing: "0.06em",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-neon-cyan)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(124,58,237,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-secondary)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(124,58,237,0.25)";
                  }}
                >
                  {Icon && <Icon size={12} />}
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="my-6 h-px"
        style={{ background: "var(--color-space-border)" }}
      />

      {/* Summary paragraphs */}
      <div className="space-y-3">
        {data.summary.map((para, i) => (
          <p
            key={i}
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {para}
          </p>
        ))}
      </div>
    </SciFiCard>
  );
}
