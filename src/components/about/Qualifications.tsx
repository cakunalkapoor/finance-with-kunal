import { GraduationCap, Award } from "lucide-react";
import { FONT_MONO } from "@/lib/utils";
import SciFiCard from "@/components/ui/SciFiCard";
import type { EducationItem } from "@/types";

const EDU_COLOR = "#818cf8"; // indigo
const CERT_COLOR = "#34d399"; // green

function flagFor(s: string): string {
  if (/canada|vancouver|\bbc\b|toronto/i.test(s)) return "🇨🇦";
  if (/india|mumbai|delhi|bengaluru|bangalore/i.test(s)) return "🇮🇳";
  return "";
}

function isCertification(e: EducationItem): boolean {
  return (
    e.institution === "Intuit" ||
    /chartered accountant|proadvisor/i.test(e.degree)
  );
}

export default function Qualifications({ education }: { education: EducationItem[] }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-0.5 rounded" style={{ background: "var(--color-neon-cyan)" }} />
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ fontFamily: FONT_MONO, color: "var(--color-neon-cyan)", letterSpacing: "0.14em" }}
        >
          Qualifications
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {education.map((e, i) => {
          const cert = isCertification(e);
          const accent = cert ? CERT_COLOR : EDU_COLOR;
          const Icon = cert ? Award : GraduationCap;
          const flag = flagFor(e.institution);
          return (
            <SciFiCard key={i} cornerAccent className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}1f`, border: `1px solid ${accent}55` }}
                >
                  <Icon size={17} style={{ color: accent }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
                      style={{
                        fontFamily: FONT_MONO,
                        letterSpacing: "0.08em",
                        background: `${accent}26`,
                        color: accent,
                        border: `1px solid ${accent}40`,
                      }}
                    >
                      {cert ? "PROFESSIONAL CERTIFICATION" : "EDUCATION"}
                    </span>
                    {flag && (
                      <span className="text-sm leading-none" aria-hidden="true">
                        {flag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                    {e.degree}
                  </h3>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: accent }}>
                    {e.institution}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ fontFamily: FONT_MONO, color: "var(--color-text-muted)" }}
                  >
                    {e.year}
                  </p>
                  {e.detail && (
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                      {e.detail}
                    </p>
                  )}
                </div>
              </div>
            </SciFiCard>
          );
        })}
      </div>
    </section>
  );
}
